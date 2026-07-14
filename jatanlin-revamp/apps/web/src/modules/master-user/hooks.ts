/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  useGetUsersQuery,
  useInsertUserMutation,
  useUpdateUserMutation,
  useSoftDeleteUserMutation,
  useCheckUsernameExistsLazyQuery,
} from "@/src/graphql/hooks/master-user";
import { useAppSelector } from "@/src/redux/hooks";
import type { UserFormData, UserFilterData } from "./types";
import { useGetRolesQuery } from "@/src/graphql/hooks/master-role";

export const useUserList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<UserFilterData>({
    search: "",
    role_id: "",
    is_active: "",
  });

  // Build where condition
  const buildWhereCondition = () => {
    const conditions: any[] = [];

    if (filters.search) {
      conditions.push({
        _or: [
          { username: { _ilike: `%${filters.search}%` } },
          { full_name: { _ilike: `%${filters.search}%` } },
          { email: { _ilike: `%${filters.search}%` } },
        ],
      });
    }

    if (filters.role_id) {
      conditions.push({ role_id: { _eq: filters.role_id } });
    }

    if (filters.is_active !== "") {
      conditions.push({ is_active: { _eq: filters.is_active === "true" } });
    }

    return conditions.length > 0 ? { _and: conditions } : {};
  };

  const { data, loading, error, refetch } = useGetUsersQuery({
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      where: buildWhereCondition(),
    },
    fetchPolicy: "network-only",
  });

  const users = data?.master_user || [];
  const totalCount = data?.master_user_aggregate?.aggregate?.count || 0;

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleFilterChange = (newFilters: Partial<UserFilterData>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    users,
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

export const useUserForm = (userId?: string, onSuccess?: () => void) => {
  const currentUser = useAppSelector((state) => state.login.user);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    full_name: "",
    badge_no: "",
    phone_number: "",
    email: "",
    role_id: "",
    password_hash: "",
    is_active: true,
    profile_picture: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [insertUser] = useInsertUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [checkUsername] = useCheckUsernameExistsLazyQuery();

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setFormError(null);
  };

  const validateForm = async (): Promise<boolean> => {
    if (!formData.username.trim()) {
      setFormError("Nama pengguna harus diisi");
      return false;
    }

    if (!formData.full_name.trim()) {
      setFormError("Nama lengkap harus diisi");
      return false;
    }

    if (!formData.role_id) {
      setFormError("Peran harus dipilih");
      return false;
    }

    if (!userId && !formData.password_hash.trim()) {
      setFormError("Kata sandi harus diisi");
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError("Format email tidak valid");
      return false;
    }

    // Check username availability (only for new user or if username changed)
    const { data } = await checkUsername({
      variables: { username: formData.username },
    });

    if (data?.master_user && data.master_user.length > 0 && !userId) {
      setFormError("Nama pengguna sudah digunakan");
      return false;
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

      if (userId) {
        // Update user
        const updateData: any = {
          full_name: formData.full_name,
          badge_no: formData.badge_no || null,
          phone_number: formData.phone_number || null,
          email: formData.email || null,
          role_id: formData.role_id,
          is_active: formData.is_active,
          profile_picture: formData.profile_picture || null,
          updated_by: currentUser?.id,
          updated_date: "now()",
        };

        // Only update password if provided
        if (formData.password_hash.trim()) {
          updateData.password_hash = formData.password_hash;
        }

        await updateUser({
          variables: {
            id: userId,
            set: updateData,
          },
        });
      } else {
        // Insert new user
        await insertUser({
          variables: {
            object: {
              username: formData.username,
              full_name: formData.full_name,
              badge_no: formData.badge_no || null,
              phone_number: formData.phone_number || null,
              email: formData.email || null,
              role_id: formData.role_id,
              password_hash: formData.password_hash,
              is_active: formData.is_active,
              profile_picture: formData.profile_picture || null,
              created_by: currentUser?.id,
              created_date: "now()",
            },
          },
        });
      }

      onSuccess?.();
    } catch (error: any) {
      setFormError(error.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      full_name: "",
      badge_no: "",
      phone_number: "",
      email: "",
      role_id: "",
      password_hash: "",
      is_active: true,
      profile_picture: "",
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

export const useUserDelete = () => {
  const currentUser = useAppSelector((state) => state.login.user);
  const [softDeleteUser] = useSoftDeleteUserMutation();

  const deleteUser = async (userId: string, onSuccess?: () => void) => {
    try {
      await softDeleteUser({
        variables: {
          id: userId,
          updated_by: currentUser?.id || "",
        },
      });
      onSuccess?.();
    } catch (error: any) {
      throw new Error(error.message || "Gagal menghapus user");
    }
  };

  return { deleteUser };
};

export const useRoleOptions = () => {
  const { data, loading } = useGetRolesQuery({
    variables: {
      limit: 100,
      offset: 0,
      where: { is_active: { _eq: true } },
    },
  });

  const roles = data?.master_role || [];

  return { roles, loading };
};
