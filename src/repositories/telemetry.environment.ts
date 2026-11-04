import type { DeviceCategory, TelemetryClientEnvironment } from '@models';

function detectDeviceCategory(): DeviceCategory {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    return 'mobile';
  }
  if (navigator.maxTouchPoints > 1 && window.innerWidth >= 768) {
    return 'tablet';
  }
  return 'desktop';
}

function detectBrowser(): { name: string; engine: string } {
  const ua = navigator.userAgent;

  if (/Edg\//.test(ua)) {
    return { name: 'Edge', engine: 'Blink' };
  }
  if (/OPR\/|Opera/.test(ua)) {
    return { name: 'Opera', engine: 'Blink' };
  }
  if (/Firefox\//.test(ua)) {
    return { name: 'Firefox', engine: 'Gecko' };
  }
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    return { name: 'Chrome', engine: 'Blink' };
  }
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    return { name: 'Safari', engine: 'WebKit' };
  }
  if (/Chromium/.test(ua)) {
    return { name: 'Chromium', engine: 'Blink' };
  }

  return { name: 'Unknown', engine: 'Unknown' };
}

function detectOs(): string {
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
  if (/CrOS/i.test(ua)) {
    return 'ChromeOS';
  }

  return 'Unknown';
}

export function collectClientEnvironment(): TelemetryClientEnvironment {
  const browser = detectBrowser();

  return {
    browserName: browser.name,
    browserEngine: browser.engine,
    deviceCategory: detectDeviceCategory(),
    osName: detectOs(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    userAgent: navigator.userAgent.slice(0, 512),
  };
}
