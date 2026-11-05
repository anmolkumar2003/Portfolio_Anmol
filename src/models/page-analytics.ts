export type AnalyticsMetric = 'views' | 'downloads';

export interface PageAnalyticsTotals {
  readonly totalViews: number;
  readonly totalDownloads: number;
}

export interface VisitorSystemTelemetry {
  readonly publicIp: string | null;
  readonly browserName: string;
  readonly operatingSystem: string;
  readonly screenResolution: string;
  readonly language: string;
  readonly ipLookupFailed: boolean;
}

export interface LiveMetricsState {
  readonly totals: PageAnalyticsTotals;
  readonly onlineCount: number;
  readonly visitor: VisitorSystemTelemetry;
  readonly loading: boolean;
  readonly error: string | null;
  readonly supabaseReady: boolean;
}
