import type { VisitorSystemTelemetry } from '@models';

const IPIFY_URL = 'https://api.ipify.org?format=json';
const IP_TIMEOUT_MS = 3500;

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

async function fetchPublicIp(): Promise<{ ip: string | null; failed: boolean }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => {
    controller.abort();
  }, IP_TIMEOUT_MS);

  try {
    const response = await fetch(IPIFY_URL, {
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      return { ip: null, failed: true };
    }

    const payload = (await response.json()) as { ip?: unknown };
    const ip = typeof payload.ip === 'string' ? payload.ip.trim() : '';
    return ip ? { ip, failed: false } : { ip: null, failed: true };
  } catch {
    // Ad-blockers / offline / CORS / timeout
    return { ip: null, failed: true };
  } finally {
    window.clearTimeout(timer);
  }
}

/** Collects public IP + browser/OS/screen/language with graceful IP fallback. */
export async function collectVisitorSystemTelemetry(): Promise<VisitorSystemTelemetry> {
  const [{ ip, failed }, browserName, operatingSystem] = await Promise.all([
    fetchPublicIp(),
    Promise.resolve(detectBrowserName()),
    Promise.resolve(detectOperatingSystem()),
  ]);

  return {
    publicIp: ip,
    browserName,
    operatingSystem,
    screenResolution: `${window.screen.width}×${window.screen.height}`,
    language: navigator.language || 'unknown',
    ipLookupFailed: failed,
  };
}
