/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  useGetVehicleClassesQuery,
  useInsertVehicleClassMutation,
  useUpdateVehicleClassMutation,
  useSoftDeleteVehicleClassMutation,
  useCheckVehicleClassCodeExistsLazyQuery,
  useCheckVehicleClassTypeExistsLazyQuery,
} from '@/src/graphql/hooks/master-vehicle-class';
import { useAppSelector } from '@/src/redux/hooks';
import type { VehicleClassFormData, VehicleClassFilterData } from './types';

export const useVehicleClassList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<VehicleClassFilterData>({
    search: '',
    is_active: '',
  });

  // Build where condition
  const buildWhereCondition = () => {
    const conditions: any[] = [];

    if (filters.search) {
      conditions.push({
        _or: [
          { code: { _ilike: `%${filters.search}%` } },
          { type: { _ilike: `%${filters.search}%` } },
          { description: { _ilike: `%${filters.search}%` } },
        ],
      });
    }

    if (filters.is_active !== '') {
      conditions.push({ is_active: { _eq: filters.is_active === 'true' } });
    }

    return conditions.length > 0 ? { _and: conditions } : {};
  };

  const { data, loading, error, refetch } = useGetVehicleClassesQuery({
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      where: buildWhereCondition(),
    },
    fetchPolicy: 'network-only',
  });

  const vehicleClasses = data?.master_vehicle_class || [];
  const totalCount =
    data?.master_vehicle_class_aggregate?.aggregate?.count || 0;

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleFilterChange = (newFilters: Partial<VehicleClassFilterData>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    vehicleClasses,
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

export const useVehicleClassForm = (
  vehicleClassId?: string,
  onSuccess?: () => void
) => {
  const currentUser = useAppSelector((state) => state.login.user);
  const [formData, setFormData] = useState<VehicleClassFormData>({
    type: '',
    description: '',
    total_axle: 0,
    class_2_weight: 0,
    class_3_weight: 0,
    length: 0,
    width: 0,
    height: 0,
    image: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [insertVehicleClass] = useInsertVehicleClassMutation();
  const [updateVehicleClass] = useUpdateVehicleClassMutation();
  const [checkCode] = useCheckVehicleClassCodeExistsLazyQuery();
  const [checkType] = useCheckVehicleClassTypeExistsLazyQuery();

  const handleChange = (field: keyof VehicleClassFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setFormError(null);
  };

  const validateForm = async (): Promise<boolean> => {
    if (!formData?.type || !formData.type.trim()) {
      setFormError('Tipe kendaraan harus diisi');
      return false;
    }

    if (!formData?.description || !formData.description.trim()) {
      setFormError('Deskripsi harus diisi');
      return false;
    }

    if (!formData?.total_axle || formData.total_axle <= 0) {
      setFormError('Jumlah gandar harus lebih dari 0');
      return false;
    }

    if (formData.class_2_weight < 0) {
      setFormError('Berat kelas 2 tidak boleh negatif');
      return false;
    }

    if (formData.class_3_weight < 0) {
      setFormError('Berat kelas 3 tidak boleh negatif');
      return false;
    }

    if (formData.length < 0) {
      setFormError('Panjang tidak boleh negatif');
      return false;
    }

    if (formData.width < 0) {
      setFormError('Lebar tidak boleh negatif');
      return false;
    }

    if (formData.height < 0) {
      setFormError('Tinggi tidak boleh negatif');
      return false;
    }

    // Check type availability (only for new vehicle class)
    if (!vehicleClassId) {
      try {
        const { data } = await checkType({
          variables: { type: formData.type },
        });

        if (
          data?.master_vehicle_class &&
          data.master_vehicle_class.length > 0
        ) {
          setFormError('Tipe kendaraan sudah digunakan');
          return false;
        }
      } catch (error) {
        console.error('Error checking type:', error);
        // Continue with validation even if check fails
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      if (vehicleClassId) {
        // Update vehicle class
        const updateData: any = {
          type: formData.type,
          description: formData.description,
          total_axle: formData.total_axle,
          class_2_weight: formData.class_2_weight,
          class_3_weight: formData.class_3_weight,
          length: formData.length,
          width: formData.width,
          height: formData.height,
          image: formData.image || null,
          is_active: formData.is_active,
          updated_by: currentUser?.id,
          updated_date: 'now()',
        };

        await updateVehicleClass({
          variables: {
            id: vehicleClassId,
            set: updateData,
          },
        });
      } else {
        // Insert new vehicle class
        await insertVehicleClass({
          variables: {
            object: {
              type: formData.type,
              description: formData.description,
              total_axle: formData.total_axle,
              class_2_weight: formData.class_2_weight,
              class_3_weight: formData.class_3_weight,
              length: formData.length,
              width: formData.width,
              height: formData.height,
              image: formData.image || null,
              is_active: formData.is_active,
              created_by: currentUser?.id,
              created_date: 'now()',
            },
          },
        });
      }

      onSuccess?.();
    } catch (error: any) {
      setFormError(error.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      description: '',
      total_axle: 0,
      class_2_weight: 0,
      class_3_weight: 0,
      length: 0,
      width: 0,
      height: 0,
      image: '',
      is_active: true,
    });
    setFormError(null);
  };

  return {
    formData,
    isSubmitting,
    formError,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
  };
};

export const useVehicleClassDelete = () => {
  const currentUser = useAppSelector((state) => state.login.user);
  const [softDeleteVehicleClass] = useSoftDeleteVehicleClassMutation();

  const deleteVehicleClass = async (
    vehicleClassId: string,
    onSuccess?: () => void
  ) => {
    try {
      await softDeleteVehicleClass({
        variables: {
          id: vehicleClassId,
          updated_by: currentUser?.id || '',
        },
      });
      onSuccess?.();
    } catch (error: any) {
      throw new Error(error.message || 'Gagal menghapus kelas kendaraan');
    }
  };

  return { deleteVehicleClass };
};
