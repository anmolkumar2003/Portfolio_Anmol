export type AnalyticsMetric = 'views' | 'downloads';

export type AnalyticsFailureCode =
  | 'supabase_not_configured'
  | 'supabase_unreachable'
  | 'analytics_table_missing'
  | 'rpc_failed'
  | 'presence_failed'
  | 'public_stats_failed'
  | 'cors_origin_rejected'
  | 'unknown';

export interface PageAnalyticsTotals {
  readonly totalViews: number;
  readonly totalDownloads: number;
}

export interface VisitorSystemTelemetry {
  readonly browserName: string;
  readonly operatingSystem: string;
  readonly screenResolution: string;
  readonly language: string;
}

export interface LiveMetricsState {
  /** Null when counters are unavailable (never fabricate 0 after a hard failure). */
  readonly totals: PageAnalyticsTotals | null;
  /** Null when active count cannot be determined. */
  readonly onlineCount: number | null;
  readonly visitor: VisitorSystemTelemetry;
  readonly loading: boolean;
  readonly error: string | null;
  readonly errorCode: AnalyticsFailureCode | null;
  readonly supabaseReady: boolean;
  readonly diagnosticsHost: string | null;
}
