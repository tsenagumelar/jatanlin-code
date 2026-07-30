import type { GetVehicleActualsQuery } from '@/src/graphql/hooks/transact-vehicle-actual';

// Vehicle Actual types
export type VehicleActualData = NonNullable<
  GetVehicleActualsQuery['transact_vehicle_actual'][0]
>;

export interface VehicleActualFilterData {
  search: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface JatanlinModuleProps {
  // Props for JatanlinModule component if needed
}
