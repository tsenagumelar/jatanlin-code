/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  evaluateOdol,
  VehicleActual,
  VehicleClassLimit,
} from "@/src/utils/odol";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Spinner,
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
  useId,
  Badge,
  Card,
  Input,
  Field,
  Textarea,
  Select,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from "@fluentui/react-components";
import {
  ArrowLeft24Regular,
  Info24Regular,
  Save24Regular,
  ShieldCheckmark24Regular,
  ShieldError24Regular,
  Image24Regular,
  Print24Regular,
} from "@fluentui/react-icons";
import {
  useGetVehicleActualByIdQuery,
  useUpdateVehicleActualMutation,
} from "@/src/graphql/hooks/transact-vehicle-actual";
import {
  useInsertAnprCaptureMutation,
  useUpdateAnprCaptureMutation,
} from "@/src/graphql/hooks/transact-anpr-capture";
import {
  useInsertAxleCaptureMutation,
  useUpdateAxleCaptureMutation,
} from "@/src/graphql/hooks/transact-axle-capture";
import {
  useInsertWeighingMutation,
  useUpdateWeighingMutation,
} from "@/src/graphql/hooks/transact-vehicke-weight";
import {
  useInsertDimensionMutation,
  useUpdateDimensionMutation,
} from "@/src/graphql/hooks/transact-vehicle-dimension";
import {
  useInsertVehicleStatusMutation,
  useUpdateVehicleStatusMutation,
  useGetVehicleStatusByActualIdQuery,
} from "@/src/graphql/hooks/transact-vehicle-status";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { getMinioImageUrl, getImageUrl } from "@/src/utils/image";
import { getOdolTolerances } from "@/src/utils/odol";
import {
  isPrintableViolation,
  printViolationSticker,
} from "@/src/utils/violationPrint";

interface JatanlinVerifyModuleProps {
  id: string;
  hideHeader?: boolean;
}

const INSERT_CCTV = gql`
  mutation InsertCctv($object: transact_cctv_insert_input!) {
    insert_transact_cctv_one(object: $object) {
      id
      filepath
      filename
    }
  }
`;

const UPDATE_CCTV = gql`
  mutation UpdateCctv($id: uuid!, $set: transact_cctv_set_input!) {
    update_transact_cctv_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      filepath
      filename
    }
  }
`;

type UploadedImageMeta = {
  filePath: string;
  bucket?: string;
  dateFolder?: string;
  objectName?: string;
};

const formatDateTime = (dateString: any) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatViolationLabel = (value?: string | null) => {
  if (value === "Over Dimension & Over Loading") {
    return "Over Dimension & Over Loading";
  }
  if (value === "Over Dimension & Loading") {
    return "Over Dimension & Over Loading";
  }
  if (value === "Over Dimension") return "Over Dimension";
  if (value === "Over Loading") return "Over Loading";
  if (value === "Pending") return "Menunggu";
  if (value === "Verified") return "Terverifikasi";
  if (value === "Rejected") return "Ditolak";
  if (value === "Draft") return "Draf";
  return value || "-";
};

const parseComparisonNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export const JatanlinVerifyModule: React.FC<JatanlinVerifyModuleProps> = ({
  id,
  hideHeader = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const [result, setResult] = useState("");
  const [notes, setNotes] = useState("");
  const [actualPlatNo, setActualPlatNo] = useState("");
  const [actualLength, setActualLength] = useState("");
  const [actualWidth, setActualWidth] = useState("");
  const [actualHeight, setActualHeight] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [actualTotalAxle, setActualTotalAxle] = useState("");
  const [sourcePlateNo, setSourcePlateNo] = useState("");
  const [sourceTotalAxle, setSourceTotalAxle] = useState("");
  const [sourceWeightKg, setSourceWeightKg] = useState("");
  const [sourceLength, setSourceLength] = useState("");
  const [sourceWidth, setSourceWidth] = useState("");
  const [sourceHeight, setSourceHeight] = useState("");
  const [sourceAnprImagePath, setSourceAnprImagePath] = useState("");
  const [sourceAxleImagePath, setSourceAxleImagePath] = useState("");
  const [sourceCctvPath, setSourceCctvPath] = useState("");
  const [sourceAnprBucket, setSourceAnprBucket] = useState("");
  const [sourceAnprDateFolder, setSourceAnprDateFolder] = useState("");
  const [sourceAnprObjectName, setSourceAnprObjectName] = useState("");
  const [sourceAxleBucket, setSourceAxleBucket] = useState("");
  const [sourceAxleDateFolder, setSourceAxleDateFolder] = useState("");
  const [sourceAxleObjectName, setSourceAxleObjectName] = useState("");
  const [uploadingSourceImage, setUploadingSourceImage] = useState<
    "anpr" | "axle" | "cctv" | null
  >(null);
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [attachmentPaths, setAttachmentPaths] = useState<string[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [sourceActiveTab, setSourceActiveTab] = useState<
    "anpr" | "axle" | "wim" | "dimension" | "cctv"
  >("anpr");
  const [confirmAction, setConfirmAction] = useState<
    "save" | "verify" | "reject"
  >("save");

  const { data, loading, error } = useGetVehicleActualByIdQuery({
    variables: { id },
  });

  const { data: statusData } = useGetVehicleStatusByActualIdQuery({
    variables: { transact_vehicle_actual_id: id },
  });

  const { data: vehicleClassData } = useGetVehicleClassesQuery({
    variables: { limit: 100, offset: 0 },
  });

  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 10,
      offset: 0,
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } },
    },
  });

  const [updateVehicleActual, { loading: updatingVehicle }] =
    useUpdateVehicleActualMutation({
      refetchQueries: ["GetVehicleActualById", "GetVehicleActuals"],
    });
  const [insertAnprCapture] = useInsertAnprCaptureMutation();
  const [updateAnprCapture] = useUpdateAnprCaptureMutation();
  const [insertAxleCapture] = useInsertAxleCaptureMutation();
  const [updateAxleCapture] = useUpdateAxleCaptureMutation();
  const [insertWeighing] = useInsertWeighingMutation();
  const [updateWeighing] = useUpdateWeighingMutation();
  const [insertDimension] = useInsertDimensionMutation();
  const [updateDimension] = useUpdateDimensionMutation();

  const [insertVehicleStatus, { loading: insertingStatus }] =
    useInsertVehicleStatusMutation({
      refetchQueries: [
        "GetVehicleActualById",
        "GetVehicleActuals",
        "GetVehicleStatusByActualId",
      ],
    });

  const [updateVehicleStatus, { loading: updatingStatus }] =
    useUpdateVehicleStatusMutation({
      refetchQueries: [
        "GetVehicleActualById",
        "GetVehicleActuals",
        "GetVehicleStatusByActualId",
      ],
    });

  const [insertCctv] = useMutation(INSERT_CCTV);
  const [updateCctv] = useMutation(UPDATE_CCTV);

  const submitting = updatingVehicle || insertingStatus || updatingStatus;
  const listPath = pathname.startsWith("/")
    ? "/transaction/jatanlin"
    : "/jatanlin";

  const vehicle = data?.transact_vehicle_actual_by_pk;
  const existingStatus = statusData?.transact_vehicle_status?.[0];
  const vehicleClasses = React.useMemo(
    () => vehicleClassData?.master_vehicle_class || [],
    [vehicleClassData?.master_vehicle_class],
  );

  // Find matching vehicle class based on total axle
  const matchingVehicleClass = React.useMemo(() => {
    const axle = parseInt(actualTotalAxle) || 0;
    if (axle === 0) return null;
    return vehicleClasses.find((vc) => vc.total_axle === axle) || null;
  }, [vehicleClasses, actualTotalAxle]);

  const class2WeightTon = React.useMemo(() => {
    const value = matchingVehicleClass?.class_2_weight;
    if (value === null || value === undefined || value === "") return null;
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed / 1000 : null;
  }, [matchingVehicleClass?.class_2_weight]);

  const class3WeightTon = React.useMemo(() => {
    const value = matchingVehicleClass?.class_3_weight;
    if (value === null || value === undefined || value === "") return null;
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed / 1000 : null;
  }, [matchingVehicleClass?.class_3_weight]);

  // Check if form is valid (all required fields filled)
  const isFormValid = React.useMemo(() => {
    return !!(
      actualPlatNo &&
      actualTotalAxle &&
      actualWeight &&
      actualLength &&
      actualWidth &&
      actualHeight &&
      result &&
      matchingVehicleClass
    );
  }, [
    actualPlatNo,
    actualTotalAxle,
    actualWeight,
    actualLength,
    actualWidth,
    actualHeight,
    result,
    matchingVehicleClass,
  ]);

  // Evaluasi ODOL (menggunakan utilitas ODOL) - dipakai untuk auto-detect jenis
  // pelanggaran sekaligus persentase kelebihan muatan yang disimpan saat verifikasi.
  const odolEvaluation = React.useMemo(() => {
    if (!matchingVehicleClass) return null;

    const actual: VehicleActual = {
      total_weight: parseFloat(actualWeight) || 0,
      length: parseFloat(actualLength) || 0,
      width: parseFloat(actualWidth) || 0,
      height: parseFloat(actualHeight) || 0,
    };
    const limit: VehicleClassLimit = {
      ...matchingVehicleClass,
      class_2_weight:
        class2WeightTon !== null ? class2WeightTon.toString() : "0",
      class_3_weight:
        class3WeightTon !== null ? class3WeightTon.toString() : "0",
    };
    const tolerances = getOdolTolerances(configData?.master_config);
    const axleCount = parseInt(actualTotalAxle) || 0;

    return evaluateOdol(actual, limit, {
      axleCount,
      toleranceWeightPercent: tolerances.weightPercent,
      toleranceDimPercent: tolerances.dimPercent,
    });
  }, [
    matchingVehicleClass,
    class2WeightTon,
    class3WeightTon,
    actualWeight,
    actualLength,
    actualWidth,
    actualHeight,
    actualTotalAxle,
    configData?.master_config,
  ]);

  // Auto-detect violation type based on limits
  React.useEffect(() => {
    const detectedViolation = odolEvaluation?.violationType || "";
    setResult((current) =>
      current === detectedViolation ? current : detectedViolation,
    );
  }, [odolEvaluation]);

  // Store initial values
  const [initialValues, setInitialValues] = useState<any>(null);

  React.useEffect(() => {
    if (vehicle && !initialValues) {
      const initial = {
        plate:
          vehicle.actual_plat_no ||
          vehicle.transact_anpr_capture?.plate_no ||
          "",
        length: vehicle.actual_length?.toString() || "",
        width: vehicle.actual_width?.toString() || "",
        height: vehicle.actual_height?.toString() || "",
        weight: vehicle.actual_weight
          ? (vehicle.actual_weight / 1000).toString()
          : "",
        totalAxle:
          vehicle.transact_weighing?.total_axle?.toString() ||
          vehicle.actual_total_axle?.toString() ||
          "",
      };
      setInitialValues(initial);
      setActualPlatNo(initial.plate);
      setActualLength(initial.length);
      setActualWidth(initial.width);
      setActualHeight(initial.height);
      setActualWeight(initial.weight);
      setActualTotalAxle(initial.totalAxle);
      setSourcePlateNo(
        vehicle.transact_anpr_capture?.plate_no ||
          vehicle.transact_axle_capture?.plate_no ||
          "",
      );
      setSourceTotalAxle(
        vehicle.transact_weighing?.total_axle?.toString() ||
          "",
      );
      setSourceWeightKg(
        vehicle.transact_weighing?.total_weight != null
          ? Number(vehicle.transact_weighing.total_weight).toString()
          : "",
      );
      setSourceLength(vehicle.transact_dimension?.length?.toString() || "");
      setSourceWidth(vehicle.transact_dimension?.width?.toString() || "");
      setSourceHeight(vehicle.transact_dimension?.height?.toString() || "");
      setSourceAnprImagePath(
        vehicle.transact_anpr_capture?.minio_full_image_object || "",
      );
      setSourceAnprBucket(vehicle.transact_anpr_capture?.minio_bucket || "");
      setSourceAnprDateFolder(
        vehicle.transact_anpr_capture?.minio_date_folder || "",
      );
      setSourceAnprObjectName(
        vehicle.transact_anpr_capture?.minio_full_image_object || "",
      );
      setSourceAxleImagePath(
        vehicle.transact_axle_capture?.minio_image_object || "",
      );
      setSourceAxleBucket(vehicle.transact_axle_capture?.minio_bucket || "");
      setSourceAxleDateFolder(
        vehicle.transact_axle_capture?.minio_date_folder || "",
      );
      setSourceAxleObjectName(
        vehicle.transact_axle_capture?.minio_image_object || "",
      );
      setSourceCctvPath(vehicle.transact_cctv?.filepath || "");
      setLocationAddress(vehicle.location_address || "");
      setLocationLat(vehicle.location_lat ?? null);
      setLocationLng(vehicle.location_lng ?? null);
    }
  }, [vehicle, initialValues]);

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLat(position.coords.latitude);
        setLocationLng(position.coords.longitude);
      },
      () => {
        setLocationLat(null);
        setLocationLng(null);
      },
    );
  }, []);

  React.useEffect(() => {
    if (existingStatus) {
      setResult(existingStatus.result || "");
      setNotes(existingStatus.notes || "");
      const existingAttachments = existingStatus.attachment || [];
      if (existingAttachments.length > 0) {
        setAttachmentPaths(existingAttachments);
        setAttachmentPreviews(
          existingAttachments.map((path) => getImageUrl(path)),
        );
      }
      if (existingAttachments.length === 0) {
        setAttachmentPaths([]);
        setAttachmentPreviews([]);
      }
    } else {
      setAttachmentPaths([]);
      setAttachmentPreviews([]);
    }
  }, [existingStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setAttachmentError(null);
    setUploadingAttachments(true);

    const uploadAll = async () => {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("Pilih file gambar");
          }
          if (file.size > 5 * 1024 * 1024) {
            throw new Error("Ukuran file harus kurang dari 5MB");
          }

          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/attachment/upload`,
            {
              method: "POST",
              body: formData,
            },
          );

          const result = await response.json();
          if (result.success && result.file_path) {
            return result.file_path as string;
          }

          throw new Error(result.message || "Upload gagal");
        }),
      );

      const uploadedPaths = results
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
      const firstError = results.find((result) => result.status === "rejected");

      if (uploadedPaths.length > 0) {
        setAttachmentPaths((prev) => {
          const next = [...prev, ...uploadedPaths];
          setAttachmentPreviews(next.map((path) => getImageUrl(path)));
          return next;
        });
      }

      if (firstError) {
        const message =
          firstError.reason instanceof Error
            ? firstError.reason.message
            : "Gagal mengunggah gambar.";
        setAttachmentError(message);
      }
    };

    uploadAll().finally(() => {
      setUploadingAttachments(false);
      e.target.value = "";
    });
  };

  const uploadSourceImage = async (file: File): Promise<UploadedImageMeta> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Pilih file gambar");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran file harus kurang dari 5MB");
    }
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/attachment/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    const result = await response.json();
    if (result.success && result.file_path) {
      return {
        filePath: result.file_path as string,
        bucket: (result.bucket as string | undefined) || undefined,
        dateFolder: (result.date_folder as string | undefined) || undefined,
        objectName: (result.object_name as string | undefined) || undefined,
      };
    }
    throw new Error(result.message || "Upload gagal");
  };

  const handleSourceImageUpload =
    (type: "anpr" | "axle" | "cctv") =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAttachmentError(null);
      setUploadingSourceImage(type);
      try {
        const uploaded = await uploadSourceImage(file);
        if (type === "anpr") {
          setSourceAnprImagePath(uploaded.filePath);
          const fallbackBucket = uploaded.filePath.includes("/")
            ? uploaded.filePath.split("/")[0]
            : "";
          if (uploaded.bucket || fallbackBucket) {
            setSourceAnprBucket(uploaded.bucket || fallbackBucket);
          }
          if (uploaded.dateFolder !== undefined) {
            setSourceAnprDateFolder(uploaded.dateFolder);
          }
          setSourceAnprObjectName(
            uploaded.objectName ||
              uploaded.filePath.split("/").slice(1).join("/"),
          );
        }
        if (type === "axle") {
          setSourceAxleImagePath(uploaded.filePath);
          const fallbackBucket = uploaded.filePath.includes("/")
            ? uploaded.filePath.split("/")[0]
            : "";
          if (uploaded.bucket || fallbackBucket) {
            setSourceAxleBucket(uploaded.bucket || fallbackBucket);
          }
          if (uploaded.dateFolder !== undefined) {
            setSourceAxleDateFolder(uploaded.dateFolder);
          }
          setSourceAxleObjectName(
            uploaded.objectName ||
              uploaded.filePath.split("/").slice(1).join("/"),
          );
        }
        if (type === "cctv") setSourceCctvPath(uploaded.filePath);
      } catch (err: any) {
        setAttachmentError(err?.message || "Gagal mengunggah gambar sumber.");
      } finally {
        setUploadingSourceImage(null);
        e.target.value = "";
      }
    };

  const handleRemoveAttachment = (index: number) => {
    setAttachmentPaths((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      setAttachmentPreviews(next.map((path) => getImageUrl(path)));
      return next;
    });
  };

  const handleBack = () => {
    router.push(listPath);
  };

  const openConfirmDialog = (action: "save" | "verify" | "reject") => {
    setConfirmAction(action);
    setDialogOpen(true);
  };

  const kgToTonInput = (value: string) => {
    if (!value) return "";
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "";
    return (parsed / 1000).toString();
  };

  const applySourcePlateNo = (value: string) => {
    const normalized = value.toUpperCase();
    setSourcePlateNo(normalized);
    setActualPlatNo(normalized);
  };

  const applySourceTotalAxle = (value: string) => {
    setSourceTotalAxle(value);
    setActualTotalAxle(value);
  };

  const applySourceWeightKg = (value: string) => {
    setSourceWeightKg(value);
    setActualWeight(kgToTonInput(value));
  };

  const applySourceDimension = (
    field: "length" | "width" | "height",
    value: string,
  ) => {
    const actualSetters = {
      length: setActualLength,
      width: setActualWidth,
      height: setActualHeight,
    };
    const sourceSetters = {
      length: setSourceLength,
      width: setSourceWidth,
      height: setSourceHeight,
    };

    sourceSetters[field](value);
    actualSetters[field](value);
  };

  /**
   * Mengirim hasil verifikasi ke ETLE lewat route server-side (kredensial ETLE tidak
   * boleh sampai ke browser). Route yang menentukan apakah ini benar-benar dikirim
   * (is_violation + status verified + ETLE_ENABLED) dan menyimpan response code-nya
   * ke transact_vehicle_status.etle_status_code / etle_message / etle_sent_at.
   */
  const sendToEtle = async (statusId: string) => {
    try {
      const response = await fetch("/api/etle/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || `HTTP ${response.status}`);
      }

      if (payload?.etle?.attempted && !payload.etle.ok) {
        dispatchToast(
          <Toast>
            <ToastTitle>Verifikasi tersimpan, tapi kirim ke ETLE gagal</ToastTitle>
          </Toast>,
          { intent: "warning" },
        );
      }
    } catch (err) {
      console.error("Error sending verification to ETLE:", err);
      dispatchToast(
        <Toast>
          <ToastTitle>Verifikasi tersimpan, tapi kirim ke ETLE gagal dijalankan</ToastTitle>
        </Toast>,
        { intent: "warning" },
      );
    }
  };

  const handleSubmit = async () => {
    if (!vehicle) return;

    try {
      let statusToSave = "draft";
      if (confirmAction === "verify") statusToSave = "verified";
      if (confirmAction === "reject") statusToSave = "rejected";

      let sourceAnprId =
        vehicle.transact_anpr_capture?.id || vehicle.anpr_id || null;
      let sourceAxleId =
        vehicle.transact_axle_capture?.id || vehicle.axle_id || null;
      let sourceWeighingId =
        vehicle.transact_weighing?.id || vehicle.transact_weighing_id || null;
      let sourceDimensionId =
        vehicle.transact_dimension?.id || vehicle.transact_dimension_id || null;
      let sourceCctvId =
        vehicle.transact_cctv?.id || vehicle.transact_cctv_id || null;
      const hasExistingAnprImage =
        !!vehicle.transact_anpr_capture?.minio_full_image_object;
      const hasExistingAxleImage =
        !!vehicle.transact_axle_capture?.minio_image_object;
      const hasExistingCctvPath = !!vehicle.transact_cctv?.filepath;

      if (sourceAnprId) {
        await updateAnprCapture({
          variables: {
            id: sourceAnprId,
            set: {
              plate_no: sourcePlateNo || null,
              minio_bucket:
                hasExistingAnprImage || !sourceAnprObjectName
                  ? undefined
                  : sourceAnprBucket || undefined,
              minio_date_folder:
                hasExistingAnprImage || !sourceAnprObjectName
                  ? undefined
                  : sourceAnprDateFolder || undefined,
              minio_full_image_object:
                hasExistingAnprImage || !sourceAnprObjectName
                  ? undefined
                  : sourceAnprObjectName,
              minio_plate_image_object:
                hasExistingAnprImage || !sourceAnprObjectName
                  ? undefined
                  : sourceAnprObjectName,
              updated_by: "00000000-0000-0000-0000-000000000000",
              updated_date: new Date().toISOString(),
            },
          },
        });
      } else if (sourcePlateNo) {
        const inserted = await insertAnprCapture({
          variables: {
            object: {
              plate_no: sourcePlateNo,
              captured_at: vehicle.created_date,
              minio_bucket: sourceAnprBucket || null,
              minio_date_folder: sourceAnprDateFolder || null,
              minio_full_image_object: sourceAnprObjectName || null,
              minio_plate_image_object: sourceAnprObjectName || null,
              site_id: vehicle.site_id,
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            },
          },
        });
        sourceAnprId =
          inserted.data?.insert_transact_anpr_capture_one?.id || null;
      }

      if (sourceAxleId) {
        await updateAxleCapture({
          variables: {
            id: sourceAxleId,
            set: {
              plate_no: sourcePlateNo || null,
              total_axles: sourceTotalAxle ? parseInt(sourceTotalAxle) : null,
              minio_bucket:
                hasExistingAxleImage || !sourceAxleObjectName
                  ? undefined
                  : sourceAxleBucket || undefined,
              minio_date_folder:
                hasExistingAxleImage || !sourceAxleObjectName
                  ? undefined
                  : sourceAxleDateFolder || undefined,
              minio_image_object:
                hasExistingAxleImage || !sourceAxleObjectName
                  ? undefined
                  : sourceAxleObjectName,
              updated_by: "00000000-0000-0000-0000-000000000000",
              updated_date: new Date().toISOString(),
            },
          },
        });
      } else if (sourcePlateNo || sourceTotalAxle) {
        const inserted = await insertAxleCapture({
          variables: {
            object: {
              plate_no: sourcePlateNo || null,
              captured_at: vehicle.created_date,
              total_axles: sourceTotalAxle ? parseInt(sourceTotalAxle) : null,
              minio_bucket: sourceAxleBucket || null,
              minio_date_folder: sourceAxleDateFolder || null,
              minio_image_object: sourceAxleObjectName || null,
              site_id: vehicle.site_id,
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            },
          },
        });
        sourceAxleId =
          inserted.data?.insert_transact_axle_capture_one?.id || null;
      }

      if (sourceWeighingId) {
        await updateWeighing({
          variables: {
            id: sourceWeighingId,
            set: {
              total_axle: sourceTotalAxle ? parseInt(sourceTotalAxle) : null,
              total_weight: sourceWeightKg ? parseFloat(sourceWeightKg) : null,
              updated_by: "00000000-0000-0000-0000-000000000000",
              updated_date: new Date().toISOString(),
            },
          },
        });
      } else if (sourceTotalAxle || sourceWeightKg) {
        const inserted = await insertWeighing({
          variables: {
            object: {
              total_axle: sourceTotalAxle ? parseInt(sourceTotalAxle) : null,
              total_weight: sourceWeightKg ? parseFloat(sourceWeightKg) : null,
              site_id: vehicle.site_id,
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            },
          },
        });
        sourceWeighingId =
          inserted.data?.insert_transact_weighing_one?.id || null;
      }

      if (sourceDimensionId) {
        await updateDimension({
          variables: {
            id: sourceDimensionId,
            set: {
              length: sourceLength ? parseFloat(sourceLength) : null,
              width: sourceWidth ? parseFloat(sourceWidth) : null,
              height: sourceHeight ? parseFloat(sourceHeight) : null,
              updated_by: "00000000-0000-0000-0000-000000000000",
              updated_date: new Date().toISOString(),
            },
          },
        });
      } else if (sourceLength || sourceWidth || sourceHeight) {
        const inserted = await insertDimension({
          variables: {
            object: {
              anpr_id: sourceAnprId,
              length: sourceLength ? parseFloat(sourceLength) : null,
              width: sourceWidth ? parseFloat(sourceWidth) : null,
              height: sourceHeight ? parseFloat(sourceHeight) : null,
              site_id: vehicle.site_id,
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            },
          },
        });
        sourceDimensionId =
          inserted.data?.insert_transact_dimension_one?.id || null;
      }

      if (sourceCctvId) {
        if (!hasExistingCctvPath && sourceCctvPath) {
          await updateCctv({
            variables: {
              id: sourceCctvId,
              set: {
                filepath: sourceCctvPath,
                filename: sourceCctvPath.split("/").pop() || "cctv.jpg",
                updated_by: "00000000-0000-0000-0000-000000000000",
                updated_date: new Date().toISOString(),
              },
            },
          });
        }
      } else if (sourceCctvPath) {
        const inserted = await insertCctv({
          variables: {
            object: {
              filepath: sourceCctvPath,
              filename: sourceCctvPath.split("/").pop() || "cctv.jpg",
              site_id: vehicle.site_id,
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            },
          },
        });
        sourceCctvId = inserted.data?.insert_transact_cctv_one?.id || null;
      }

      await updateVehicleActual({
        variables: {
          id,
          set: {
            anpr_id: sourceAnprId,
            axle_id: sourceAxleId,
            transact_weighing_id: sourceWeighingId,
            transact_dimension_id: sourceDimensionId,
            transact_cctv_id: sourceCctvId,
            actual_plat_no: actualPlatNo || null,
            actual_length: actualLength ? parseFloat(actualLength) : null,
            actual_width: actualWidth ? parseFloat(actualWidth) : null,
            actual_height: actualHeight ? parseFloat(actualHeight) : null,
            actual_weight: actualWeight
              ? parseFloat(actualWeight) * 1000
              : null,
            actual_total_axle: actualTotalAxle
              ? parseInt(actualTotalAxle)
              : null,
            location_address: locationAddress || null,
            location_lat: locationLat,
            location_lng: locationLng,
            updated_by: "00000000-0000-0000-0000-000000000000",
            updated_date: new Date().toISOString(),
          },
        },
      });

      const attachmentPayload =
        attachmentPaths.length > 0 ? attachmentPaths : null;

      // is_violation mengikuti hasil akhir yang tersimpan (operator boleh mengubah
      // jenis pelanggaran), sedangkan persentase kelebihan muatan murni dari hitungan berat.
      const isViolation = !!result && result.toLowerCase() !== "normal";
      const overloadPercentage = odolEvaluation?.overloadPercentage ?? null;

      let savedStatusId: string | null = null;

      if (existingStatus && existingStatus.status === "draft") {
        await updateVehicleStatus({
          variables: {
            id: existingStatus.id,
            set: {
              status: statusToSave,
              result: result || null,
              is_violation: isViolation,
              overload_percentage: overloadPercentage,
              notes: notes || null,
              attachment: attachmentPayload,
              site_id: vehicle.site_id,
              is_active: true,
              updated_by: "00000000-0000-0000-0000-000000000000",
              updated_date: new Date().toISOString(),
            } as any,
          },
        });
        savedStatusId = existingStatus.id;
      } else {
        const inserted = await insertVehicleStatus({
          variables: {
            object: {
              transact_vehicle_actual_id: id,
              status: statusToSave,
              result: result || null,
              is_violation: isViolation,
              overload_percentage: overloadPercentage,
              notes: notes || null,
              attachment: attachmentPayload,
              site_id: vehicle.site_id,
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            } as any,
          },
        });
        savedStatusId =
          inserted.data?.insert_transact_vehicle_status_one?.id || null;
      }

      // Kirim ke ETLE bila diverifikasi sebagai pelanggaran. Sync ke Data Center TIDAK
      // dipicu di sini - sudah berjalan sebagai background service (sync-agent) terpisah.
      if (statusToSave === "verified" && savedStatusId) {
        await sendToEtle(savedStatusId);
      }

      dispatchToast(
        <Toast>
          <ToastTitle>
            {statusToSave === "verified"
              ? "Data berhasil diverifikasi"
              : statusToSave === "rejected"
                ? "Data ditolak"
                : "Data disimpan sebagai draf"}
          </ToastTitle>
        </Toast>,
        { intent: "success" },
      );

      setDialogOpen(false);
      setTimeout(() => router.push(listPath), 1000);
    } catch (err) {
      console.error("Error submitting verification:", err);
      dispatchToast(
        <Toast>
          <ToastTitle>Gagal menyimpan verifikasi</ToastTitle>
        </Toast>,
        { intent: "error" },
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge appearance="filled" color="success">
            Terverifikasi
          </Badge>
        );
      case "rejected":
        return (
          <Badge appearance="filled" color="danger">
            Ditolak
          </Badge>
        );
      case "draft":
        return (
          <Badge appearance="filled" color="informative">
            Draf
          </Badge>
        );
      default:
        return (
          <Badge appearance="filled" color="warning">
            Menunggu
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-white">
        <Spinner size="large" label="Memuat data..." />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Info24Regular className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Data Tidak Ditemukan
        </h2>
        <p className="text-gray-500 mb-4">
          Data kendaraan yang diminta tidak ditemukan atau sudah dihapus.
        </p>
        <Button appearance="primary" onClick={handleBack}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  const anprImageUrl =
    sourceAnprBucket && sourceAnprObjectName
      ? getMinioImageUrl(sourceAnprBucket, sourceAnprObjectName)
      : sourceAnprImagePath
        ? getImageUrl(sourceAnprImagePath)
        : vehicle.transact_anpr_capture
          ? getMinioImageUrl(
              vehicle.transact_anpr_capture.minio_bucket,
              vehicle.transact_anpr_capture.minio_full_image_object,
            )
          : "";
  const axleImageUrl =
    sourceAxleBucket && sourceAxleObjectName
      ? getMinioImageUrl(sourceAxleBucket, sourceAxleObjectName)
      : sourceAxleImagePath
        ? getImageUrl(sourceAxleImagePath)
        : vehicle.transact_axle_capture
          ? getMinioImageUrl(
              vehicle.transact_axle_capture.minio_bucket,
              vehicle.transact_axle_capture.minio_image_object,
            )
          : "";
  const cctv = (vehicle as any)?.transact_cctv;
  const cctvVideoUrl = sourceCctvPath
    ? getImageUrl(sourceCctvPath)
    : cctv?.filepath
      ? getImageUrl(cctv.filepath)
      : "";

  const sourceSectionMissing = {
    anpr:
      !vehicle.transact_anpr_capture?.id ||
      !sourcePlateNo ||
      !(
        vehicle.transact_anpr_capture?.minio_full_image_object ||
        sourceAnprImagePath
      ),
    axle:
      !vehicle.transact_axle_capture?.id ||
      !sourceTotalAxle ||
      !(
        vehicle.transact_axle_capture?.minio_image_object || sourceAxleImagePath
      ),
    wim: !vehicle.transact_weighing?.id || !sourceTotalAxle || !sourceWeightKg,
    dimension: !vehicle.transact_dimension?.id || !sourceWidth || !sourceHeight,
    cctv:
      !vehicle.transact_cctv?.id ||
      !(vehicle.transact_cctv?.filepath || sourceCctvPath),
  };

  const sourceTabs = (
    [
      { key: "anpr", label: "ANPR" },
      { key: "axle", label: "AXLE" },
      { key: "wim", label: "WIM" },
      { key: "dimension", label: "DIMENSI" },
      { key: "cctv", label: "CCTV" },
    ] as const
  ).filter((item) => sourceSectionMissing[item.key]);

  const hasIncompleteSourceData = sourceTabs.length > 0;
  const canPrintViolation = isPrintableViolation(result);

  return (
    <div className="flex flex-col h-full">
      <Toaster toasterId={toasterId} />

      {/* Header */}
      {!hideHeader && (
        <div className="p-6 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                appearance="subtle"
                icon={<ArrowLeft24Regular />}
                onClick={handleBack}
              >
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verifikasi</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Verifikasi data kendaraan yang terdeteksi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {existingStatus && getStatusBadge(existingStatus.status)}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${hideHeader ? "pb-0" : "px-6 pb-6"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Class Info - Always show */}
            <Card
              className={
                matchingVehicleClass
                  ? "bg-blue-50 border border-blue-200"
                  : actualTotalAxle
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-gray-50 border border-gray-200"
              }
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Info24Regular
                      className={
                        matchingVehicleClass
                          ? "text-blue-600"
                          : actualTotalAxle
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }
                    />
                    <h3
                      className={
                        matchingVehicleClass
                          ? "font-semibold text-blue-900"
                          : actualTotalAxle
                            ? "font-semibold text-yellow-900"
                            : "font-semibold text-gray-900"
                      }
                    >
                      Informasi Kelas Kendaraan -{" "}
                      {matchingVehicleClass?.type ||
                        (actualTotalAxle ? "Tidak Ditemukan" : "Belum Diisi")}
                    </h3>
                  </div>
                  {hasIncompleteSourceData && (
                    <Button
                      appearance="outline"
                      size="small"
                      onClick={() => {
                        setSourceActiveTab(sourceTabs[0]?.key || "anpr");
                        setSourceDialogOpen(true);
                      }}
                    >
                      Lengkapi Data
                    </Button>
                  )}
                </div>
                {!actualTotalAxle ? (
                  <p className="text-gray-600 text-sm mb-3">
                    Isi jumlah sumbu untuk melihat batas legal kelas kendaraan.
                  </p>
                ) : !matchingVehicleClass ? (
                  <p className="text-yellow-700 text-sm mb-3">
                    Kelas kendaraan untuk {actualTotalAxle} sumbu tidak ditemukan
                    di database.
                  </p>
                ) : null}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-600 font-medium mb-1"
                          : actualTotalAxle
                            ? "text-yellow-600 font-medium mb-1"
                            : "text-gray-600 font-medium mb-1"
                      }
                    >
                      Berat Maks. (Kelas III)
                    </p>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-900 font-semibold"
                          : actualTotalAxle
                            ? "text-yellow-900 font-semibold"
                            : "text-gray-900 font-semibold"
                      }
                    >
                      {class3WeightTon !== null
                        ? class3WeightTon.toFixed(2)
                        : "-"}{" "}
                      {matchingVehicleClass && "TON"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-600 font-medium mb-1"
                          : actualTotalAxle
                            ? "text-yellow-600 font-medium mb-1"
                            : "text-gray-600 font-medium mb-1"
                      }
                    >
                      Panjang Maks.
                    </p>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-900 font-semibold"
                          : actualTotalAxle
                            ? "text-yellow-900 font-semibold"
                            : "text-gray-900 font-semibold"
                      }
                    >
                      {matchingVehicleClass?.length || "-"}{" "}
                      {matchingVehicleClass && "m"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-600 font-medium mb-1"
                          : actualTotalAxle
                            ? "text-yellow-600 font-medium mb-1"
                            : "text-gray-600 font-medium mb-1"
                      }
                    >
                      Lebar Maks.
                    </p>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-900 font-semibold"
                          : actualTotalAxle
                            ? "text-yellow-900 font-semibold"
                            : "text-gray-900 font-semibold"
                      }
                    >
                      {matchingVehicleClass?.width || "-"}{" "}
                      {matchingVehicleClass && "m"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-600 font-medium mb-1"
                          : actualTotalAxle
                            ? "text-yellow-600 font-medium mb-1"
                            : "text-gray-600 font-medium mb-1"
                      }
                    >
                      Tinggi Maks.
                    </p>
                    <p
                      className={
                        matchingVehicleClass
                          ? "text-blue-900 font-semibold"
                          : actualTotalAxle
                            ? "text-yellow-900 font-semibold"
                            : "text-gray-900 font-semibold"
                      }
                    >
                      {matchingVehicleClass?.height || "-"}{" "}
                      {matchingVehicleClass && "m"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Waktu">
                    <Input
                      value={formatDateTime(
                        vehicle.transact_anpr_capture?.captured_at ||
                          vehicle.created_date,
                      )}
                      readOnly
                      disabled
                    />
                  </Field>
                  <Field label="Nomor Plat">
                    <Input
                      value={actualPlatNo}
                      onChange={(e) =>
                        setActualPlatNo(e.target.value.toUpperCase())
                      }
                      placeholder="Masukkan nomor plat"
                    />
                  </Field>
                  <Field label="Jenis Pelanggaran">
                    <Select
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                    >
                      <option value="">Pilih jenis...</option>
                      <option value="Normal">Normal</option>
                      <option value="Over Loading">Over Loading</option>
                      <option value="Over Dimension">Over Dimension</option>
                      <option value="Over Dimension & Over Loading">
                        Over Dimension & Over Loading
                      </option>
                    </Select>
                  </Field>
                  <Field label="Berat (TON)">
                    <Input
                      type="number"
                      value={actualWeight}
                      onChange={(e) => setActualWeight(e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Jumlah Sumbu">
                    <Input
                      type="number"
                      value={actualTotalAxle}
                      onChange={(e) => setActualTotalAxle(e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Panjang (m)">
                    <Input
                      type="number"
                      value={actualLength}
                      onChange={(e) => setActualLength(e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Lebar (m)">
                    <Input
                      type="number"
                      value={actualWidth}
                      onChange={(e) => setActualWidth(e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Tinggi (m)">
                    <Input
                      type="number"
                      value={actualHeight}
                      onChange={(e) => setActualHeight(e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                </div>

                <Field label="Alamat Lokasi">
                  <Textarea
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="Contoh: Jl. Gatot Subroto No. 1, Jakarta"
                    resize="vertical"
                    rows={3}
                  />
                </Field>

                <Field label="Catatan Verifikasi">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: ANPR membaca B 1234 ABC, dikoreksi menjadi B 1234 XYZ"
                    resize="vertical"
                    rows={4}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="font-semibold text-gray-900 mb-4">
                  Perbandingan Data Awal vs Aktual
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                          Kolom
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                          Data Awal
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                          Data Aktual
                        </th>
                        {matchingVehicleClass && (
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                            Batas Legal
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {initialValues &&
                        [
                          [
                            "Nomor Plat",
                            initialValues.plate,
                            actualPlatNo,
                            null,
                          ],
                          [
                            "Berat (TON)",
                            initialValues.weight,
                            actualWeight,
                            class3WeightTon !== null
                              ? class3WeightTon.toString()
                              : null,
                          ],
                          [
                            "Jumlah Sumbu",
                            initialValues.totalAxle,
                            actualTotalAxle,
                            null,
                          ],
                          [
                            "Panjang (m)",
                            initialValues.length,
                            actualLength,
                            matchingVehicleClass?.length,
                          ],
                          [
                            "Lebar (m)",
                            initialValues.width,
                            actualWidth,
                            matchingVehicleClass?.width,
                          ],
                          [
                            "Tinggi (m)",
                            initialValues.height,
                            actualHeight,
                            matchingVehicleClass?.height,
                          ],
                        ].map(([field, oldVal, newVal, limit]) => {
                          const isChanged = oldVal !== newVal;
                          const actualNumber = parseComparisonNumber(newVal);
                          const limitNumber = parseComparisonNumber(limit);
                          const exceeds =
                            actualNumber !== null &&
                            limitNumber !== null &&
                            actualNumber > limitNumber;
                          return (
                            <tr
                              key={field}
                              className={`border-b border-gray-100 ${
                                exceeds
                                  ? "bg-red-50"
                                  : isChanged
                                    ? "bg-yellow-50"
                                    : ""
                              }`}
                            >
                              <td className="py-3 px-4 font-medium text-gray-900">
                                {field}
                              </td>
                              <td
                                className={`py-3 px-4 ${
                                  isChanged
                                    ? "line-through text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {oldVal || "-"}
                              </td>
                              <td
                                className={`py-3 px-4 font-medium ${
                                  exceeds
                                    ? "text-red-700 font-extrabold"
                                    : isChanged
                                      ? "text-yellow-700"
                                      : "text-gray-900"
                                }`}
                              >
                                {newVal || "-"}
                              </td>
                              {matchingVehicleClass && (
                                <td
                                  className={`py-3 px-4 ${
                                    exceeds
                                      ? "text-red-700 font-extrabold"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {limit || "-"}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Evidence */}
          <div className="space-y-6">
            <Card>
              <div className="p-6 space-y-3">
                <div className="font-semibold text-sm">Bukti ANPR</div>
                <div className="aspect-video w-full rounded-lg bg-neutral-100 overflow-hidden">
                  {anprImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={anprImageUrl}
                      alt="ANPR"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <Image24Regular className="w-12 h-12 mb-2" />
                      <span className="text-sm">Gambar tidak tersedia</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-3">
                <div className="font-semibold text-sm">Bukti Sumbu</div>
                <div className="aspect-video w-full rounded-lg bg-neutral-100 overflow-hidden">
                  {axleImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={axleImageUrl}
                      alt="Sumbu"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <Image24Regular className="w-12 h-12 mb-2" />
                      <span className="text-sm">Gambar tidak tersedia</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-3">
                <div className="font-semibold text-sm">
                  Bukti Lainnya (CCTV)
                </div>
                <div className="aspect-video w-full rounded-lg bg-neutral-100 overflow-hidden">
                  {cctvVideoUrl ? (
                    <video
                      src={cctvVideoUrl}
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <Image24Regular className="w-12 h-12 mb-2" />
                      <span className="text-sm">Video tidak tersedia</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-3">
                <div className="font-semibold text-sm">Bukti Tambahan</div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploadingAttachments}
                  className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {uploadingAttachments && (
                  <div className="text-xs text-neutral-500">
                    Mengunggah bukti tambahan...
                  </div>
                )}
                {attachmentError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                    {attachmentError}
                  </div>
                )}
                {attachmentPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {attachmentPreviews.map((preview, index) => (
                      <div
                        key={`${preview}-${index}`}
                        className="rounded-lg overflow-hidden border border-neutral-200"
                      >
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt="Pratinjau"
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="absolute top-2 right-2 rounded bg-white/90 px-2 py-1 text-xs text-red-600 shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <Button
            appearance="secondary"
            onClick={handleBack}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            appearance="primary"
            icon={<Save24Regular />}
            onClick={() => openConfirmDialog("save")}
            disabled={submitting || !isFormValid}
          >
            Simpan Draf
          </Button>
          <Button
            appearance="primary"
            icon={<Print24Regular />}
            onClick={() =>
              printViolationSticker({
                plateNo: actualPlatNo,
                violationType: result,
                weightKg: actualWeight,
                lengthM: actualLength,
                widthM: actualWidth,
                heightM: actualHeight,
              })
            }
            disabled={submitting || !canPrintViolation}
            style={{ backgroundColor: "#b91c1c" }}
          >
            Cetak Pelanggaran
          </Button>
          <Button
            appearance="primary"
            icon={<ShieldCheckmark24Regular />}
            onClick={() => openConfirmDialog("verify")}
            disabled={submitting || !isFormValid}
            style={{ backgroundColor: "#107c10" }}
          >
            Verifikasi
          </Button>
          <Button
            appearance="primary"
            icon={<ShieldError24Regular />}
            onClick={() => openConfirmDialog("reject")}
            disabled={submitting || !isFormValid}
            style={{ backgroundColor: "#d13438" }}
          >
            Tolak
          </Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(_, data) => setDialogOpen(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {confirmAction === "save" && "Simpan Perubahan?"}
              {confirmAction === "verify" && "Verifikasi Data?"}
              {confirmAction === "reject" && "Tolak Data?"}
            </DialogTitle>
            <DialogContent>
              {confirmAction === "save" &&
                "Perubahan akan disimpan sebagai draf verifikasi."}
              {confirmAction === "verify" &&
                "Status akan diubah menjadi Terverifikasi. Pastikan semua data sudah benar."}
              {confirmAction === "reject" &&
                "Status akan diubah menjadi Ditolak. Tambahkan catatan penolakan bila diperlukan."}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              {confirmAction === "reject" ? (
                <Button
                  appearance="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ backgroundColor: "#d13438" }}
                >
                  {submitting ? "Menyimpan..." : "Tolak"}
                </Button>
              ) : confirmAction === "verify" ? (
                <Button
                  appearance="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ backgroundColor: "#107c10" }}
                >
                  {submitting ? "Menyimpan..." : "Verifikasi"}
                </Button>
              ) : (
                <Button
                  appearance="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog
        open={sourceDialogOpen}
        onOpenChange={(_, data) => setSourceDialogOpen(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Lengkapi Data Sumber</DialogTitle>
            <DialogContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {sourceTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSourceActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs rounded-full border ${
                        sourceActiveTab === tab.key
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {sourceActiveTab === "anpr" && (
                  <div className="grid grid-cols-1 gap-3">
                    <Field label="Nomor Plat Sumber">
                      <Input
                        value={sourcePlateNo}
                        onChange={(e) => applySourcePlateNo(e.target.value)}
                        placeholder="Plat dari sumber"
                      />
                    </Field>
                    <Field label="Gambar ANPR Sumber">
                      <Input
                        value={sourceAnprImagePath}
                        readOnly
                        placeholder="Belum ada gambar ANPR"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSourceImageUpload("anpr")}
                        disabled={
                          !!vehicle.transact_anpr_capture
                            ?.minio_full_image_object ||
                          uploadingSourceImage !== null
                        }
                        className="mt-2 block w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 disabled:opacity-60"
                      />
                    </Field>
                  </div>
                )}

                {sourceActiveTab === "axle" && (
                  <div className="grid grid-cols-1 gap-3">
                    <Field label="Total Sumbu Sumber">
                      <Input
                        type="number"
                        value={sourceTotalAxle}
                        onChange={(e) => applySourceTotalAxle(e.target.value)}
                        placeholder="Jumlah sumbu dari sumber"
                      />
                    </Field>
                    <Field label="Gambar Sumbu Sumber">
                      <Input
                        value={sourceAxleImagePath}
                        readOnly
                        placeholder="Belum ada gambar AXLE"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSourceImageUpload("axle")}
                        disabled={
                          !!vehicle.transact_axle_capture?.minio_image_object ||
                          uploadingSourceImage !== null
                        }
                        className="mt-2 block w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 disabled:opacity-60"
                      />
                    </Field>
                  </div>
                )}

                {sourceActiveTab === "wim" && (
                  <div className="grid grid-cols-1 gap-3">
                    <Field label="Total Sumbu Sumber (WIM)">
                      <Input
                        type="number"
                        value={sourceTotalAxle}
                        onChange={(e) => applySourceTotalAxle(e.target.value)}
                      />
                    </Field>
                    <Field label="Berat Sumber (KG)">
                      <Input
                        type="number"
                        value={sourceWeightKg}
                        onChange={(e) => applySourceWeightKg(e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {sourceActiveTab === "dimension" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Panjang Sumber (m)">
                      <Input
                        type="number"
                        value={sourceLength}
                        onChange={(e) =>
                          applySourceDimension("length", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Lebar Sumber (m)">
                      <Input
                        type="number"
                        value={sourceWidth}
                        onChange={(e) =>
                          applySourceDimension("width", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Tinggi Sumber (m)">
                      <Input
                        type="number"
                        value={sourceHeight}
                        onChange={(e) =>
                          applySourceDimension("height", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                )}

                {sourceActiveTab === "cctv" && (
                  <div className="grid grid-cols-1 gap-3">
                    <Field label="Video CCTV Sumber">
                      <Input
                        value={sourceCctvPath}
                        readOnly
                        placeholder="Belum ada video CCTV"
                      />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleSourceImageUpload("cctv")}
                        disabled={
                          !!vehicle.transact_cctv?.filepath ||
                          uploadingSourceImage !== null
                        }
                        className="mt-2 block w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 disabled:opacity-60"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={() => setSourceDialogOpen(false)}
              >
                Selesai
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default JatanlinVerifyModule;
