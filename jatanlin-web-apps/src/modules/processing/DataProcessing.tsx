/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card, Spinner } from "@fluentui/react-components";
import {
  CheckmarkCircle24Filled,
  Warning24Filled,
  ArrowCounterclockwise24Regular,
} from "@fluentui/react-icons";
import { useSubscribeLatestAnprCaptureSubscription } from "@/src/graphql/hooks/transact-anpr-capture";
import { useSubscribeLatestAxleCaptureSubscription } from "@/src/graphql/hooks/transact-axle-capture";
import { useSubscribeLatestCctvSubscription } from "@/src/graphql/hooks/transact-cctv";
import {
  useInsertVehicleActualMutation,
  useUpdateVehicleActualMutation,
} from "@/src/graphql/hooks/transact-vehicle-actual";
import { getMinioImageUrl } from "@/src/utils/image";
import { useSubscribeLatestDimensionSubscription } from "@/src/graphql/hooks/transact-vehicle-dimension";
import { useSubscribeLatestWeighingSubscription } from "@/src/graphql/hooks/transact-vehicke-weight";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { useUpdateTransactWimSessionMutation } from "@/src/graphql/hooks/transact-wim-session";
import { useProcessing } from "@/src/contexts/ProcessingContext";
import {
  checkOdolViolation,
  VehicleActual,
  VehicleClassLimit,
  getOdolTolerances,
} from "@/src/utils/odol";

type StepStatus = "waiting" | "active" | "completed";

interface DataProcessingProps {
  variant?: "full" | "simple";
}

export const DataProcessing: React.FC<DataProcessingProps> = ({
  variant = "full",
}) => {
  const STEP_WAIT_TIMEOUT_MS = 5_000;

  const router = useRouter();

  // Use Processing Context
  const {
    steps,
    currentStepId,
    countdown,
    sessionStartTime,
    sessionId,
    isProcessing,
    vehicleActualId,
    anprData,
    weightData,
    axleData,
    dimensionData,
    cctvData,
    vehicleClassData,
    violationResult: contextViolationResult,
    setSteps,
    setCurrentStepId,
    setCountdown,
    setSessionStartTime,
    setIsProcessing,
    setVehicleActualId,
    setAnprData,
    setWeightData,
    setAxleData,
    setDimensionData,
    setCctvData,
    setVehicleClassData,
    setViolationResult,
    setPhase,
    resetProcessing,
  } = useProcessing();

  // Local states
  const sessionStartTimeRef = useRef<string | null>(null);
  const [detailStepId, setDetailStepId] = useState<number | null>(null);
  const [timedOutSteps, setTimedOutSteps] = useState<number[]>([]);
  const insertingVehicleActualRef = useRef(false);
  const cctvWaitStartRef = useRef<number | null>(null);
  const cctvLinkedRef = useRef(false);
  const updatingCctvRef = useRef(false);
  const [cctvInsertRetryTick, setCctvInsertRetryTick] = useState(0);

  // Get site_id from env
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || undefined;
  const shouldListenLiveData = currentStepId >= 2;

  // Get all vehicle classes to find the closest match
  const { data: vehicleClassesData } = useGetVehicleClassesQuery({
    variables: {
      limit: 100,
      offset: 0,
    },
  });

  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 10,
      offset: 0,
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } },
    },
  });

  // GraphQL Subscriptions
  const { data: anprSubscriptionData } =
    useSubscribeLatestAnprCaptureSubscription({
      variables: {
        site_id: siteId,
        created_after: sessionStartTime,
      },
      skip: !sessionStartTime || !shouldListenLiveData || !!anprData,
    });

  const { data: weightSubscriptionData } =
    useSubscribeLatestWeighingSubscription({
      variables: {
        site_id: siteId,
        created_after: sessionStartTime,
      },
      skip: !sessionStartTime || !shouldListenLiveData || !!weightData,
    });

  const { data: axleSubscriptionData } =
    useSubscribeLatestAxleCaptureSubscription({
      variables: {
        site_id: siteId,
        created_after: sessionStartTime,
      },
      skip: !sessionStartTime || !shouldListenLiveData || !!axleData,
    });

  const {
    data: dimensionSubscriptionData,
    loading: dimensionLoading,
    error: dimensionError,
  } = useSubscribeLatestDimensionSubscription({
    variables: {
      site_id: siteId,
      created_after: sessionStartTime,
    },
    skip: !sessionStartTime || !shouldListenLiveData || !!dimensionData,
  });

  const { data: cctvSubscriptionData } = useSubscribeLatestCctvSubscription({
    variables: {
      site_id: siteId,
      created_after: sessionStartTime,
    },
    skip: !sessionStartTime || !shouldListenLiveData || !!cctvData,
  });

  // Debug subscriptions
  useEffect(() => {
    console.log(`=== Step ${currentStepId} Started ===`, {
      sessionStartTime,
      siteId,
      timestamp: new Date().toISOString(),
    });
  }, [currentStepId, sessionStartTime, siteId]);

  useEffect(() => {
    if (!sessionStartTime) return;

    console.log("Dimension Subscription Status:", {
      siteId,
      sessionStartTime,
      dimensionData,
      subscriptionData: dimensionSubscriptionData,
      loading: dimensionLoading,
      error: dimensionError,
      hasData: !!dimensionSubscriptionData?.transact_dimension?.[0],
      isSkipped: !sessionStartTime || !shouldListenLiveData || !!dimensionData,
      rawData: dimensionSubscriptionData?.transact_dimension,
    });
  }, [
    dimensionSubscriptionData,
    dimensionData,
    siteId,
    sessionStartTime,
    shouldListenLiveData,
    dimensionLoading,
    dimensionError,
  ]);

  // GraphQL Mutations
  const [insertVehicleActual] = useInsertVehicleActualMutation();
  const [updateVehicleActual] = useUpdateVehicleActualMutation();
  const [updateTransactWimSession] = useUpdateTransactWimSessionMutation();

  // Function to find closest vehicle class by axle count
  const findClosestVehicleClass = useCallback(
    (targetAxle: number) => {
      if (!vehicleClassesData?.master_vehicle_class) return null;

      const classes = vehicleClassesData.master_vehicle_class;

      // First try to find exact match
      const exactMatch = classes.find((vc) => vc.total_axle === targetAxle);
      if (exactMatch) return exactMatch;

      // If no exact match, find the closest one
      // Sort by absolute difference and get the first one
      const sorted = [...classes].sort((a, b) => {
        const diffA = Math.abs(a.total_axle - targetAxle);
        const diffB = Math.abs(b.total_axle - targetAxle);
        return diffA - diffB;
      });

      // If target is higher than all available, get the one with max axle
      if (targetAxle > Math.max(...classes.map((c) => c.total_axle))) {
        return classes.reduce((max, c) =>
          c.total_axle > max.total_axle ? c : max,
        );
      }

      return sorted[0] || null;
    },
    [vehicleClassesData],
  );

  // Move to next step
  const moveToNextStep = useCallback(() => {
    if (currentStepId >= 6) return;

    const nextStepId = currentStepId + 1;
    console.log(
      `🔄 Processing - Moving from step ${currentStepId} to step ${nextStepId}`,
    );

    setSteps(
      steps.map((step) =>
        step.id === currentStepId
          ? { ...step, status: "completed" as StepStatus }
          : step.id === nextStepId
            ? { ...step, status: "active" as StepStatus }
            : step,
      ),
    );
    setCurrentStepId(nextStepId);

    console.log(`✅ Processing - Step updated to ${nextStepId}`);
  }, [currentStepId, setSteps, setCurrentStepId, steps]);

  // Handle showing detail for completed steps - scroll to content area
  const handleShowDetail = useCallback((stepId: number) => {
    // Just update the state to show that step's content
    // The UI will automatically show the relevant data based on which step data is available
    setDetailStepId(stepId);

    // Scroll to content area
    const contentArea = document.getElementById("content-area");
    if (contentArea) {
      contentArea.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Sync sessionStartTimeRef with context sessionStartTime on mount
  useEffect(() => {
    if (sessionStartTime && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = sessionStartTime;
    }
  }, [sessionStartTime]);

  // Keep currentStepId consistent with the active step status to prevent UI/process mismatch.
  useEffect(() => {
    const activeStepId = steps.find((step) => step.status === "active")?.id;
    if (activeStepId && activeStepId !== currentStepId) {
      setCurrentStepId(activeStepId);
    }
  }, [steps, currentStepId, setCurrentStepId]);

  // Step 1: Start new session with countdown
  useEffect(() => {
    // Ensure session start time always exists before data-listening steps begin.
    if (currentStepId === 1 && !sessionStartTime) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        const timestamp = new Date().toISOString();
        sessionStartTimeRef.current = timestamp;
        setSessionStartTime(timestamp);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStepId, sessionStartTime, setSessionStartTime]);

  useEffect(() => {
    if (currentStepId === 1 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (currentStepId === 1 && countdown === 0) {
      const timer = setTimeout(() => moveToNextStep(), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStepId, countdown, moveToNextStep, setCountdown]);

  // Handle ANPR Data (always listen in background after countdown)
  useEffect(() => {
    if (anprSubscriptionData?.transact_anpr_capture?.[0] && !anprData) {
      const anpr = anprSubscriptionData.transact_anpr_capture[0];
      console.log("✅ ANPR Data Received:", anpr);
      setAnprData({
        id: anpr.id,
        plate_no: anpr.plate_no,
        confidence: anpr.confidence || 0,
        captured_at: anpr.captured_at,
        minio_bucket: anpr.minio_bucket,
        minio_full_image_object: anpr.minio_full_image_object,
        site_id: anpr.site_id,
      });
    }
  }, [anprSubscriptionData, anprData, setAnprData]);

  // Handle Weight Data (always listen in background after countdown)
  useEffect(() => {
    if (weightSubscriptionData?.transact_weighing?.[0] && !weightData) {
      const weight = weightSubscriptionData.transact_weighing[0];
      console.log("✅ Weight Data Received:", weight);
      setWeightData({
        id: weight.id,
        total_weight: weight.total_weight || 0,
        total_axle: weight.total_axle || 0,
      });
    }
  }, [weightSubscriptionData, weightData, setWeightData]);

  // Handle Axle Data (always listen in background after countdown)
  useEffect(() => {
    if (axleSubscriptionData?.transact_axle_capture?.[0] && !axleData) {
      const axle = axleSubscriptionData.transact_axle_capture[0];
      console.log("✅ Axle Data Received:", axle);

      setAxleData({
        id: axle.id,
        total_axles: axle.total_axles || 0,
        total_wheels: axle.total_wheels || 0,
        length_mm: axle.length_mm ?? null,
        length: axle.length_mm != null ? axle.length_mm / 1000 : 0,
        vehicle_category: axle.vehicle_category || "Unknown",
        minio_bucket: axle.minio_bucket,
        minio_image_object: axle.minio_image_object,
      });

      const vehicleClass = findClosestVehicleClass(axle.total_axles || 0);
      if (vehicleClass) {
        console.log(
          "✅ Vehicle Class Found (Axle: " + axle.total_axles + "):",
          vehicleClass,
        );
        setVehicleClassData(vehicleClass);
      } else {
        console.warn(
          "⚠️ No vehicle class found for axle count:",
          axle.total_axles,
        );
      }
    }
  }, [
    axleSubscriptionData,
    axleData,
    findClosestVehicleClass,
    setAxleData,
    setVehicleClassData,
  ]);

  // Handle CCTV Data (always listen in background after countdown)
  useEffect(() => {
    if (cctvSubscriptionData?.transact_cctv?.[0] && !cctvData) {
      const cctv = cctvSubscriptionData.transact_cctv[0];
      console.log("✅ CCTV Data Received:", cctv);
      setCctvData({
        id: cctv.id,
        filename: cctv.filename,
        filepath: cctv.filepath,
        created_date: cctv.created_date,
        site_id: cctv.site_id,
        session_id: cctv.session_id,
      });
    }
  }, [cctvSubscriptionData, cctvData, setCctvData]);

  // Handle Dimension Data (always listen in background after countdown)
  useEffect(() => {
    if (dimensionSubscriptionData?.transact_dimension?.[0] && !dimensionData) {
      const dimension = dimensionSubscriptionData.transact_dimension[0];
      console.log("✅ Dimension Data Received:", dimension);
      setDimensionData({
        id: dimension.id,
        length: dimension.length || 0,
        width: dimension.width || 0,
        height: dimension.height || 0,
      });
      if (!cctvWaitStartRef.current) {
        cctvWaitStartRef.current = Date.now();
      }
    }
  }, [dimensionSubscriptionData, dimensionData, setDimensionData]);

  // Step 2-5: wait max 10s for current step data, then continue
  const currentStepHasData = useMemo(() => {
    if (currentStepId === 2) return !!anprData;
    if (currentStepId === 3) return !!weightData;
    if (currentStepId === 4) return !!axleData;
    if (currentStepId === 5) return !!dimensionData;
    return false;
  }, [currentStepId, anprData, weightData, axleData, dimensionData]);

  useEffect(() => {
    if (currentStepId < 2 || currentStepId > 5) return;

    const stepId = currentStepId;
    const advance = (isTimeout: boolean) => {
      if (isTimeout) {
        setTimedOutSteps((prev) =>
          prev.includes(stepId) ? prev : [...prev, stepId],
        );
      }
      moveToNextStep();
    };

    if (currentStepHasData) {
      const readyTimer = setTimeout(() => advance(false), 400);
      return () => clearTimeout(readyTimer);
    }

    const timeoutTimer = setTimeout(() => advance(true), STEP_WAIT_TIMEOUT_MS);
    return () => clearTimeout(timeoutTimer);
  }, [currentStepId, currentStepHasData, moveToNextStep, STEP_WAIT_TIMEOUT_MS]);

  // Insert vehicle actual after CCTV data is available or timeout
  useEffect(() => {
    if (!dimensionData || !weightData || !anprData || !axleData) return;
    if (vehicleActualId || insertingVehicleActualRef.current) return;

    const latestCctvId =
      cctvData?.id ?? cctvSubscriptionData?.transact_cctv?.[0]?.id ?? undefined;

    if (!cctvWaitStartRef.current) {
      cctvWaitStartRef.current = Date.now();
    }

    const elapsedMs = Date.now() - cctvWaitStartRef.current;
    const shouldInsertWithoutCctv = elapsedMs >= 10_000;

    if (!latestCctvId && !shouldInsertWithoutCctv) {
      console.log(
        "⏳ Waiting for CCTV data before inserting vehicle actual...",
      );
      const timer = setTimeout(() => {
        setCctvInsertRetryTick((prev) => prev + 1);
      }, 10_000 - elapsedMs);
      return () => clearTimeout(timer);
    }

    insertingVehicleActualRef.current = true;
    setIsProcessing(true);

    (async () => {
      try {
        const result = await insertVehicleActual({
          variables: {
            object: {
              anpr_id: anprData.id,
              axle_id: axleData.id,
              transact_dimension_id: dimensionData.id,
              transact_weighing_id: weightData.id,
              actual_width: dimensionData.width,
              actual_length:
                axleData?.length_mm != null
                  ? axleData.length_mm / 1000
                  : (axleData?.length ?? dimensionData.length),
              actual_height: dimensionData.height,
              actual_weight: weightData.total_weight,
              actual_plat_no: anprData.plate_no,
              actual_total_axle: weightData.total_axle,
              site_id: siteId,
              ...(latestCctvId ? { transact_cctv_id: latestCctvId } : {}),
              is_active: true,
              is_deleted: false,
              created_by: "00000000-0000-0000-0000-000000000000",
              created_date: new Date().toISOString(),
            } as any,
          },
        });

        const id = result.data?.insert_transact_vehicle_actual_one?.id;
        if (id) {
          setVehicleActualId(id);
          cctvLinkedRef.current = !!latestCctvId;
          console.log("✅ Vehicle Actual Created with ID:", id);
          if (sessionId) {
            try {
              const finishedAt = new Date().toISOString();
              await updateTransactWimSession({
                variables: {
                  id: sessionId,
                  set: {
                    status: "COMPLETED",
                    ended_at: finishedAt,
                    updated_date: finishedAt,
                  },
                },
              });
            } catch (error) {
              console.error("Error updating WIM session status:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error inserting vehicle actual:", error);
      } finally {
        setIsProcessing(false);
        insertingVehicleActualRef.current = false;
      }
    })();
  }, [
    dimensionData,
    weightData,
    anprData,
    axleData,
    cctvData,
    cctvSubscriptionData,
    vehicleActualId,
    insertVehicleActual,
    siteId,
    setVehicleActualId,
    setIsProcessing,
    sessionId,
    updateTransactWimSession,
    cctvInsertRetryTick,
  ]);

  // If vehicle actual already inserted without CCTV, update when CCTV arrives
  useEffect(() => {
    if (!vehicleActualId) return;
    if (cctvLinkedRef.current || updatingCctvRef.current) return;

    const latestCctvId =
      cctvData?.id ?? cctvSubscriptionData?.transact_cctv?.[0]?.id ?? undefined;

    if (!latestCctvId) return;

    updatingCctvRef.current = true;
    (async () => {
      try {
        await updateVehicleActual({
          variables: {
            id: vehicleActualId,
            set: {
              transact_cctv_id: latestCctvId,
              updated_by: "00000000-0000-0000-0000-000000000000",
              updated_date: new Date().toISOString(),
            },
          },
        });
        cctvLinkedRef.current = true;
        console.log("✅ Vehicle Actual updated with CCTV ID:", latestCctvId);
      } catch (error) {
        console.error("Error updating vehicle actual with CCTV ID:", error);
      } finally {
        updatingCctvRef.current = false;
      }
    })();
  }, [vehicleActualId, cctvData, cctvSubscriptionData, updateVehicleActual]);

  // Analyze violation using checkOdolViolation utility (same as verify page)
  useEffect(() => {
    if (
      weightData &&
      dimensionData &&
      vehicleClassData &&
      !contextViolationResult
    ) {
      // Import checkOdolViolation from odol utility
      // IMPORTANT: weightData.total_weight is in KG, but class_3_weight limit is in TON
      // So we need to convert KG to TON for comparison
      const actual: VehicleActual = {
        total_weight: weightData.total_weight / 1000, // Convert KG to TON
        length: axleData?.length ?? dimensionData.length,
        width: dimensionData.width,
        height: dimensionData.height,
      };
      const class2Weight =
        vehicleClassData?.class_2_weight != null
          ? Number(vehicleClassData.class_2_weight)
          : null;
      const class3Weight =
        vehicleClassData?.class_3_weight != null
          ? Number(vehicleClassData.class_3_weight)
          : null;
      const class2WeightTon =
        class2Weight != null && Number.isFinite(class2Weight)
          ? class2Weight / 1000
          : 0;
      const class3WeightTon =
        class3Weight != null && Number.isFinite(class3Weight)
          ? class3Weight / 1000
          : 0;
      const limit: VehicleClassLimit = {
        ...vehicleClassData,
        class_2_weight: class2WeightTon.toString(),
        class_3_weight: class3WeightTon.toString(),
      };
      const tolerances = getOdolTolerances(configData?.master_config);
      const axleCount =
        axleData?.total_axles || vehicleClassData?.total_axle || 0;
      const result = checkOdolViolation(actual, limit, {
        axleCount,
        toleranceWeightPercent: tolerances.weightPercent,
        toleranceDimPercent: tolerances.dimPercent,
      });

      console.log("📊 Violation Analysis:", {
        vehicleClass: vehicleClassData.type,
        axles: vehicleClassData.total_axle,
        limits: {
          weight: parseFloat(String(vehicleClassData.class_3_weight || "0")),
          length: parseFloat(String(vehicleClassData.length || "0")),
          width: parseFloat(String(vehicleClassData.width || "0")),
          height: parseFloat(String(vehicleClassData.height || "0")),
        },
        tolerances,
        actual: {
          weight_kg: weightData.total_weight,
          weight_ton: weightData.total_weight / 1000,
          length: axleData?.length ?? dimensionData.length,
          width: dimensionData.width,
          height: dimensionData.height,
        },
        result,
      });

      setViolationResult(result);
    }
  }, [
    weightData,
    dimensionData,
    vehicleClassData,
    axleData,
    configData?.master_config,
    contextViolationResult,
    setViolationResult,
  ]);

  const violationResult = contextViolationResult;
  const dimensionLengthValue =
    axleData?.length_mm != null
      ? axleData.length_mm / 1000
      : axleData?.length != null
        ? axleData.length
        : (dimensionData?.length ?? 0);
  const isSummaryStep = currentStepId === 6;
  const effectiveDetailStepId =
    isSummaryStep && detailStepId === null ? 6 : detailStepId;
  const displaySteps = steps;
  const finalResultLabel = violationResult || "Menunggu Data Lengkap";

  const handleResetToStep1 = useCallback(() => {
    sessionStartTimeRef.current = null;
    insertingVehicleActualRef.current = false;
    cctvWaitStartRef.current = null;
    cctvLinkedRef.current = false;
    updatingCctvRef.current = false;
    setDetailStepId(null);
    setTimedOutSteps([]);
    resetProcessing();
    setPhase("processing");
  }, [resetProcessing, setPhase]);

  const handleViewDetail = useCallback(() => {
    if (vehicleActualId) {
      if (document.fullscreenElement) {
        sessionStorage.setItem("processing-exit-target", "verify");
        document.exitFullscreen().catch((error) => {
          console.error("Failed to exit fullscreen:", error);
        });
      }
      router.push(`/jatanlin/${vehicleActualId}/verify`);
    }
  }, [vehicleActualId, router]);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (variant !== "simple") return;

    const handleTripleClick = () => {
      clickCountRef.current += 1;

      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      clickTimerRef.current = setTimeout(() => {
        if (clickCountRef.current === 3 && isSummaryStep) {
          handleViewDetail();
        }
        clickCountRef.current = 0;
      }, 500);

      if (clickCountRef.current >= 4) {
        clickCountRef.current = 0;
        handleResetToStep1();
      }
    };

    window.addEventListener("click", handleTripleClick);

    return () => {
      window.removeEventListener("click", handleTripleClick);
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, [handleResetToStep1, handleViewDetail, isSummaryStep, variant]);

  const handleClickerMode = async () => {
    if (variant === "simple") {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error("Failed to exit fullscreen:", error);
        }
      }
      router.push("/processing");
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }

    router.push("/processing/clicker/fullscreen");
  };

  if (variant === "simple") {
    const activeStepTitle =
      displaySteps.find((step) =>
        effectiveDetailStepId
          ? step.id === effectiveDetailStepId
          : step.id === currentStepId,
      )?.title || "-";

    return (
      <div className="h-full flex flex-col bg-black text-white select-none">
        <div className="flex-1 p-6 overflow-auto flex items-center justify-center">
          <div className="w-full min-w-7xl max-w-[50%]">
            <div className="relative rounded-3xl border-8 border-slate-800 bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle,rgba(148,163,184,0.6)_1.5px,transparent_1.5px)] bg-size-[10px_10px]" />
              <div className="relative z-10 px-10 py-12 text-center">
                <p className="text-4xl tracking-[0.3em] text-slate-400">
                  MODE KLIK
                </p>
                <h1 className="mt-4 text-9xl font-black text-white drop-shadow-[0_0_18px_rgba(96,165,250,0.8)]">
                  {activeStepTitle}
                </h1>

                <div className="mt-10 space-y-6">
                  {currentStepId === 1 && !effectiveDetailStepId && (
                    <div className="space-y-3">
                      <p className="text-6xl font-semibold text-blue-200">
                        Sistem mulai dalam {countdown} detik
                      </p>
                      <p className="text-4xl text-slate-300">
                        Silakan posisikan kendaraan
                      </p>
                    </div>
                  )}

                  {(currentStepId === 2 || effectiveDetailStepId === 2) && (
                    <div className="space-y-4">
                      {!anprData ? (
                        <p className="text-6xl text-blue-200">
                          Menunggu data ANPR...
                        </p>
                      ) : (
                        <div className="space-y-8">
                          <p className="text-8xl font-black text-emerald-200 font-mono tracking-[0.2em]">
                            {anprData.plate_no}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(currentStepId === 3 || effectiveDetailStepId === 3) && (
                    <div className="space-y-4">
                      {!weightData ? (
                        <p className="text-3xl text-blue-200">
                          Menunggu data penimbangan...
                        </p>
                      ) : (
                        <p className="text-8xl font-black text-emerald-200">
                          {weightData.total_weight.toLocaleString("id-ID")} KG
                        </p>
                      )}
                    </div>
                  )}

                  {(currentStepId === 4 || effectiveDetailStepId === 4) && (
                    <div className="space-y-4">
                      {!axleData ? (
                        <p className="text-3xl text-blue-200">
                          Menunggu data sumbu...
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-8xl font-black text-emerald-200">
                            {axleData.total_axles} SUMBU
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(currentStepId === 5 || effectiveDetailStepId === 5) && (
                    <div className="space-y-4">
                      {!dimensionData || isProcessing ? (
                        <p className="text-3xl text-blue-200">
                          {isProcessing
                            ? "Mengolah data..."
                            : "Menunggu data..."}
                        </p>
                      ) : (
                        <p className="text-8xl font-black text-emerald-200">
                          P {dimensionLengthValue.toFixed(2)} • L{" "}
                          {dimensionData.width.toFixed(2)} • T{" "}
                          {dimensionData.height.toFixed(2)} m
                        </p>
                      )}
                    </div>
                  )}

                  {(currentStepId === 6 || effectiveDetailStepId === 6) && (
                    <div className="space-y-10">
                      <p
                        className={`text-8xl font-black ${
                          violationResult === "Normal"
                            ? "text-emerald-200"
                            : violationResult
                              ? "text-red-200"
                              : "text-blue-200"
                        }`}
                      >
                        {finalResultLabel}
                      </p>
                      <p className="text-6xl font-black text-emerald-200">
                        {anprData?.plate_no || "-"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              {displaySteps.map((step) => {
                const isActive = step.id === currentStepId;
                const isSelected = step.id === effectiveDetailStepId;
                const isCompleted = step.status === "completed";
                const canView = isCompleted && step.id >= 2;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (canView) {
                        handleShowDetail(step.id);
                      }
                    }}
                    disabled={!canView}
                    className={`h-16 w-16 rounded-full border-2 text-2xl font-bold transition ${
                      isCompleted
                        ? "border-emerald-400 text-emerald-200"
                        : isActive
                          ? "border-blue-400 text-blue-200"
                          : "border-slate-700 text-slate-500"
                    } ${isSelected ? "ring-4 ring-blue-500" : ""} ${
                      canView ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    {step.id}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center gap-6">
              <button
                type="button"
                onClick={handleResetToStep1}
                className="rounded-full border-2 border-slate-500 px-10 py-4 text-2xl font-semibold text-white hover:border-slate-300"
              >
                Muat Ulang
              </button>
              {currentStepId === 6 && (
                <button
                  type="button"
                  onClick={handleViewDetail}
                  className="rounded-full border-2 border-emerald-400 px-10 py-4 text-2xl font-semibold text-emerald-200 hover:border-emerald-200"
                >
                  Lihat Detail
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <CheckmarkCircle24Filled className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Proses Pengecekan ODOL
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Monitoring penimbangan dan deteksi kendaraan waktu nyata
              </p>
            </div>
          </div>
          <Button appearance="secondary" onClick={handleClickerMode}>
            Mode Klik
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="mx-8 mt-6">
        <Card className="shadow-sm bg-white">
          <div className="p-2">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-blue-600 transition-all duration-500"
                style={{ width: `${((currentStepId - 1) / 5) * 100}%` }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {displaySteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center w-28"
                  >
                    <button
                      onClick={() => {
                        if (step.status === "completed" && step.id >= 2) {
                          handleShowDetail(step.id);
                        }
                      }}
                      disabled={step.status !== "completed" || step.id < 2}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                        step.status === "completed"
                          ? "bg-green-700 text-white cursor-pointer hover:bg-green-600 shadow-sm hover:shadow-md"
                          : step.status === "active"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white border-2 border-gray-300 text-gray-400"
                      } ${
                        step.status === "completed" && step.id >= 2
                          ? ""
                          : "cursor-default"
                      } ${
                        effectiveDetailStepId === step.id
                          ? "ring-4 ring-blue-400"
                          : ""
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckmarkCircle24Filled className="w-5 h-5" />
                      ) : (
                        <span className="text-base font-semibold">
                          {step.id}
                        </span>
                      )}
                    </button>
                    <div className="mt-2.5 text-center">
                      <p
                        className={`text-xs font-medium leading-tight ${
                          step.status === "active"
                            ? "text-blue-600"
                            : step.status === "completed"
                              ? "text-gray-700"
                              : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </p>
                      {step.status === "completed" && step.id >= 2 && (
                        <span className="block text-[10px] text-green-600 mt-0.5 font-medium">
                          Klik untuk detail
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Area */}
      <div className="flex-1 mx-8 my-6 overflow-hidden">
        <Card
          id="content-area"
          className="shadow-sm bg-white h-full flex flex-col"
        >
          <div className="p-6 overflow-y-auto flex-1">
            {/* Step 1: Waiting */}
            {currentStepId === 1 && !effectiveDetailStepId && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Sistem Siap
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {["Kamera ANPR", "Kamera Sumbu", "Jembatan Timbang"].map(
                    (device) => (
                      <div
                        key={device}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CheckmarkCircle24Filled className="text-green-600 w-5 h-5" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">
                              {device}
                            </p>
                            <p className="text-xs text-green-600">Terhubung</p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <Spinner size="extra-large" className="mb-3" />
                  <p className="text-lg font-semibold text-blue-900 mt-3">
                    Sistem akan dimulai dalam {countdown} detik
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Silakan posisikan kendaraan di jalur penimbangan
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: ANPR Detection */}
            {(currentStepId === 2 || effectiveDetailStepId === 2) && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Deteksi Nomor Plat
                </h2>

                {!anprData ? (
                  <div className="text-center py-10">
                    <Spinner size="extra-large" className="mb-3" />
                    <p className="text-lg font-semibold text-gray-700 mt-3">
                      {timedOutSteps.includes(2)
                        ? "Waktu tunggu habis, data ANPR belum tersedia"
                        : "Mendeteksi nomor plat kendaraan..."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {timedOutSteps.includes(2)
                        ? "Sistem lanjut ke step berikutnya, listener tetap berjalan di background"
                        : "Pastikan kendaraan berada di posisi yang tepat"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* License Plate Hero Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-blue-900 text-sm font-medium mb-3 uppercase tracking-wide">
                            Plat Nomor Kendaraan
                          </p>
                          <div className="bg-white rounded-lg px-8 py-4 inline-flex shadow-sm border-2 border-blue-900">
                            <p className="text-5xl font-black text-gray-900 tracking-[0.2em] font-mono">
                              {anprData.plate_no}
                            </p>
                          </div>
                        </div>

                        {/* Confidence Circle */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 transform -rotate-90">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="rgba(59, 130, 246, 0.2)"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="rgb(34, 197, 94)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${
                                  2 *
                                  Math.PI *
                                  40 *
                                  (1 - anprData.confidence / 100)
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <p className="text-2xl font-bold text-green-600">
                                {anprData.confidence.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image and Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Image */}
                      {anprData.minio_bucket &&
                        anprData.minio_full_image_object && (
                          <div className="relative h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-900 shadow-sm">
                            <Image
                              src={getMinioImageUrl(
                                anprData.minio_bucket,
                                anprData.minio_full_image_object,
                              )}
                              alt="Tangkapan ANPR"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckmarkCircle24Filled className="text-green-600 w-5 h-5" />
                            <p className="text-sm font-semibold text-green-900">
                              Deteksi Berhasil
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            Sistem berhasil mendeteksi plat nomor kendaraan
                            dengan tingkat akurasi tinggi
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase mb-1.5 font-medium">
                            Waktu Deteksi
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {new Date(anprData.captured_at).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(anprData.captured_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase mb-1.5 font-medium">
                            ID Transaksi
                          </p>
                          <p className="text-xs font-mono text-gray-700 break-all">
                            {anprData.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Weighing */}
            {(currentStepId === 3 || effectiveDetailStepId === 3) && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Penimbangan Kendaraan
                </h2>

                {!weightData ? (
                  <div className="text-center py-10">
                    <Spinner size="extra-large" className="mb-3" />
                    <p className="text-lg font-semibold text-gray-700 mt-3">
                      {timedOutSteps.includes(3)
                        ? "Waktu tunggu habis, data penimbangan belum tersedia"
                        : "Sedang menimbang kendaraan..."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {timedOutSteps.includes(3)
                        ? "Sistem lanjut ke step berikutnya, listener tetap berjalan di background"
                        : "Mohon kendaraan tetap berada di atas timbangan"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-xs text-gray-600 uppercase mb-2 font-medium">
                        Total Berat Kendaraan
                      </p>
                      <p className="text-5xl font-bold text-blue-900 mb-1">
                        {weightData.total_weight.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xl font-semibold text-blue-800">KG</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Axle Detection */}
            {(currentStepId === 4 || effectiveDetailStepId === 4) && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Deteksi Konfigurasi Sumbu
                </h2>

                {!axleData ? (
                  <div className="text-center py-10">
                    <Spinner size="extra-large" className="mb-3" />
                    <p className="text-lg font-semibold text-gray-700 mt-3">
                      {timedOutSteps.includes(4)
                        ? "Waktu tunggu habis, data sumbu belum tersedia"
                        : "Mendeteksi jumlah dan konfigurasi sumbu..."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {timedOutSteps.includes(4)
                        ? "Sistem lanjut ke step berikutnya, listener tetap berjalan di background"
                        : "Menunggu hasil kamera sumbu"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Axle Info Hero Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                      <p className="text-blue-900 text-sm font-medium mb-4 uppercase tracking-wide">
                        Konfigurasi Sumbu & Roda
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Total Sumbu
                          </p>
                          <p className="text-4xl font-black text-gray-900 font-mono">
                            {axleData.total_axles}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Total Roda
                          </p>
                          <p className="text-4xl font-black text-gray-900 font-mono">
                            {axleData.total_wheels}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Kelas Kendaraan
                          </p>
                          <p className="text-2xl font-black text-gray-900">
                            {vehicleClassData?.type || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Image and Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Image */}
                      {axleData.minio_bucket && axleData.minio_image_object && (
                        <div className="relative h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-900 shadow-sm">
                          <Image
                            src={getMinioImageUrl(
                              axleData.minio_bucket,
                              axleData.minio_image_object,
                            )}
                            alt="Deteksi Sumbu"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckmarkCircle24Filled className="text-green-600 w-5 h-5" />
                            <p className="text-sm font-semibold text-green-900">
                              Deteksi Berhasil
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            Sistem berhasil mendeteksi konfigurasi sumbu dan
                            roda kendaraan
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase mb-1.5 font-medium">
                            Waktu Deteksi
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {axleData.created_date
                              ? new Date(axleData.created_date).toLocaleString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  },
                                )
                              : "-"}
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase mb-1.5 font-medium">
                            ID Ref
                          </p>
                          <p className="text-xs font-mono text-gray-700 break-all">
                            {axleData.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Dimension Measurement */}
            {(currentStepId === 5 || effectiveDetailStepId === 5) && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ukur Dimensi
                </h2>

                {!dimensionData || isProcessing ? (
                  <div className="text-center py-10">
                    <Spinner size="extra-large" className="mb-3" />
                    <p className="text-lg font-semibold text-gray-700 mt-3">
                      {!dimensionData
                        ? timedOutSteps.includes(5)
                          ? "Waktu tunggu habis, data dimensi belum tersedia"
                          : "Menghitung dimensi kendaraan..."
                        : "Mengolah data..."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {!dimensionData && timedOutSteps.includes(5)
                        ? "Sistem lanjut ke hasil akhir, listener tetap berjalan di background"
                        : "Menunggu respons dari perangkat dimensi"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Dimension Hero Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                      <p className="text-blue-900 text-sm font-medium mb-4 uppercase tracking-wide">
                        Dimensi Kendaraan
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Panjang (L)
                          </p>
                          <p className="text-4xl font-black text-gray-900 font-mono">
                            {dimensionLengthValue.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 font-semibold mt-1">
                            meter
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Lebar (W)
                          </p>
                          <p className="text-4xl font-black text-gray-900 font-mono">
                            {dimensionData.width.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 font-semibold mt-1">
                            meter
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Tinggi (H)
                          </p>
                          <p className="text-4xl font-black text-gray-900 font-mono">
                            {dimensionData.height.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 font-semibold mt-1">
                            meter
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Image and Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Image */}
                      {anprData.minio_bucket &&
                        anprData.minio_full_image_object && (
                          <div className="relative h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-900 shadow-sm">
                            <Image
                              src={getMinioImageUrl(
                                anprData.minio_bucket,
                                anprData.minio_full_image_object,
                              )}
                              alt="Tangkapan Dimensi"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckmarkCircle24Filled className="text-green-600 w-5 h-5" />
                            <p className="text-sm font-semibold text-green-900">
                              Deteksi Berhasil
                            </p>
                          </div>
                          <p className="text-xs text-green-700">
                            Sistem berhasil mengukur dimensi kendaraan
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase mb-1.5 font-medium">
                            Waktu Deteksi
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {dimensionData.created_date
                              ? new Date(
                                  dimensionData.created_date,
                                ).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "-"}
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase mb-1.5 font-medium">
                            ID Ref
                          </p>
                          <p className="text-xs font-mono text-gray-700 break-all">
                            {dimensionData.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Summary */}
            {(currentStepId === 6 || effectiveDetailStepId === 6) && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Ringkasan Pengecekan ODOL
                </h2>
                <p className="text-sm text-gray-600">
                  Semua step selesai. Data yang belum tersedia akan tetap
                  dilanjutkan lewat listener background.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                      <p className="text-xs uppercase font-semibold text-blue-800">
                        Step 2 - ANPR
                      </p>
                      <p className="mt-2 text-sm text-gray-600">Plat Nomor</p>
                      <p className="text-2xl font-black text-gray-900 font-mono">
                        {anprData?.plate_no || "-"}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        {anprData
                          ? `Akurasi ${anprData.confidence?.toFixed(0) || 0}%`
                          : timedOutSteps.includes(2)
                            ? "Timeout 10 detik"
                            : "Menunggu data"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50">
                      <p className="text-xs uppercase font-semibold text-indigo-800">
                        Step 3 - Timbang
                      </p>
                      <p className="mt-2 text-sm text-gray-600">Berat Total</p>
                      <p className="text-2xl font-black text-gray-900">
                        {weightData
                          ? `${weightData.total_weight.toLocaleString("id-ID")} KG`
                          : "-"}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        {weightData
                          ? `Total axle timbang ${weightData.total_axle || 0}`
                          : timedOutSteps.includes(3)
                            ? "Timeout 10 detik"
                            : "Menunggu data"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <p className="text-xs uppercase font-semibold text-amber-800">
                        Step 4 - Sumbu
                      </p>
                      <p className="mt-2 text-sm text-gray-600">Konfigurasi</p>
                      <p className="text-2xl font-black text-gray-900">
                        {axleData ? `${axleData.total_axles} Sumbu` : "-"}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        {axleData
                          ? `${axleData.total_wheels} roda`
                          : timedOutSteps.includes(4)
                            ? "Timeout 10 detik"
                            : "Menunggu data"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-teal-200 bg-teal-50">
                      <p className="text-xs uppercase font-semibold text-teal-800">
                        Step 5 - Dimensi
                      </p>
                      <p className="mt-2 text-sm text-gray-600">P x L x T</p>
                      <p className="text-2xl font-black text-gray-900">
                        {dimensionData
                          ? `${dimensionLengthValue.toFixed(2)} x ${dimensionData.width.toFixed(2)} x ${dimensionData.height.toFixed(2)} m`
                          : "-"}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        {dimensionData
                          ? "Data dimensi diterima"
                          : timedOutSteps.includes(5)
                            ? "Timeout 10 detik"
                            : "Menunggu data"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        violationResult
                          ? violationResult === "Normal"
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <p className="text-xs uppercase font-semibold text-gray-700">
                        Hasil Akhir
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {violationResult ? (
                          violationResult === "Normal" ? (
                            <CheckmarkCircle24Filled className="w-6 h-6 text-green-600" />
                          ) : (
                            <Warning24Filled className="w-6 h-6 text-red-600" />
                          )
                        ) : (
                          <Spinner size="tiny" />
                        )}
                        <p className="text-xl font-black text-gray-900">
                          {finalResultLabel}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        ID Transaksi: {vehicleActualId || "belum tersedia"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-white">
        <Button
          appearance="secondary"
          icon={<ArrowCounterclockwise24Regular />}
          onClick={handleResetToStep1}
          size="medium"
        >
          Mulai Ulang
        </Button>

        {currentStepId === 6 && (
          <Button appearance="primary" onClick={handleViewDetail} size="medium">
            Lihat Detail
          </Button>
        )}
      </div>
    </div>
  );
};
