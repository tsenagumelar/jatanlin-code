import type { GetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";

export type V3VehicleClassRow = NonNullable<
  GetVehicleClassesQuery["master_vehicle_class"][0]
>;

export interface V3VehicleClassFilters {
  search: string;
  status: string;
}

export interface V3VehicleClassFormData {
  type: string;
  description: string;
  totalAxle: number;
  class2Weight: number;
  class3Weight: number;
  length: number;
  width: number;
  height: number;
  image: string;
  isActive: boolean;
}

export type V3VehicleClassModalMode = "create" | "edit";

export interface V3VehicleClassModalState {
  isOpen: boolean;
  mode: V3VehicleClassModalMode;
  vehicleClass: V3VehicleClassRow | null;
}
