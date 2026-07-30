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
  const STEP_MIN_DURATION_MS = 10_000;
  const FINAL_WAIT_IDLE_TIMEOUT_MS = 60_000;

  const router = useRouter();

  // Use Processing Context
  const {
    steps,
    currentStepId,
    countdown,
    sessionId,
    sessionStartTime,
    sessionStatus,
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
    setSessionStatus,
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
    restartProcessingSteps,
  } = useProcessing();

  // Local states
  const sessionStartTimeRef = useRef<string | null>(null);
  const [detailStepId, setDetailStepId] = useState<number | null>(null);
  const [timedOutSteps, setTimedOutSteps] = useState<number[]>([]);
  const [finalWaitRemainingMs, setFinalWaitRemainingMs] = useState(
    FINAL_WAIT_IDLE_TIMEOUT_MS,
  );
  const insertingVehicleActualRef = useRef(false);
  const cctvWaitStartRef = useRef<number | null>(null);
  const cctvLinkedRef = useRef(false);
  const updatingCctvRef = useRef(false);
  const finalWaitStartedAtRef = useRef<number | null>(null);
  const finalWaitLastDataAtRef = useRef<number | null>(null);
  const finalDataSignatureRef = useRef<string | null>(null);
  const currentStepHasDataRef = useRef(false);

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
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !sessionId || !shouldListenLiveData,
    });

  const { data: weightSubscriptionData } =
    useSubscribeLatestWeighingSubscription({
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !sessionId || !shouldListenLiveData,
    });

  const { data: axleSubscriptionData } =
    useSubscribeLatestAxleCaptureSubscription({
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !sessionId || !shouldListenLiveData,
    });

  const {
    data: dimensionSubscriptionData,
    loading: dimensionLoading,
    error: dimensionError,
  } = useSubscribeLatestDimensionSubscription({
    variables: {
      session_id: sessionId as string,
      site_id: siteId,
    },
    skip: !sessionId || !shouldListenLiveData,
  });

  const { data: cctvSubscriptionData } = useSubscribeLatestCctvSubscription({
    variables: {
      session_id: sessionId as string,
      site_id: siteId,
    },
    skip: !sessionId || !shouldListenLiveData,
  });

  // Debug subscriptions
  useEffect(() => {
    console.log(`=== Step ${currentStepId} Started ===`, {
      sessionId,
      sessionStartTime,
      siteId,
      timestamp: new Date().toISOString(),
    });
  }, [currentStepId, sessionId, sessionStartTime, siteId]);

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
      isSkipped: !sessionId || !shouldListenLiveData,
      rawData: dimensionSubscriptionData?.transact_dimension,
    });
  }, [
    dimensionSubscriptionData,
    dimensionData,
    siteId,
    sessionStartTime,
    shouldListenLiveData,
    sessionId,
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
    const anpr = anprSubscriptionData?.transact_anpr_capture?.[0];
    if (!anpr) return;

    const nextAnprData = {
      id: anpr.id,
      plate_no: anpr.plate_no ?? null,
      confidence: anpr.confidence ?? null,
      captured_at: anpr.captured_at ?? null,
      minio_bucket: anpr.minio_bucket ?? null,
      minio_full_image_object: anpr.minio_full_image_object ?? null,
      site_id: anpr.site_id ?? null,
      session_id: sessionId,
    };

    const hasChanged =
      !anprData ||
      anprData.id !== nextAnprData.id ||
      anprData.plate_no !== nextAnprData.plate_no ||
      anprData.confidence !== nextAnprData.confidence ||
      anprData.captured_at !== nextAnprData.captured_at ||
      anprData.minio_bucket !== nextAnprData.minio_bucket ||
      anprData.minio_full_image_object !== nextAnprData.minio_full_image_object;

    if (!hasChanged) return;

    console.log("✅ ANPR Data Received/Updated:", nextAnprData);
    setAnprData(nextAnprData);
  }, [anprSubscriptionData, anprData, sessionId, setAnprData]);

  // Handle Weight Data (always listen in background after countdown)
  useEffect(() => {
    const weight = weightSubscriptionData?.transact_weighing?.[0];
    if (!weight) return;

    const nextWeightData = {
      id: weight.id,
      total_weight: weight.total_weight ?? null,
      total_axle: weight.total_axle ?? null,
      session_id: sessionId,
    };

    const hasChanged =
      !weightData ||
      weightData.id !== nextWeightData.id ||
      weightData.total_weight !== nextWeightData.total_weight ||
      weightData.total_axle !== nextWeightData.total_axle;

    if (!hasChanged) return;

    console.log("✅ Weight Data Received/Updated:", nextWeightData);
    setWeightData(nextWeightData);

    const axleCount = weight.total_axle ?? null;
    const vehicleClass =
      axleCount != null ? findClosestVehicleClass(axleCount) : null;
    if (vehicleClass) {
      console.log(
        "✅ Vehicle Class Found (WIM Axle: " + axleCount + "):",
        vehicleClass,
      );
      setVehicleClassData(vehicleClass);
    } else {
      console.warn("⚠️ No vehicle class found for WIM axle count:", axleCount);
    }
  }, [
    weightSubscriptionData,
    weightData,
    findClosestVehicleClass,
    sessionId,
    setWeightData,
    setVehicleClassData,
  ]);

  // Handle Axle Data (always listen in background after countdown)
  useEffect(() => {
    const axle = axleSubscriptionData?.transact_axle_capture?.[0];
    if (!axle) return;

    const nextAxleData = {
      id: axle.id,
      total_axles: axle.total_axles ?? null,
      total_wheels: axle.total_wheels ?? null,
      length_mm: axle.length_mm ?? null,
      length: axle.length_mm != null ? axle.length_mm / 1000 : null,
      vehicle_category: axle.vehicle_category ?? null,
      minio_bucket: axle.minio_bucket ?? null,
      minio_image_object: axle.minio_image_object ?? null,
      session_id: sessionId,
    };

    const hasChanged =
      !axleData ||
      axleData.id !== nextAxleData.id ||
      axleData.total_axles !== nextAxleData.total_axles ||
      axleData.total_wheels !== nextAxleData.total_wheels ||
      axleData.length_mm !== nextAxleData.length_mm ||
      axleData.vehicle_category !== nextAxleData.vehicle_category ||
      axleData.minio_bucket !== nextAxleData.minio_bucket ||
      axleData.minio_image_object !== nextAxleData.minio_image_object;

    if (!hasChanged) return;

    console.log("✅ Axle Data Received/Updated:", nextAxleData);
    setAxleData(nextAxleData);
  }, [
    axleSubscriptionData,
    axleData,
    sessionId,
    setAxleData,
  ]);

  // Handle CCTV Data (always listen in background after countdown)
  useEffect(() => {
    const cctv = cctvSubscriptionData?.transact_cctv?.[0];
    if (!cctv) return;

    const nextCctvData = {
      id: cctv.id,
      filename: cctv.filename,
      filepath: cctv.filepath,
      created_date: cctv.created_date,
      site_id: cctv.site_id,
      session_id: sessionId,
    };

    const hasChanged =
      !cctvData ||
      cctvData.id !== nextCctvData.id ||
      cctvData.filename !== nextCctvData.filename ||
      cctvData.filepath !== nextCctvData.filepath ||
      cctvData.created_date !== nextCctvData.created_date;

    if (!hasChanged) return;

    console.log("✅ CCTV Data Received/Updated:", nextCctvData);
    setCctvData(nextCctvData);
  }, [cctvSubscriptionData, cctvData, sessionId, setCctvData]);

  // Handle Dimension Data (always listen in background after countdown)
  useEffect(() => {
    const dimension = dimensionSubscriptionData?.transact_dimension?.[0];
    if (!dimension) return;

    const nextDimensionData = {
      id: dimension.id,
      length: dimension.length ?? null,
      width: dimension.width ?? null,
      height: dimension.height ?? null,
      anpr_id: dimension.anpr_id ?? null,
      filepath: dimension.filepath ?? null,
      session_id: sessionId,
    };

    const hasChanged =
      !dimensionData ||
      dimensionData.id !== nextDimensionData.id ||
      dimensionData.length !== nextDimensionData.length ||
      dimensionData.width !== nextDimensionData.width ||
      dimensionData.height !== nextDimensionData.height ||
      dimensionData.anpr_id !== nextDimensionData.anpr_id ||
      dimensionData.filepath !== nextDimensionData.filepath;

    if (!hasChanged) return;

    console.log("✅ Dimension Data Received/Updated:", nextDimensionData);
    setDimensionData(nextDimensionData);
    if (!cctvWaitStartRef.current) {
      cctvWaitStartRef.current = Date.now();
    }
  }, [dimensionSubscriptionData, dimensionData, sessionId, setDimensionData]);

  // Step 2-5: each step must stay at least 13s before moving.
  const currentStepHasData = useMemo(() => {
    if (currentStepId === 2) return !!anprData;
    if (currentStepId === 3) return !!weightData;
    if (currentStepId === 4) return weightData?.total_axle != null;
    if (currentStepId === 5) return !!dimensionData;
    return false;
  }, [currentStepId, anprData, weightData, dimensionData]);

  useEffect(() => {
    currentStepHasDataRef.current = currentStepHasData;
  }, [currentStepHasData]);

  useEffect(() => {
    if (currentStepId < 2 || currentStepId > 5) return;

    const stepId = currentStepId;
    currentStepHasDataRef.current = currentStepHasData;

    const timer = setTimeout(() => {
      if (!currentStepHasDataRef.current) {
        setTimedOutSteps((prev) =>
          prev.includes(stepId) ? prev : [...prev, stepId],
        );
      }
      moveToNextStep();
    }, STEP_MIN_DURATION_MS);

    return () => clearTimeout(timer);
  }, [currentStepId, currentStepHasData, moveToNextStep, STEP_MIN_DURATION_MS]);

  const finalDataPresence = useMemo(
    () => ({
      anpr: !!anprData,
      weight: !!weightData,
      axle: weightData?.total_axle != null,
      dimension: !!dimensionData,
      cctv: !!cctvData,
    }),
    [anprData, weightData, dimensionData, cctvData],
  );

  const isFinalDataComplete = Object.values(finalDataPresence).every(Boolean);
  const missingFinalAreas = Object.entries(finalDataPresence)
    .filter(([, hasData]) => !hasData)
    .map(([area]) => area.toUpperCase());
  const finalDataSignature = JSON.stringify(finalDataPresence);

  const finalizeVehicleActual = useCallback(async () => {
    if (!sessionId) return;
    if (vehicleActualId || insertingVehicleActualRef.current) return;

    const latestCctvId =
      cctvData?.id ?? cctvSubscriptionData?.transact_cctv?.[0]?.id ?? undefined;

    insertingVehicleActualRef.current = true;
    setIsProcessing(true);

    try {
      const object: Record<string, unknown> = {
        session_id: sessionId,
        site_id: siteId,
        actual_width: dimensionData?.width ?? null,
        actual_length: dimensionData?.length ?? null,
        actual_height: dimensionData?.height ?? null,
        actual_weight: weightData?.total_weight ?? null,
        actual_plat_no: anprData?.plate_no ?? null,
        actual_total_axle: weightData?.total_axle ?? null,
        is_active: true,
        is_deleted: false,
        created_by: "00000000-0000-0000-0000-000000000000",
        created_date: new Date().toISOString(),
      };

      if (anprData?.id) object.anpr_id = anprData.id;
      if (axleData?.id) object.axle_id = axleData.id;
      if (dimensionData?.id) object.transact_dimension_id = dimensionData.id;
      if (weightData?.id) object.transact_weighing_id = weightData.id;
      if (latestCctvId) object.transact_cctv_id = latestCctvId;

      const result = await insertVehicleActual({
        variables: {
          object: object as any,
        },
      });

      const id = result.data?.insert_transact_vehicle_actual_one?.id;
      if (id) {
        setVehicleActualId(id);
        cctvLinkedRef.current = !!latestCctvId;
        console.log("✅ Vehicle Actual Created with ID:", id, {
          isFinalDataComplete,
          missingFinalAreas,
        });
        try {
          const finishedAt = new Date().toISOString();
          await updateTransactWimSession({
            variables: {
              id: sessionId,
              set: {
                status: "COMPLETED",
                ended_at: finishedAt,
                is_active: false,
                updated_date: finishedAt,
              },
            },
          });
          setSessionStatus("COMPLETED");
        } catch (error) {
          console.error("Error updating WIM session status:", error);
        }
      }
    } catch (error) {
      console.error("Error inserting vehicle actual:", error);
    } finally {
      setIsProcessing(false);
      insertingVehicleActualRef.current = false;
    }
  }, [
    sessionId,
    vehicleActualId,
    cctvData,
    cctvSubscriptionData,
    setIsProcessing,
    siteId,
    dimensionData,
    axleData,
    weightData,
    anprData,
    insertVehicleActual,
    setVehicleActualId,
    isFinalDataComplete,
    missingFinalAreas,
    updateTransactWimSession,
    setSessionStatus,
  ]);

  useEffect(() => {
    if (currentStepId !== 6 || !sessionId || vehicleActualId) {
      finalWaitStartedAtRef.current = null;
      finalWaitLastDataAtRef.current = null;
      finalDataSignatureRef.current = null;
      setFinalWaitRemainingMs(FINAL_WAIT_IDLE_TIMEOUT_MS);
      return;
    }

    const now = Date.now();
    if (!finalWaitStartedAtRef.current) {
      finalWaitStartedAtRef.current = now;
      finalWaitLastDataAtRef.current = now;
      finalDataSignatureRef.current = finalDataSignature;
      setFinalWaitRemainingMs(FINAL_WAIT_IDLE_TIMEOUT_MS);
      return;
    }

    if (
      finalDataSignatureRef.current &&
      finalDataSignatureRef.current !== finalDataSignature
    ) {
      finalDataSignatureRef.current = finalDataSignature;
      finalWaitLastDataAtRef.current = now;
      setFinalWaitRemainingMs(FINAL_WAIT_IDLE_TIMEOUT_MS);
      console.log("📥 Final step received additional data, reset idle timer", {
        finalDataPresence,
      });
    }
  }, [
    currentStepId,
    sessionId,
    vehicleActualId,
    finalDataSignature,
    finalDataPresence,
    FINAL_WAIT_IDLE_TIMEOUT_MS,
  ]);

  useEffect(() => {
    if (currentStepId !== 6 || !sessionId || vehicleActualId) return;
    if (insertingVehicleActualRef.current) return;

    if (isFinalDataComplete) {
      void finalizeVehicleActual();
      return;
    }

    const timer = setInterval(() => {
      const lastDataAt = finalWaitLastDataAtRef.current;
      if (!lastDataAt) return;

      const remainingMs = Math.max(
        0,
        FINAL_WAIT_IDLE_TIMEOUT_MS - (Date.now() - lastDataAt),
      );
      setFinalWaitRemainingMs(remainingMs);

      if (remainingMs === 0) {
        clearInterval(timer);
        void finalizeVehicleActual();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentStepId,
    sessionId,
    vehicleActualId,
    isFinalDataComplete,
    finalizeVehicleActual,
    FINAL_WAIT_IDLE_TIMEOUT_MS,
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
    const hasAnalysisData =
      weightData?.total_weight != null &&
      dimensionData?.length != null &&
      dimensionData?.width != null &&
      dimensionData?.height != null &&
      vehicleClassData;

    if (hasAnalysisData && !contextViolationResult) {
      // Import checkOdolViolation from odol utility
      // IMPORTANT: weightData.total_weight is in KG, but class_3_weight limit is in TON
      // So we need to convert KG to TON for comparison
      const actual: VehicleActual = {
        total_weight: weightData.total_weight / 1000, // Convert KG to TON
        length: dimensionData.length,
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
      const axleCount = weightData?.total_axle || vehicleClassData?.total_axle || 0;
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
          length: dimensionData.length,
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
  const dimensionLengthValue = dimensionData?.length ?? 0;
  const formatNumber = (value: number | null | undefined, fallback = "-") =>
    value != null ? value.toLocaleString("id-ID") : fallback;
  const formatFixed = (
    value: number | null | undefined,
    digits = 2,
    fallback = "-",
  ) => (value != null ? value.toFixed(digits) : fallback);
  const isSummaryStep = currentStepId === 6;
  const effectiveDetailStepId =
    isSummaryStep && detailStepId === null ? 6 : detailStepId;
  const displaySteps = steps;
  const finalResultLabel = violationResult
    ? violationResult
    : vehicleActualId
      ? "Data selesai di proses"
      : "Menunggu Data Lengkap";
  const finalWaitRemainingSeconds = Math.ceil(finalWaitRemainingMs / 1000);

  const handleResetToStep1 = useCallback(() => {
    insertingVehicleActualRef.current = false;
    cctvWaitStartRef.current = null;
    cctvLinkedRef.current = false;
    updatingCctvRef.current = false;
    finalWaitStartedAtRef.current = null;
    finalWaitLastDataAtRef.current = null;
    finalDataSignatureRef.current = null;
    setFinalWaitRemainingMs(FINAL_WAIT_IDLE_TIMEOUT_MS);
    setDetailStepId(null);
    setTimedOutSteps([]);

    if (sessionStatus === "COMPLETED" || !sessionId) {
      sessionStartTimeRef.current = null;
      resetProcessing();
      return;
    }

    sessionStartTimeRef.current = sessionStartTime;
    restartProcessingSteps();
    setPhase("processing");
  }, [
    resetProcessing,
    restartProcessingSteps,
    sessionId,
    sessionStartTime,
    sessionStatus,
    setPhase,
    FINAL_WAIT_IDLE_TIMEOUT_MS,
  ]);

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
                            {anprData.plate_no || "-"}
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
                          {formatNumber(weightData.total_weight)} KG
                        </p>
                      )}
                    </div>
                  )}

                  {(currentStepId === 4 || effectiveDetailStepId === 4) && (
                    <div className="space-y-4">
                      {weightData?.total_axle == null ? (
                        <p className="text-3xl text-blue-200">
                          Menunggu data sumbu...
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-8xl font-black text-emerald-200">
                            {weightData.total_axle} SUMBU
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
                          P {formatFixed(dimensionLengthValue)} • L{" "}
                          {formatFixed(dimensionData.width)} • T{" "}
                          {formatFixed(dimensionData.height)} m
                        </p>
                      )}
                    </div>
                  )}

                  {(currentStepId === 6 || effectiveDetailStepId === 6) && (
                    <div className="space-y-10">
                      {!vehicleActualId && !isFinalDataComplete && (
                        <p className="text-3xl text-blue-200">
                          Menunggu data tambahan {finalWaitRemainingSeconds}{" "}
                          detik
                        </p>
                      )}
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
      {/* Header — slim bar */}
      <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <CheckmarkCircle24Filled className="text-white w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 leading-none">
              Proses Pengecekan ODOL
            </span>
            <span className="ml-2 text-xs text-gray-400 hidden sm:inline">
              Monitoring penimbangan &amp; deteksi kendaraan waktu nyata
            </span>
          </div>
        </div>
        <Button appearance="subtle" size="small" onClick={handleClickerMode}>
          Mode Klik
        </Button>
      </div>

      {/* Stepper — compact inline pill strip */}
      <div className="px-5 py-2 bg-white border-b border-gray-100 shrink-0">
        <div className="relative flex items-center gap-0">
          {/* Background track */}
          <div className="absolute inset-y-1/2 left-4 right-4 h-px bg-gray-200 -translate-y-1/2" />
          <div
            className="absolute inset-y-1/2 left-4 h-px bg-blue-500 transition-all duration-500 -translate-y-1/2"
            style={{
              width: `calc(${((currentStepId - 1) / (displaySteps.length - 1)) * 100}% - 2rem)`,
            }}
          />
          <div className="relative flex w-full justify-between">
            {displaySteps.map((step) => {
              const isClickable = step.status === "completed" && step.id >= 2;
              const isSelected = effectiveDetailStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && handleShowDetail(step.id)}
                  disabled={!isClickable}
                  title={step.title}
                  className={`group flex flex-col items-center gap-0.5 focus:outline-none ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 border-2
                      ${
                        step.status === "completed"
                          ? isSelected
                            ? "bg-blue-600 border-blue-600 text-white ring-2 ring-blue-300"
                            : "bg-green-600 border-green-600 text-white hover:bg-green-500"
                          : step.status === "active"
                            ? "bg-blue-600 border-blue-600 text-white animate-pulse"
                            : "bg-white border-gray-300 text-gray-400"
                      }`}
                  >
                    {step.status === "completed" ? (
                      <CheckmarkCircle24Filled className="w-3.5 h-3.5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight max-w-[4.5rem] text-center truncate
                      ${step.status === "active" ? "text-blue-600" : step.status === "completed" ? "text-gray-600" : "text-gray-400"}`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 mx-5 my-4 overflow-hidden">
        <Card
          id="content-area"
          className="shadow-sm bg-white h-full flex flex-col"
        >
          <div className="p-4 overflow-y-auto flex-1">
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
                                  (1 - (anprData.confidence ?? 0) / 100)
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <p className="text-2xl font-bold text-green-600">
                                {formatFixed(anprData.confidence, 0, "0")}%
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
                            {anprData.captured_at
                              ? new Date(
                                  anprData.captured_at,
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "-"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {anprData.captured_at
                              ? new Date(
                                  anprData.captured_at,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "-"}
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
                        {formatNumber(weightData.total_weight)}
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

                {weightData?.total_axle == null ? (
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
                        : "Menunggu total sumbu dari WIM"}
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
                            {weightData.total_axle}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg px-6 py-4 shadow-sm border-2 border-gray-300">
                          <p className="text-xs text-gray-600 uppercase mb-1 font-medium">
                            Total Roda
                          </p>
                          <p className="text-4xl font-black text-gray-900 font-mono">
                            {axleData?.total_wheels ?? "-"}
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
                      {axleData?.minio_bucket && axleData?.minio_image_object && (
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
                            {axleData?.created_date
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
                            {axleData?.id ?? "-"}
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
                            {formatFixed(dimensionLengthValue)}
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
                            {formatFixed(dimensionData.width)}
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
                            {formatFixed(dimensionData.height)}
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
                      {anprData?.minio_bucket &&
                        anprData?.minio_full_image_object && (
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
                {!vehicleActualId && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">
                      Finalisasi menunggu data tambahan
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      Sistem akan menunggu sampai semua area lengkap. Jika tidak
                      ada data baru selama {finalWaitRemainingSeconds} detik,
                      data saat ini akan langsung diinsert dan session ditutup.
                    </p>
                    {!isFinalDataComplete && missingFinalAreas.length > 0 && (
                      <p className="mt-2 text-xs text-blue-800">
                        Area yang belum lengkap: {missingFinalAreas.join(", ")}
                      </p>
                    )}
                  </div>
                )}

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
                          ? `${formatNumber(weightData.total_weight)} KG`
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
                        {weightData?.total_axle != null ? `${weightData.total_axle} Sumbu` : "-"}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        {weightData?.total_axle != null
                          ? (axleData?.total_wheels != null ? `${axleData.total_wheels} roda` : "Dari data WIM")
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
                          ? `${formatFixed(dimensionLengthValue)} x ${formatFixed(dimensionData.width)} x ${formatFixed(dimensionData.height)} m`
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
                        ) : !vehicleActualId ? (
                          <Spinner size="tiny" />
                        ) : null}
                        <p className="text-xl font-black text-gray-900">
                          {finalResultLabel}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        ID Transaksi: {vehicleActualId || "belum tersedia"}
                      </p>
                      {!vehicleActualId && !isFinalDataComplete && (
                        <p className="mt-1 text-xs text-gray-600">
                          Menunggu timeout idle: {finalWaitRemainingSeconds}{" "}
                          detik
                        </p>
                      )}
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
