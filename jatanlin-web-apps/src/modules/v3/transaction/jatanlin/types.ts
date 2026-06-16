import type { GetVehicleActualsQuery } from "@/src/graphql/hooks/transact-vehicle-actual";

export type V3JatanlinRow = NonNullable<
  GetVehicleActualsQuery["transact_vehicle_actual"][0]
> & {
  violationType: string;
  latestStatus: string;
};

export interface V3JatanlinFilters {
  search: string;
  violation: string;
  startDate: string;
  endDate: string;
}
