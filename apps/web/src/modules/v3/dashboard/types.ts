export interface V3DashboardSummary {
  title: string;
  description: string;
}

export interface V3DashboardMetric {
  label: string;
  value: number;
  tone: "danger" | "warning" | "success" | "info";
  icon: "odol" | "violation" | "normal" | "today";
}

export interface V3DashboardTrendPoint {
  [key: string]: string | number;
  date: string;
  overDimension: number;
  overLoading: number;
  normal: number;
}

export interface V3DashboardDistributionPoint {
  [key: string]: string | number;
  name: string;
  value: number;
  color: string;
}

export interface V3DashboardViolationRow {
  id: string;
  no: number;
  time: string;
  plate: string;
  location: string;
  type: string;
  article: string;
  officer: string;
  status: string;
}

export interface V3DashboardTopViolation {
  plate: string;
  value: string;
  helper: string;
}

export interface V3DashboardData {
  title: string;
  description: string;
  metrics: V3DashboardMetric[];
  trendData: V3DashboardTrendPoint[];
  distributionData: V3DashboardDistributionPoint[];
  recentViolations: V3DashboardViolationRow[];
  heaviest: V3DashboardTopViolation;
  dimension: V3DashboardTopViolation;
  topArticle: V3DashboardTopViolation;
  isLoading: boolean;
  error: string | null;
}
