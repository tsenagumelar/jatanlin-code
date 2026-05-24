/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

type StepStatus = "waiting" | "active" | "completed";

type Step = {
  id: number;
  title: string;
  status: StepStatus;
};

type ViolationResult =
  | "Normal"
  | "Over Loading"
  | "Over Dimension"
  | "Over Dimension & Over Loading";

type SessionStatus = "IDLE" | "IN_PROGRESS" | "COMPLETED";

interface ProcessingContextType {
  // Step management
  steps: Step[];
  currentStepId: number;
  countdown: number;
  sessionStartTime: string | null;
  sessionId: string | null;
  sessionStatus: SessionStatus;
  isProcessing: boolean;
  vehicleActualId: string | null;
  phase: "init" | "processing";

  // Data
  anprData: any | null;
  weightData: any | null;
  axleData: any | null;
  dimensionData: any | null;
  cctvData: any | null;
  vehicleClassData: any | null;
  violationResult: ViolationResult | null;

  // Actions
  setSteps: (steps: Step[]) => void;
  setCurrentStepId: (id: number) => void;
  setCountdown: (count: number) => void;
  setSessionStartTime: (time: string | null) => void;
  setSessionId: (id: string | null) => void;
  setSessionStatus: (status: SessionStatus) => void;
  setIsProcessing: (processing: boolean) => void;
  setVehicleActualId: (id: string | null) => void;
  setPhase: (phase: "init" | "processing") => void;
  setAnprData: (data: any | null) => void;
  setWeightData: (data: any | null) => void;
  setAxleData: (data: any | null) => void;
  setDimensionData: (data: any | null) => void;
  setCctvData: (data: any | null) => void;
  setVehicleClassData: (data: any | null) => void;
  setViolationResult: (result: ViolationResult | null) => void;

  // Utility
  resetProcessing: () => void;
  restartProcessingSteps: () => void;
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(
  undefined,
);

const initialSteps: Step[] = [
  { id: 1, title: "Menunggu Kendaraan", status: "active" },
  { id: 2, title: "Deteksi Plat Nomor", status: "waiting" },
  { id: 3, title: "Penimbangan", status: "waiting" },
  { id: 4, title: "Deteksi Sumbu", status: "waiting" },
  { id: 5, title: "Ukur Dimensi", status: "waiting" },
  { id: 6, title: "Analisis Hasil", status: "waiting" },
];
const INITIAL_COUNTDOWN_SECONDS = 10;

export const ProcessingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Step management
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN_SECONDS);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("IDLE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [vehicleActualId, setVehicleActualId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"init" | "processing">("init");

  // Data
  const [anprData, setAnprData] = useState<any | null>(null);
  const [weightData, setWeightData] = useState<any | null>(null);
  const [axleData, setAxleData] = useState<any | null>(null);
  const [dimensionData, setDimensionData] = useState<any | null>(null);
  const [cctvData, setCctvData] = useState<any | null>(null);
  const [vehicleClassData, setVehicleClassData] = useState<any | null>(null);
  const [violationResult, setViolationResult] =
    useState<ViolationResult | null>(null);

  // BroadcastChannel for cross-tab communication
  useEffect(() => {
    if (typeof window === "undefined") return;

    const channel = new BroadcastChannel("processing-sync");

    // Listen for updates from other tabs
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      console.log("📡 Received broadcast:", type, payload);

      switch (type) {
        case "UPDATE_STEPS":
          setSteps(payload);
          break;
        case "UPDATE_CURRENT_STEP":
          setCurrentStepId(payload);
          break;
        case "UPDATE_COUNTDOWN":
          setCountdown(payload);
          break;
        case "UPDATE_SESSION_START_TIME":
          setSessionStartTime(payload);
          break;
        case "UPDATE_SESSION_ID":
          setSessionId(payload);
          break;
        case "UPDATE_SESSION_STATUS":
          setSessionStatus(payload);
          break;
        case "UPDATE_IS_PROCESSING":
          setIsProcessing(payload);
          break;
        case "UPDATE_VEHICLE_ACTUAL_ID":
          setVehicleActualId(payload);
          break;
        case "UPDATE_PHASE":
          setPhase(payload);
          break;
        case "UPDATE_ANPR_DATA":
          setAnprData(payload);
          break;
        case "UPDATE_WEIGHT_DATA":
          setWeightData(payload);
          break;
        case "UPDATE_AXLE_DATA":
          setAxleData(payload);
          break;
        case "UPDATE_DIMENSION_DATA":
          setDimensionData(payload);
          break;
        case "UPDATE_CCTV_DATA":
          setCctvData(payload);
          break;
        case "UPDATE_VEHICLE_CLASS_DATA":
          setVehicleClassData(payload);
          break;
        case "UPDATE_VIOLATION_RESULT":
          setViolationResult(payload);
          break;
        case "RESET_PROCESSING":
          setSteps(initialSteps);
          setCurrentStepId(1);
          setCountdown(INITIAL_COUNTDOWN_SECONDS);
          setSessionStartTime(null);
          setSessionId(null);
          setSessionStatus("IDLE");
          setIsProcessing(false);
          setVehicleActualId(null);
          setPhase("init");
          setAnprData(null);
          setWeightData(null);
          setAxleData(null);
          setDimensionData(null);
          setCctvData(null);
          setVehicleClassData(null);
          setViolationResult(null);
          break;
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Broadcast helper
  const broadcast = useCallback((type: string, payload: any) => {
    if (typeof window !== "undefined") {
      const channel = new BroadcastChannel("processing-sync");
      channel.postMessage({ type, payload });
      console.log("📢 Broadcasting:", type, payload);
      channel.close();
    }
  }, []);

  // Wrapper functions that broadcast changes
  const broadcastSetSteps = useCallback(
    (newSteps: Step[]) => {
      setSteps(newSteps);
      broadcast("UPDATE_STEPS", newSteps);
    },
    [broadcast],
  );

  const broadcastSetCurrentStepId = useCallback(
    (id: number) => {
      setCurrentStepId(id);
      broadcast("UPDATE_CURRENT_STEP", id);
    },
    [broadcast],
  );

  const broadcastSetCountdown = useCallback(
    (count: number) => {
      setCountdown(count);
      broadcast("UPDATE_COUNTDOWN", count);
    },
    [broadcast],
  );

  const broadcastSetSessionStartTime = useCallback(
    (time: string | null) => {
      setSessionStartTime(time);
      broadcast("UPDATE_SESSION_START_TIME", time);
    },
    [broadcast],
  );

  const broadcastSetSessionId = useCallback(
    (id: string | null) => {
      setSessionId(id);
      broadcast("UPDATE_SESSION_ID", id);
    },
    [broadcast],
  );

  const broadcastSetSessionStatus = useCallback(
    (status: SessionStatus) => {
      setSessionStatus(status);
      broadcast("UPDATE_SESSION_STATUS", status);
    },
    [broadcast],
  );

  const broadcastSetIsProcessing = useCallback(
    (processing: boolean) => {
      setIsProcessing(processing);
      broadcast("UPDATE_IS_PROCESSING", processing);
    },
    [broadcast],
  );

  const broadcastSetVehicleActualId = useCallback(
    (id: string | null) => {
      setVehicleActualId(id);
      broadcast("UPDATE_VEHICLE_ACTUAL_ID", id);
    },
    [broadcast],
  );

  const broadcastSetPhase = useCallback(
    (nextPhase: "init" | "processing") => {
      setPhase(nextPhase);
      broadcast("UPDATE_PHASE", nextPhase);
    },
    [broadcast],
  );

  const broadcastSetAnprData = useCallback(
    (data: any | null) => {
      setAnprData(data);
      broadcast("UPDATE_ANPR_DATA", data);
    },
    [broadcast],
  );

  const broadcastSetWeightData = useCallback(
    (data: any | null) => {
      setWeightData(data);
      broadcast("UPDATE_WEIGHT_DATA", data);
    },
    [broadcast],
  );

  const broadcastSetAxleData = useCallback(
    (data: any | null) => {
      setAxleData(data);
      broadcast("UPDATE_AXLE_DATA", data);
    },
    [broadcast],
  );

  const broadcastSetDimensionData = useCallback(
    (data: any | null) => {
      setDimensionData(data);
      broadcast("UPDATE_DIMENSION_DATA", data);
    },
    [broadcast],
  );

  const broadcastSetCctvData = useCallback(
    (data: any | null) => {
      setCctvData(data);
      broadcast("UPDATE_CCTV_DATA", data);
    },
    [broadcast],
  );

  const broadcastSetVehicleClassData = useCallback(
    (data: any | null) => {
      setVehicleClassData(data);
      broadcast("UPDATE_VEHICLE_CLASS_DATA", data);
    },
    [broadcast],
  );

  const broadcastSetViolationResult = useCallback(
    (result: ViolationResult | null) => {
      setViolationResult(result);
      broadcast("UPDATE_VIOLATION_RESULT", result);
    },
    [broadcast],
  );

  const resetProcessing = useCallback(() => {
    setSteps(initialSteps);
    setCurrentStepId(1);
    setCountdown(INITIAL_COUNTDOWN_SECONDS);
    setSessionStartTime(null);
    setSessionId(null);
    setSessionStatus("IDLE");
    setIsProcessing(false);
    setVehicleActualId(null);
    setPhase("init");
    setAnprData(null);
    setWeightData(null);
    setAxleData(null);
    setDimensionData(null);
    setCctvData(null);
    setVehicleClassData(null);
    setViolationResult(null);
    broadcast("RESET_PROCESSING", null);
  }, [broadcast]);

  const restartProcessingSteps = useCallback(() => {
    setSteps(initialSteps);
    setCurrentStepId(1);
    setCountdown(INITIAL_COUNTDOWN_SECONDS);
    setIsProcessing(false);
    setVehicleActualId(null);
    setAnprData(null);
    setWeightData(null);
    setAxleData(null);
    setDimensionData(null);
    setCctvData(null);
    setVehicleClassData(null);
    setViolationResult(null);

    broadcast("UPDATE_STEPS", initialSteps);
    broadcast("UPDATE_CURRENT_STEP", 1);
    broadcast("UPDATE_COUNTDOWN", INITIAL_COUNTDOWN_SECONDS);
    broadcast("UPDATE_IS_PROCESSING", false);
    broadcast("UPDATE_VEHICLE_ACTUAL_ID", null);
    broadcast("UPDATE_ANPR_DATA", null);
    broadcast("UPDATE_WEIGHT_DATA", null);
    broadcast("UPDATE_AXLE_DATA", null);
    broadcast("UPDATE_DIMENSION_DATA", null);
    broadcast("UPDATE_CCTV_DATA", null);
    broadcast("UPDATE_VEHICLE_CLASS_DATA", null);
    broadcast("UPDATE_VIOLATION_RESULT", null);
  }, [broadcast]);

  const value: ProcessingContextType = {
    // State
    steps,
    currentStepId,
    countdown,
    sessionStartTime,
    sessionId,
    sessionStatus,
    isProcessing,
    vehicleActualId,
    phase,
    anprData,
    weightData,
    axleData,
    dimensionData,
    cctvData,
    vehicleClassData,
    violationResult,

    // Actions - use broadcast versions
    setSteps: broadcastSetSteps,
    setCurrentStepId: broadcastSetCurrentStepId,
    setCountdown: broadcastSetCountdown,
    setSessionStartTime: broadcastSetSessionStartTime,
    setSessionId: broadcastSetSessionId,
    setSessionStatus: broadcastSetSessionStatus,
    setIsProcessing: broadcastSetIsProcessing,
    setVehicleActualId: broadcastSetVehicleActualId,
    setPhase: broadcastSetPhase,
    setAnprData: broadcastSetAnprData,
    setWeightData: broadcastSetWeightData,
    setAxleData: broadcastSetAxleData,
    setDimensionData: broadcastSetDimensionData,
    setCctvData: broadcastSetCctvData,
    setVehicleClassData: broadcastSetVehicleClassData,
    setViolationResult: broadcastSetViolationResult,
    resetProcessing,
    restartProcessingSteps,
  };

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error("useProcessing must be used within ProcessingProvider");
  }
  return context;
};
