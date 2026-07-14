/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useGetVehicleActualsQuery } from '@/src/graphql/hooks/transact-vehicle-actual';
import type { VehicleActualFilterData } from './types';

export const useVehicleActualList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<VehicleActualFilterData>({
    search: '',
    status: '',
    start_date: '',
    end_date: '',
  });

  // Build where condition
  const buildWhereCondition = () => {
    const conditions: any[] = [];

    if (filters.search) {
      conditions.push({
        _or: [
          { actual_plat_no: { _ilike: `%${filters.search}%` } },
          { transact_anpr_capture: { plate_no: { _ilike: `%${filters.search}%` } } },
        ],
      });
    }

    if (filters.status) {
      conditions.push({
        transact_vehicle_statuses: {
          status: { _eq: filters.status },
        },
      });
    }

    if (filters.start_date && filters.end_date) {
      conditions.push({
        created_date: {
          _gte: filters.start_date,
          _lte: filters.end_date,
        },
      });
    }

    return conditions.length > 0 ? { _and: conditions } : {};
  };

  const { data, loading, error, refetch } = useGetVehicleActualsQuery({
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      where: buildWhereCondition(),
    },
    fetchPolicy: 'network-only',
  });

  const vehicleActuals = data?.transact_vehicle_actual || [];
  const totalCount =
    data?.transact_vehicle_actual_aggregate?.aggregate?.count || 0;

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleFilterChange = (newFilters: Partial<VehicleActualFilterData>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    vehicleActuals,
    totalCount,
    loading,
    error,
    page,
    rowsPerPage,
    filters,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    handleRefresh,
  };
};
