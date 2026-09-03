import { NextResponse } from "next/server";
import {
  buildDataCenterAttachmentUrl,
  getDataCenterSyncConfig,
  pushMirrorBatch,
} from "@/src/server/dataCenterSync";
import {
  assertEtleConfigured,
  getEtleConfig,
  sendEtleViolation,
} from "@/src/server/etle";
import { hasuraRequest } from "@/src/server/hasura";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VERIFICATION_QUERY = `
  query PublishVerification($id: uuid!) {
    transact_vehicle_status_by_pk(id: $id) {
      id
      site_id
      transact_vehicle_actual_id
      status
      result
      notes
      attachment
      is_violation
      overload_percentage
      is_active
      is_deleted
      created_by
      created_date
      updated_by
      updated_date
      transact_vehicle_actual {
        id
        site_id
        session_id
        anpr_id
        axle_id
        transact_dimension_id
        transact_weighing_id
        transact_cctv_id
        actual_width
        actual_length
        actual_height
        actual_weight
        actual_plat_no
        actual_total_axle
        location_lat
        location_lng
        location_address
        is_active
        is_deleted
        created_by
        created_date
        updated_by
        updated_date
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
          minio_image_object
        }
      }
    }
  }
`;

const WRITEBACK_MUTATION = `
  mutation SaveVerificationPublishResult(
    $id: uuid!
    $set: transact_vehicle_status_set_input!
  ) {
    update_transact_vehicle_status_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
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
  minio_image_object: string | null;
}

interface VehicleActual {
  id: string;
  actual_plat_no: string | null;
  created_date: string | null;
  transact_anpr_capture: AnprCapture | null;
  transact_axle_capture: AxleCapture | null;
  [key: string]: unknown;
}

interface VehicleStatus {
  id: string;
  status: string;
  result: string | null;
  is_violation: boolean | null;
  transact_vehicle_actual: VehicleActual | null;
  [key: string]: unknown;
}

/** Columns the Data Center mirror upsert reads for each table. */
const VEHICLE_ACTUAL_COLUMNS = [
  "id",
  "site_id",
  "session_id",
  "anpr_id",
  "axle_id",
  "transact_dimension_id",
  "transact_weighing_id",
  "transact_cctv_id",
  "actual_width",
  "actual_length",
  "actual_height",
  "actual_weight",
  "actual_plat_no",
  "actual_total_axle",
  "location_lat",
  "location_lng",
  "location_address",
  "is_active",
  "is_deleted",
  "created_by",
  "created_date",
  "updated_by",
  "updated_date",
] as const;

const VEHICLE_STATUS_COLUMNS = [
  "id",
  "site_id",
  "transact_vehicle_actual_id",
  "status",
  "result",
  "notes",
  "attachment",
  "is_violation",
  "overload_percentage",
  "is_active",
  "is_deleted",
  "created_by",
  "created_date",
  "updated_by",
  "updated_date",
] as const;

function pick(
  source: Record<string, unknown>,
  columns: readonly string[],
): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const column of columns) {
    record[column] = source[column] ?? null;
  }
  return record;
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
    const data = await hasuraRequest<{
      transact_vehicle_status_by_pk: VehicleStatus | null;
    }>(VERIFICATION_QUERY, { id: statusId });
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

  const actual = status.transact_vehicle_actual;
  const anpr = actual?.transact_anpr_capture || null;
  const axle = actual?.transact_axle_capture || null;
  const isViolation = status.is_violation === true;

  const etleConfig = getEtleConfig();
  const etle: {
    attempted: boolean;
    ok: boolean;
    statusCode: number | null;
    message: string;
  } = { attempted: false, ok: false, statusCode: null, message: "" };

  // ETLE first, so the row pushed to the Data Center already carries the ETLE outcome.
  if (isViolation && status.status === "verified" && etleConfig.enabled) {
    const configError = assertEtleConfigured(etleConfig);
    if (configError) {
      etle.message = configError;
    } else {
      etle.attempted = true;
      try {
        const result = await sendEtleViolation(etleConfig, {
          plate: (actual?.actual_plat_no || anpr?.plate_no || "").toUpperCase(),
          plateImageUrl: buildDataCenterAttachmentUrl({
            sourceTable: "transact_anpr_capture",
            sourceId: anpr?.id || "",
            attachmentType: "anpr_plate_image",
            sourceObjectKey: anpr?.minio_plate_image_object,
          }),
          vehicleImageUrl: buildDataCenterAttachmentUrl({
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
    }
  } else if (isViolation && !etleConfig.enabled) {
    etle.message = "ETLE_ENABLED is false";
  }

  const now = new Date().toISOString();

  // Push to the Data Center. The sync-agent still mirrors on its interval; this only
  // shortens the delay for the row the operator just verified.
  const dcConfig = getDataCenterSyncConfig();
  const dataCenter: {
    attempted: boolean;
    ok: boolean;
    statusCode: number | null;
    message: string;
  } = { attempted: false, ok: false, statusCode: null, message: "" };

  if (!dcConfig.enabled) {
    dataCenter.message = "DATA_CENTER_SYNC_ENABLED is false";
  } else {
    dataCenter.attempted = true;
    const messages: string[] = [];

    if (actual) {
      const actualResult = await pushMirrorBatch(dcConfig, "transact_vehicle_actual", [
        pick(actual, VEHICLE_ACTUAL_COLUMNS),
      ]);
      messages.push(actualResult.message);
    }

    const statusRecord = pick(status, VEHICLE_STATUS_COLUMNS);
    statusRecord.etle_status_code = etle.attempted ? etle.statusCode : null;
    statusRecord.etle_sent_at = etle.attempted ? now : null;
    statusRecord.updated_date = now;

    const statusResult = await pushMirrorBatch(dcConfig, "transact_vehicle_status", [
      statusRecord,
    ]);
    messages.push(statusResult.message);

    dataCenter.ok = statusResult.ok;
    dataCenter.statusCode = statusResult.statusCode;
    dataCenter.message = messages.join(" | ");
  }

  const set: Record<string, unknown> = {
    dc_sync_status_code: dataCenter.attempted ? dataCenter.statusCode : null,
    dc_sync_message: dataCenter.message ? dataCenter.message.slice(0, 1000) : null,
    dc_synced_at: dataCenter.ok ? now : null,
    updated_date: now,
  };
  if (etle.attempted || etle.message) {
    set.etle_status_code = etle.attempted ? etle.statusCode : null;
    set.etle_message = etle.message ? etle.message.slice(0, 1000) : null;
    set.etle_sent_at = etle.ok ? now : null;
  }

  try {
    await hasuraRequest(WRITEBACK_MUTATION, { id: statusId, set });
  } catch (error) {
    return NextResponse.json(
      {
        error: `failed to save integration result: ${(error as Error).message}`,
        dataCenter,
        etle,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ statusId, isViolation, dataCenter, etle });
}
