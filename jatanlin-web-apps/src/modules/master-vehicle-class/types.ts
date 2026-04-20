import type {
  GetVehicleClassesQuery,
} from '@/src/graphql/hooks/master-vehicle-class';

// Vehicle Class types
export type VehicleClassData = NonNullable<
  GetVehicleClassesQuery['master_vehicle_class'][0]
>;

export interface VehicleClassFormData {
  type: string;
  description: string;
  total_axle: number;
  class_2_weight: number;
  class_3_weight: number;
  length: number;
  width: number;
  height: number;
  image?: string;
  is_active: boolean;
}

export interface VehicleClassFilterData {
  search: string;
  is_active: string;
}

export interface MasterVehicleClassModuleProps {
  // Props for MasterVehicleClassModule component if needed
}
