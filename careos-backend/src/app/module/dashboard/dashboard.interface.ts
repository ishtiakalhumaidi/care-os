export type DashboardPeriod = "7d" | "30d" | "90d";

export interface IDashboardQuery {
  period?: DashboardPeriod;
}

export interface IMetric {
  label: string;
  value: number | string;
  subtext?: string;
}

export interface IAlert {
  message: string;
  type: "info" | "warning" | "critical";
}

export interface IDashboardResponse {
  role: string;
  period: string;
  metrics: IMetric[];
  alerts: IAlert[];
  recents: Record<string, any>[];
  details: Record<string, any>;
}