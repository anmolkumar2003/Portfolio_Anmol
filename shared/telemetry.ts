/** Shared telemetry contracts for API validation (keep in sync with src/models/telemetry.ts). */

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
