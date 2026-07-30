// Utility to check ODOL violation consistently
export type ViolationResult =
  | "Normal"
  | "Over Loading"
  | "Over Dimension"
  | "Over Dimension & Over Loading";

export interface VehicleClassLimit {
  class_2_weight?: string | number;
  class_3_weight?: string | number;
  length?: string | number;
  width?: string | number;
  height?: string | number;
}

export interface VehicleActual {
  total_weight: number;
  length: number;
  width: number;
  height: number;
}

export interface OdolTolerance {
  weightPercent: number;
  dimPercent: number;
}

export interface OdolConfigEntry {
  config_key?: string | null;
  config_value?: string | null;
}

export function getOdolTolerances(configs?: OdolConfigEntry[]): OdolTolerance {
  const tolerance: OdolTolerance = { weightPercent: 0, dimPercent: 0 };

  (configs || []).forEach((config) => {
    const value = parseFloat(String(config.config_value || "0")) || 0;
    if (config.config_key === "TOLERANCE_WEIGHT") {
      tolerance.weightPercent = value;
    }
    if (config.config_key === "TOLERANCE_DIM") {
      tolerance.dimPercent = value;
    }
  });

  return tolerance;
}

export function checkOdolViolation(
  actual: VehicleActual,
  limit: VehicleClassLimit,
  options?: {
    axleCount?: number;
    toleranceWeightPercent?: number;
    toleranceDimPercent?: number;
  }
): ViolationResult {
  const CLASS_3_WEIGHT = parseFloat(String(limit.class_3_weight || "0"));
  const BASE_LENGTH = parseFloat(String(limit.length || "0"));
  const BASE_WIDTH = parseFloat(String(limit.width || "0"));
  const BASE_HEIGHT = parseFloat(String(limit.height || "0"));
  const axleCount = options?.axleCount || 0;
  const weightTolerance = options?.toleranceWeightPercent || 0;
  const dimTolerance = options?.toleranceDimPercent || 0;

  const baseWeightLimit =
    CLASS_3_WEIGHT > 0
      ? axleCount >= 6
        ? axleCount * CLASS_3_WEIGHT
        : CLASS_3_WEIGHT
      : 0;
  const maxWeight =
    baseWeightLimit > 0
      ? baseWeightLimit * (1 + weightTolerance / 100)
      : 0;
  const maxLength = BASE_LENGTH > 0 ? BASE_LENGTH * (1 + dimTolerance / 100) : 0;
  const maxWidth = BASE_WIDTH > 0 ? BASE_WIDTH * (1 + dimTolerance / 100) : 0;
  const maxHeight =
    BASE_HEIGHT > 0 ? BASE_HEIGHT * (1 + dimTolerance / 100) : 0;

  const isOverweight = maxWeight > 0 && actual.total_weight > maxWeight;
  const isOverdimension =
    (maxLength > 0 && actual.length > maxLength) ||
    (maxWidth > 0 && actual.width > maxWidth) ||
    (maxHeight > 0 && actual.height > maxHeight);

  if (isOverweight && isOverdimension) return "Over Dimension & Over Loading";
  if (isOverweight) return "Over Loading";
  if (isOverdimension) return "Over Dimension";
  return "Normal";
}
