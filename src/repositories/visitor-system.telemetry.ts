import type { VisitorSystemTelemetry } from '@models';

function detectBrowserName(): string {
  const ua = navigator.userAgent;

  if (/Edg\//.test(ua)) {
    return 'Edge';
  }
  if (/OPR\/|Opera/.test(ua)) {
    return 'Opera';
  }
  if (/Firefox\//.test(ua)) {
    return 'Firefox';
  }
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) {
    return 'Chrome';
  }
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    return 'Safari';
  }

  return 'Unknown';
}

function detectOperatingSystem(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform || '';

  if (/Windows/i.test(ua)) {
    return 'Windows';
  }
  if (/Android/i.test(ua)) {
    return 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'iOS';
  }
  if (/Mac/i.test(ua) || /Mac/i.test(platform)) {
    return 'macOS';
  }
  if (/Linux/i.test(ua)) {
    return 'Linux';
  }

  return 'Unknown';
}

/**
 * Client-local system labels for the public HUD.
 * Intentionally does not fetch or expose public IP addresses.
 */
export function collectVisitorSystemTelemetry(): VisitorSystemTelemetry {
  return {
    browserName: detectBrowserName(),
    operatingSystem: detectOperatingSystem(),
    screenResolution: `${window.screen.width}×${window.screen.height}`,
    language: navigator.language || 'unknown',
  };
}
