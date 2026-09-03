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

export interface OdolEvaluation {
  violationType: ViolationResult;
  isViolation: boolean;
  isOverweight: boolean;
  isOverdimension: boolean;
  /** Class limit without tolerance, in ton. 0 when the vehicle class has no weight limit. */
  weightLimit: number;
  /** Class limit including TOLERANCE_WEIGHT, in ton. This is the threshold for isOverweight. */
  maxWeight: number;
  /** Excess against the pure class limit, in ton. Null when not overweight. */
  excessWeight: number | null;
  /** Excess against the pure class limit, in percent. Null when not overweight. */
  overloadPercentage: number | null;
}

/**
 * Full ODOL evaluation. isOverweight uses the limit *including* tolerance, while
 * overloadPercentage is measured against the pure class limit because that is the
 * figure used as the legal basis for the violation.
 */
export function evaluateOdol(
  actual: VehicleActual,
  limit: VehicleClassLimit,
  options?: {
    axleCount?: number;
    toleranceWeightPercent?: number;
    toleranceDimPercent?: number;
  }
): OdolEvaluation {
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

  const violationType: ViolationResult =
    isOverweight && isOverdimension
      ? "Over Dimension & Over Loading"
      : isOverweight
        ? "Over Loading"
        : isOverdimension
          ? "Over Dimension"
          : "Normal";

  const excessWeight =
    isOverweight && baseWeightLimit > 0
      ? actual.total_weight - baseWeightLimit
      : null;

  return {
    violationType,
    isViolation: violationType !== "Normal",
    isOverweight,
    isOverdimension,
    weightLimit: baseWeightLimit,
    maxWeight,
    excessWeight: excessWeight === null ? null : round2(excessWeight),
    overloadPercentage:
      excessWeight === null
        ? null
        : round2((excessWeight / baseWeightLimit) * 100),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
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
  return evaluateOdol(actual, limit, options).violationType;
}
