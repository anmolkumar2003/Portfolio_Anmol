export const DEVICE_CATEGORIES = [
  'desktop',
  'mobile',
  'tablet',
  'unknown',
] as const;

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];

export interface ClientTelemetryPayload {
  sessionKey: string;
  visitorKey: string;
  browserName?: string;
  browserEngine?: string;
  deviceCategory?: DeviceCategory;
  osName?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  userAgent?: string;
}

export interface TelemetryHeartbeatPayload {
  sessionKey: string;
}

export interface TelemetryEndPayload {
  sessionKey: string;
}

export interface TelemetryWatchPayload {
  watcherKey: string;
}

export interface VisitorSessionRecord {
  id: string;
  session_key: string;
  visitor_id: string;
  is_active: boolean;
  started_at: string;
  last_active_at: string;
  ended_at: string | null;
  browser_name: string | null;
  browser_engine: string | null;
  device_category: DeviceCategory | null;
  os_name: string | null;
  screen_width: number | null;
  screen_height: number | null;
  timezone: string | null;
  ip_address: string | null;
  geo_country: string | null;
  geo_region: string | null;
  geo_city: string | null;
  geo_postal_code: string | null;
  isp_name: string | null;
  network_org: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface TelemetryStats {
  trackingStartedAt: string | null;
  totalVisits: number;
  approximateUniqueVisitors: number;
  activeSessions: number;
  activeWatchers: number;
}

export interface TelemetryClientEnvironment {
  browserName: string;
  browserEngine: string;
  deviceCategory: DeviceCategory;
  osName: string;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  userAgent: string;
}
