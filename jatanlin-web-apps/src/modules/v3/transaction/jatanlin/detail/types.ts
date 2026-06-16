import type { GetVehicleActualByIdQuery } from "@/src/graphql/hooks/transact-vehicle-actual";

export type V3JatanlinDetailRecord = NonNullable<
  GetVehicleActualByIdQuery["transact_vehicle_actual_by_pk"]
>;

export interface V3JatanlinDetailProps {
  id: string;
}

export interface V3DetailField {
  label: string;
  value: string;
}

export interface V3DetailMetric {
  label: string;
  value: string;
  helper: string;
  tone: string;
}

export interface V3MediaItem {
  title: string;
  subtitle: string;
  url: string;
  type: "image" | "video";
}
