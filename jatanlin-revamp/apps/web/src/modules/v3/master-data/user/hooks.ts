"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useGetUsersQuery } from "@/src/graphql/hooks/master-user";
import { useGetRolesQuery } from "@/src/graphql/hooks/master-role";
import { setUser } from "@/src/modules/login/slice";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { getAuthTokenCookie } from "@/src/utils/auth";
import type { Master_User_Bool_Exp } from "@/src/graphql/schema/types";
import type {
  V3UserFilters,
  V3UserFormData,
  V3UserModalState,
  V3UserRow,
} from "./types";

const initialFilters: V3UserFilters = {
  search: "",
  roleId: "",
  status: "",
};

const emptyForm: V3UserFormData = {
  username: "",
  fullName: "",
  badgeNo: "",
  email: "",
  phone: "",
  roleId: "",
  password: "",
  profilePicture: "",
  isActive: true,
};

const DEFAULT_ROWS_PER_PAGE = 10;

function buildWhere(filters: V3UserFilters): Master_User_Bool_Exp {
  const conditions: Master_User_Bool_Exp[] = [];
  const search = filters.search.trim();

  if (search) {
    conditions.push({
      _or: [
        { username: { _ilike: `%${search}%` } },
        { full_name: { _ilike: `%${search}%` } },
        { email: { _ilike: `%${search}%` } },
        { badge_no: { _ilike: `%${search}%` } },
      ],
    });
  }

  if (filters.roleId) {
    conditions.push({ role_id: { _eq: filters.roleId } });
  }

  if (filters.status) {
    conditions.push({ is_active: { _eq: filters.status === "active" } });
  }

  return conditions.length > 0 ? { _and: conditions } : {};
}

function mapUserToForm(user: V3UserRow): V3UserFormData {
  return {
    username: user.username,
    fullName: user.full_name,
    badgeNo: user.badge_no ?? "",
    email: user.email ?? "",
    phone: user.phone_number ?? "",
    roleId: user.role_id,
    password: "",
    profilePicture: user.profile_picture ?? "",
    isActive: Boolean(user.is_active),
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUserStatus(isActive?: boolean | null) {
  return isActive ? "Active" : "Inactive";
}

function getExportRows(users: V3UserRow[], formatDate: typeof formatDateTime) {
  return users.map((user, index) => [
    String(index + 1),
    user.username,
    user.full_name,
    user.badge_no || "-",
    user.email || "-",
    user.phone_number || "-",
    user.master_role.role_name,
    formatUserStatus(user.is_active),
    formatDate(user.updated_date || user.created_date),
  ]);
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function parseApiResponse(response: Response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Backend request failed.");
  }

  return payload;
}

export function getV3UserAvatarUrl(profilePicture?: string | null) {
  if (!profilePicture) return "/polantas.png";
  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || "";
  const cleanPath = profilePicture.startsWith("/")
    ? profilePicture.slice(1)
    : profilePicture;

  return minioUrl ? `${minioUrl}/${cleanPath}` : `/${cleanPath}`;
}

export function useV3MasterUser() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.login.user);
  const [filters, setFilters] = useState<V3UserFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [formData, setFormData] = useState<V3UserFormData>(emptyForm);
  const [modal, setModal] = useState<V3UserModalState>({
    isOpen: false,
    mode: "create",
    user: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const where = useMemo(() => buildWhere(filters), [filters]);
  const usersQuery = useGetUsersQuery({
    variables: { limit: rowsPerPage, offset: page * rowsPerPage, where },
    fetchPolicy: "network-only",
  });
  const rolesQuery = useGetRolesQuery({
    variables: {
      limit: 100,
      offset: 0,
      where: { is_active: { _eq: true } },
    },
    fetchPolicy: "cache-and-network",
  });
  const users = usersQuery.data?.master_user ?? [];
  const roles = rolesQuery.data?.master_role ?? [];
  const isSubmitting = isSavingUser;
  const totalCount =
    usersQuery.data?.master_user_aggregate.aggregate?.count ?? 0;
  const startRow = totalCount === 0 ? 0 : page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalCount);
  const totalPages = Math.max(Math.ceil(totalCount / rowsPerPage), 1);

  const updateFilter = (field: keyof V3UserFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const updateForm = (field: keyof V3UserFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormError(null);
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setFormError(null);
    setUploadError(null);
    setModal({ isOpen: true, mode: "create", user: null });
  };

  const openEditModal = (user: V3UserRow) => {
    setFormData(mapUserToForm(user));
    setFormError(null);
    setUploadError(null);
    setModal({ isOpen: true, mode: "edit", user });
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModal((current) => ({ ...current, isOpen: false }));
    setFormError(null);
    setUploadError(null);
  };

  const changeRowsPerPage = (value: string) => {
    setRowsPerPage(Number(value));
    setPage(0);
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(current - 1, 0));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(current + 1, totalPages - 1));
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Please upload a JPG or PNG image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Photo size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/attachment/upload`;
    const uploadBody = new FormData();
    uploadBody.append("image", file);
    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthTokenCookie() || ""}`,
        },
        body: uploadBody,
      });
      const result = await response.json();

      if (result.success && result.file_path) {
        updateForm("profilePicture", result.file_path);
      } else {
        setUploadError(result.message || "Unable to upload photo.");
      }
    } catch {
      setUploadError("Unable to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) return "Username is required.";
    if (!formData.fullName.trim()) return "Full name is required.";
    if (!formData.roleId) return "Role is required.";
    if (modal.mode === "create" && !formData.password.trim()) {
      return "Password is required.";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Email format is invalid.";
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const token = getAuthTokenCookie();
    const sharedInput = {
      username: formData.username.trim(),
      full_name: formData.fullName.trim(),
      badge_no: formData.badgeNo.trim() || null,
      email: formData.email.trim() || null,
      phone_number: formData.phone.trim() || null,
      role_id: formData.roleId,
      profile_picture: formData.profilePicture.trim() || null,
      is_active: formData.isActive,
    };

    setIsSavingUser(true);
    try {
      if (modal.mode === "edit" && modal.user) {
        const response = await fetch(`${apiUrl}/api/users/${modal.user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({
            ...sharedInput,
            ...(formData.password.trim()
              ? { password: formData.password.trim() }
              : {}),
          }),
        });
        await parseApiResponse(response);
      } else {
        const response = await fetch(`${apiUrl}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({
            ...sharedInput,
            password: formData.password.trim(),
          }),
        });
        await parseApiResponse(response);
      }

      const refetchResult = await usersQuery.refetch();
      if (modal.mode === "edit" && modal.user?.id === currentUser?.id) {
        const updatedCurrentUser = refetchResult.data?.master_user.find(
          (row) => row.id === currentUser?.id,
        );
        if (updatedCurrentUser) {
          dispatch(
            setUser({
              id: updatedCurrentUser.id,
              code: updatedCurrentUser.code,
              badge_no: updatedCurrentUser.badge_no ?? null,
              username: updatedCurrentUser.username,
              email: updatedCurrentUser.email ?? null,
              full_name: updatedCurrentUser.full_name,
              profile_picture: updatedCurrentUser.profile_picture ?? null,
              is_active: updatedCurrentUser.is_active ?? null,
              master_role: {
                id: updatedCurrentUser.master_role.id,
                code: updatedCurrentUser.master_role.code,
                role_name: updatedCurrentUser.master_role.role_name,
                description: updatedCurrentUser.master_role.description ?? null,
              },
            }),
          );
        }
      }
      closeModal();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save user data.",
      );
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDelete = async (user: V3UserRow) => {
    const confirmed = window.confirm(
      `Delete user "${user.username}"? This action will deactivate the user.`,
    );
    if (!confirmed) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const token = getAuthTokenCookie();
    setIsDeletingUser(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      await parseApiResponse(response);
      await usersQuery.refetch();
    } catch (deleteError) {
      setFormError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete user.",
      );
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    const headers = [
      "No",
      "Username",
      "Full Name",
      "Badge No",
      "Email",
      "Phone",
      "Role",
      "Status",
      "Last Updated",
    ];
    const rows = getExportRows(users, formatDateTime);

    if (rows.length === 0) {
      window.alert("No user data to export.");
      return;
    }

    if (format === "csv") {
      downloadCsv("master-data-users.csv", [headers, ...rows]);
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Master Data Users", 14, 14);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [29, 78, 216] },
    });
    doc.save("master-data-users.pdf");
  };

  const inputChange =
    (field: keyof V3UserFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        event.target.type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      updateForm(field, value);
    };

  return {
    filters,
    users,
    roles,
    modal,
    formData,
    formError,
    uploadError,
    isUploadingPhoto,
    isLoading: usersQuery.loading || rolesQuery.loading,
    isSubmitting,
    isDeleting: isDeletingUser,
    error: usersQuery.error?.message || rolesQuery.error?.message || null,
    page,
    rowsPerPage,
    totalCount,
    startRow,
    endRow,
    totalPages,
    formatDateTime,
    updateFilter,
    changeRowsPerPage,
    goToPreviousPage,
    goToNextPage,
    inputChange,
    updateForm,
    openCreateModal,
    openEditModal,
    closeModal,
    handlePhotoUpload,
    handleSubmit,
    handleDelete,
    handleExport,
  };
}
