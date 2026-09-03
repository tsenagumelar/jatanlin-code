import { NextResponse } from "next/server";
import { gql } from "@apollo/client";
import { apolloClient } from "@/src/graphql/apollo-client";
import { UpdateVehicleStatusDocument } from "@/src/graphql/hooks/transact-vehicle-status";
import {
  assertEtleConfigured,
  buildAttachmentImageUrl,
  getEtleConfig,
  sendEtleViolation,
} from "@/src/utils/etle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Narrower than VehicleStatusDetailsFragment: only the fields ETLE actually needs,
// including actual_plat_no (the officer-corrected plate) which that fragment omits.
const VERIFICATION_FOR_ETLE_QUERY = gql`
  query VerificationForEtle($id: uuid!) {
    transact_vehicle_status_by_pk(id: $id) {
      id
      status
      result
      is_violation
      transact_vehicle_actual {
        id
        actual_plat_no
        created_date
        transact_anpr_capture {
          id
          plate_no
          captured_at
          minio_full_image_object
          minio_plate_image_object
        }
        transact_axle_capture {
          id
          captured_at
          vehicle_category
          vehicle_body_type
        }
      }
    }
  }
`;

interface AnprCapture {
  id: string;
  plate_no: string | null;
  captured_at: string | null;
  minio_full_image_object: string | null;
  minio_plate_image_object: string | null;
}

interface AxleCapture {
  id: string;
  captured_at: string | null;
  vehicle_category: string | null;
  vehicle_body_type: string | null;
}

interface VehicleActual {
  id: string;
  actual_plat_no: string | null;
  created_date: string | null;
  transact_anpr_capture: AnprCapture | null;
  transact_axle_capture: AxleCapture | null;
}

interface VehicleStatus {
  id: string;
  status: string;
  result: string | null;
  is_violation: boolean | null;
  transact_vehicle_actual: VehicleActual | null;
}

function toEpochMillis(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function POST(request: Request) {
  let statusId: string;
  try {
    const body = (await request.json()) as { statusId?: string };
    statusId = (body.statusId || "").trim();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  if (!statusId) {
    return NextResponse.json({ error: "statusId is required" }, { status: 400 });
  }

  let status: VehicleStatus | null;
  try {
    const { data } = await apolloClient.query<{
      transact_vehicle_status_by_pk: VehicleStatus | null;
    }>({
      query: VERIFICATION_FOR_ETLE_QUERY,
      variables: { id: statusId },
      fetchPolicy: "network-only",
    });
    status = data.transact_vehicle_status_by_pk;
  } catch (error) {
    return NextResponse.json(
      { error: `failed to load verification: ${(error as Error).message}` },
      { status: 502 },
    );
  }

  if (!status) {
    return NextResponse.json({ error: "verification not found" }, { status: 404 });
  }

  const isViolation = status.is_violation === true;
  if (!isViolation || status.status !== "verified") {
    return NextResponse.json({
      statusId,
      isViolation,
      etle: { attempted: false, ok: false, statusCode: null, message: "not a verified violation" },
    });
  }

  const etleConfig = getEtleConfig();
  if (!etleConfig.enabled) {
    return NextResponse.json({
      statusId,
      isViolation,
      etle: { attempted: false, ok: false, statusCode: null, message: "ETLE_ENABLED is false" },
    });
  }

  const configError = assertEtleConfigured(etleConfig);
  if (configError) {
    return NextResponse.json({
      statusId,
      isViolation,
      etle: { attempted: false, ok: false, statusCode: null, message: configError },
    });
  }

  const actual = status.transact_vehicle_actual;
  const anpr = actual?.transact_anpr_capture || null;
  const axle = actual?.transact_axle_capture || null;

  const etle: {
    attempted: boolean;
    ok: boolean;
    statusCode: number | null;
    message: string;
  } = { attempted: true, ok: false, statusCode: null, message: "" };

  try {
    const result = await sendEtleViolation(etleConfig, {
      plate: (actual?.actual_plat_no || anpr?.plate_no || "").toUpperCase(),
      plateImageUrl: buildAttachmentImageUrl({
        sourceTable: "transact_anpr_capture",
        sourceId: anpr?.id || "",
        attachmentType: "anpr_plate_image",
        sourceObjectKey: anpr?.minio_plate_image_object,
      }),
      vehicleImageUrl: buildAttachmentImageUrl({
        sourceTable: "transact_anpr_capture",
        sourceId: anpr?.id || "",
        attachmentType: "anpr_full_image",
        sourceObjectKey: anpr?.minio_full_image_object,
      }),
      vehicleType: axle?.vehicle_category || axle?.vehicle_body_type || "-",
      captureTime:
        toEpochMillis(anpr?.captured_at) ??
        toEpochMillis(axle?.captured_at) ??
        toEpochMillis(actual?.created_date) ??
        Date.now(),
    });
    etle.ok = result.ok;
    etle.statusCode = result.statusCode;
    etle.message = result.message;
  } catch (error) {
    etle.message = (error as Error).message;
  }

  const now = new Date().toISOString();
  try {
    await apolloClient.mutate({
      mutation: UpdateVehicleStatusDocument,
      variables: {
        id: statusId,
        set: {
          etle_status_code: etle.statusCode,
          etle_message: etle.message.slice(0, 1000),
          etle_sent_at: etle.ok ? now : null,
          updated_date: now,
          // Fields above aren't in the generated Transact_Vehicle_Status_Set_Input type yet -
          // re-run graphql-codegen after the migration + a Hasura metadata reload to drop this cast.
        } as Record<string, unknown>,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `failed to save ETLE result: ${(error as Error).message}`,
        etle,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ statusId, isViolation, etle });
}
