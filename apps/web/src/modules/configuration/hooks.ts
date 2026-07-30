/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  useGetConfigsQuery,
  useUpdateConfigMutation,
} from '@/src/graphql/hooks/configuration';
import { useAppSelector } from '@/src/redux/hooks';
import type { ConfigFormData, ConfigFilterData } from './types';

export const useConfigList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<ConfigFilterData>({
    search: '',
    config_type: '',
    is_active: '',
  });

  // Build where condition
  const buildWhereCondition = () => {
    const conditions: any[] = [];

    conditions.push({ config_type: { _eq: 'apps' } });

    if (filters.search) {
      conditions.push({
        _or: [
          { code: { _ilike: `%${filters.search}%` } },
          { config_key: { _ilike: `%${filters.search}%` } },
          { config_value: { _ilike: `%${filters.search}%` } },
          { description: { _ilike: `%${filters.search}%` } },
        ],
      });
    }

    if (filters.config_type) {
      conditions.push({ config_type: { _eq: filters.config_type } });
    }

    if (filters.is_active !== '') {
      conditions.push({ is_active: { _eq: filters.is_active === 'true' } });
    }

    return conditions.length > 0 ? { _and: conditions } : {};
  };

  const { data, loading, error, refetch } = useGetConfigsQuery({
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      where: buildWhereCondition(),
    },
    fetchPolicy: 'network-only',
  });

  const configs = data?.master_config || [];
  const totalCount = data?.master_config_aggregate?.aggregate?.count || 0;

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleFilterChange = (newFilters: Partial<ConfigFilterData>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    configs,
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

export const useConfigEdit = (configId?: string, onSuccess?: () => void) => {
  const currentUser = useAppSelector((state) => state.login?.user);
  const [formData, setFormData] = useState<ConfigFormData>({
    config_value: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [updateConfig] = useUpdateConfigMutation();

  const handleChange = (value: string) => {
    setFormData({ config_value: value });
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!formData?.config_value || !formData.config_value.trim()) {
      setFormError('Nilai konfigurasi harus diisi');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const isValid = validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      if (configId) {
        await updateConfig({
          variables: {
            id: configId,
            set: {
              config_value: formData.config_value,
              updated_by: currentUser?.id,
              updated_date: 'now()',
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
      config_value: '',
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
