"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useGetVehicleClassesQuery,
  useInsertVehicleClassMutation,
  useSoftDeleteVehicleClassMutation,
  useUpdateVehicleClassMutation,
} from "@/src/graphql/hooks/master-vehicle-class";
import { useAppSelector } from "@/src/redux/hooks";
import { getAuthTokenCookie } from "@/src/utils/auth";
import type { Master_Vehicle_Class_Bool_Exp } from "@/src/graphql/schema/types";
import type {
  V3VehicleClassFilters,
  V3VehicleClassFormData,
  V3VehicleClassModalState,
  V3VehicleClassRow,
} from "./types";

const DEFAULT_ROWS_PER_PAGE = 10;

const initialFilters: V3VehicleClassFilters = {
  search: "",
  status: "",
};

const emptyForm: V3VehicleClassFormData = {
  type: "",
  description: "",
  totalAxle: 0,
  class2Weight: 0,
  class3Weight: 0,
  length: 0,
  width: 0,
  height: 0,
  image: "",
  isActive: true,
};

function buildWhere(
  filters: V3VehicleClassFilters,
): Master_Vehicle_Class_Bool_Exp {
  const conditions: Master_Vehicle_Class_Bool_Exp[] = [];
  const search = filters.search.trim();

  if (search) {
    conditions.push({
      _or: [
        { code: { _ilike: `%${search}%` } },
        { type: { _ilike: `%${search}%` } },
        { description: { _ilike: `%${search}%` } },
      ],
    });
  }

  if (filters.status) {
    conditions.push({ is_active: { _eq: filters.status === "active" } });
  }

  return conditions.length > 0 ? { _and: conditions } : {};
}

function mapVehicleClassToForm(
  vehicleClass: V3VehicleClassRow,
): V3VehicleClassFormData {
  return {
    type: vehicleClass.type,
    description: vehicleClass.description,
    totalAxle: Number(vehicleClass.total_axle || 0),
    class2Weight: Number(vehicleClass.class_2_weight || 0),
    class3Weight: Number(vehicleClass.class_3_weight || 0),
    length: Number(vehicleClass.length || 0),
    width: Number(vehicleClass.width || 0),
    height: Number(vehicleClass.height || 0),
    image: vehicleClass.image ?? "",
    isActive: Boolean(vehicleClass.is_active),
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

function formatNumber(value?: number | string | null) {
  const numericValue = Number(value || 0);
  return numericValue.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

function formatWeight(row: V3VehicleClassRow) {
  const class2 = formatNumber(row.class_2_weight);
  const class3 = formatNumber(row.class_3_weight);

  if (row.total_axle >= 6) return `${class2} kg / axle`;
  if (Number(row.class_2_weight) === Number(row.class_3_weight)) {
    return `± ${class2} kg`;
  }
  return `${class2} kg - ${class3} kg`;
}

function formatDimensions(row: V3VehicleClassRow) {
  return `${formatNumber(row.length)} x ${formatNumber(row.width)} x ${formatNumber(row.height)} m`;
}

function formatStatus(isActive?: boolean | null) {
  return isActive ? "Active" : "Inactive";
}

function getExportRows(rows: V3VehicleClassRow[]) {
  return rows.map((row, index) => [
    String(index + 1),
    row.code,
    row.type,
    row.description,
    String(row.total_axle >= 6 ? ">= 6" : row.total_axle),
    formatWeight(row),
    formatDimensions(row),
    formatStatus(row.is_active),
    formatDateTime(row.updated_date || row.created_date),
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

export function getV3VehicleClassImageUrl(image?: string | null) {
  if (!image) return "/polantas.png";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || "";
  const cleanPath = image.startsWith("/") ? image.slice(1) : image;

  return minioUrl ? `${minioUrl}/${cleanPath}` : `/${cleanPath}`;
}

export function useV3VehicleClasses() {
  const currentUser = useAppSelector((state) => state.login.user);
  const [filters, setFilters] = useState<V3VehicleClassFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [formData, setFormData] =
    useState<V3VehicleClassFormData>(emptyForm);
  const [modal, setModal] = useState<V3VehicleClassModalState>({
    isOpen: false,
    mode: "create",
    vehicleClass: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const where = useMemo(() => buildWhere(filters), [filters]);
  const vehicleClassesQuery = useGetVehicleClassesQuery({
    variables: { limit: rowsPerPage, offset: page * rowsPerPage, where },
    fetchPolicy: "network-only",
  });
  const [insertVehicleClass, insertState] = useInsertVehicleClassMutation();
  const [updateVehicleClass, updateState] = useUpdateVehicleClassMutation();
  const [softDeleteVehicleClass, deleteState] =
    useSoftDeleteVehicleClassMutation();

  const vehicleClasses = vehicleClassesQuery.data?.master_vehicle_class ?? [];
  const totalCount =
    vehicleClassesQuery.data?.master_vehicle_class_aggregate.aggregate?.count ??
    0;
  const totalPages = Math.max(Math.ceil(totalCount / rowsPerPage), 1);
  const startRow = totalCount === 0 ? 0 : page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalCount);
  const isSubmitting = insertState.loading || updateState.loading;

  const updateFilter = (field: keyof V3VehicleClassFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const updateForm = (
    field: keyof V3VehicleClassFormData,
    value: string | number | boolean,
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormError(null);
  };

  const inputChange =
    (field: keyof V3VehicleClassFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        event.target.type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : event.target.type === "number"
            ? Number(event.target.value)
            : event.target.value;
      updateForm(field, value);
    };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setFormError(null);
    setUploadError(null);
    setModal({ isOpen: true, mode: "create", vehicleClass: null });
  };

  const openEditModal = (vehicleClass: V3VehicleClassRow) => {
    setFormData(mapVehicleClassToForm(vehicleClass));
    setFormError(null);
    setUploadError(null);
    setModal({ isOpen: true, mode: "edit", vehicleClass });
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

  const validateForm = () => {
    if (!formData.type.trim()) return "Vehicle type is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (formData.totalAxle <= 0) return "Total axle must be greater than 0.";
    if (formData.class2Weight < 0) return "Minimum weight cannot be negative.";
    if (formData.class3Weight < 0) return "Maximum weight cannot be negative.";
    if (formData.length < 0) return "Length cannot be negative.";
    if (formData.width < 0) return "Width cannot be negative.";
    if (formData.height < 0) return "Height cannot be negative.";
    return null;
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Please upload a JPG or PNG image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    const apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/attachment/upload`;
    const uploadBody = new FormData();
    uploadBody.append("image", file);
    setIsUploadingImage(true);
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
        updateForm("image", result.file_path);
      } else {
        setUploadError(result.message || "Unable to upload image.");
      }
    } catch {
      setUploadError("Unable to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const input = {
      type: formData.type.trim(),
      description: formData.description.trim(),
      total_axle: formData.totalAxle,
      class_2_weight: formData.class2Weight,
      class_3_weight: formData.class3Weight,
      length: formData.length,
      width: formData.width,
      height: formData.height,
      image: formData.image.trim() || null,
      is_active: formData.isActive,
    };

    try {
      if (modal.mode === "edit" && modal.vehicleClass) {
        await updateVehicleClass({
          variables: {
            id: modal.vehicleClass.id,
            set: {
              ...input,
              updated_by: currentUser?.id,
              updated_date: "now()",
            },
          },
        });
      } else {
        await insertVehicleClass({
          variables: {
            object: {
              ...input,
              created_by: currentUser?.id,
              created_date: "now()",
            },
          },
        });
      }

      await vehicleClassesQuery.refetch();
      closeModal();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save vehicle class.",
      );
    }
  };

  const handleDelete = async (vehicleClass: V3VehicleClassRow) => {
    const confirmed = window.confirm(
      `Delete vehicle class "${vehicleClass.type}"? This action will deactivate it.`,
    );
    if (!confirmed) return;

    try {
      await softDeleteVehicleClass({
        variables: {
          id: vehicleClass.id,
          updated_by: currentUser?.id || vehicleClass.id,
        },
      });
      await vehicleClassesQuery.refetch();
    } catch (deleteError) {
      setFormError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete vehicle class.",
      );
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    const headers = [
      "No",
      "Code",
      "Type",
      "Description",
      "Total Axle",
      "Weight",
      "Dimensions",
      "Status",
      "Last Updated",
    ];
    const rows = getExportRows(vehicleClasses);

    if (rows.length === 0) {
      window.alert("No vehicle class data to export.");
      return;
    }

    if (format === "csv") {
      downloadCsv("vehicle-classes.csv", [headers, ...rows]);
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Vehicle Classes", 14, 14);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [29, 78, 216] },
    });
    doc.save("vehicle-classes.pdf");
  };

  return {
    filters,
    vehicleClasses,
    modal,
    formData,
    formError,
    uploadError,
    page,
    rowsPerPage,
    totalCount,
    totalPages,
    startRow,
    endRow,
    isLoading: vehicleClassesQuery.loading,
    isSubmitting,
    isDeleting: deleteState.loading,
    isUploadingImage,
    error: vehicleClassesQuery.error?.message || null,
    updateFilter,
    updateForm,
    inputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    changeRowsPerPage,
    goToPreviousPage,
    goToNextPage,
    handleImageUpload,
    handleSubmit,
    handleDelete,
    handleExport,
    formatDateTime,
    formatNumber,
    formatWeight,
    formatDimensions,
  };
}
