export type V3DeviceStatus = "online" | "warning" | "offline";

export interface V3DeviceConnection {
  key: "anpr" | "axle" | "cctv" | "wim";
  label: string;
  description: string;
  status: V3DeviceStatus;
  lastSeen: string;
}

export interface V3ProcessingMetric {
  label: string;
  actual: string;
  limit: string;
  status: "normal" | "over" | "pending";
}

export interface V3ProcessingPanelItem {
  label: string;
  value: string;
}
