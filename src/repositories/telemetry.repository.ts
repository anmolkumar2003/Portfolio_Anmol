import type {
  ClientTelemetryPayload,
  TelemetryEndPayload,
  TelemetryHeartbeatPayload,
  TelemetryWatchPayload,
} from '@models';
import { collectClientEnvironment } from './telemetry.environment';
import {
  createWatcherKey,
  getOrCreateSessionKey,
  getOrCreateVisitorKey,
} from './telemetry.ids';

function telemetryEnabled(): boolean {
  const flag = import.meta.env.VITE_TELEMETRY_ENABLED?.trim().toLowerCase();
  // Opt-in so GitHub Pages / local builds stay quiet until Vercel + Supabase are configured.
  return flag === 'true' || flag === '1';
}

function apiBase(): string {
  return '';
}

async function postJson(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    keepalive: init?.keepalive,
    signal: init?.signal,
  });
}

function postBeacon(path: string, body: unknown): void {
  const payload = JSON.stringify(body);
  if (typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    const queued = navigator.sendBeacon(`${apiBase()}${path}`, blob);
    if (queued) {
      return;
    }
  }

  void fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  });
}

export interface ITelemetryRepository {
  isEnabled(): boolean;
  startSession(): Promise<string | null>;
  heartbeat(sessionKey: string): Promise<void>;
  endSession(sessionKey: string): void;
  watch(accessToken: string, watcherKey: string): Promise<void>;
  endWatch(accessToken: string, watcherKey: string): void;
  createWatcherKey(): string;
  getHeartbeatIntervalMs(): number;
}

/** Module-level lock prevents duplicate sessions under React Strict Mode. */
let startInFlight: Promise<string | null> | null = null;
let activeSessionKey: string | null = null;

export class TelemetryRepository implements ITelemetryRepository {
  public isEnabled(): boolean {
    return telemetryEnabled();
  }

  public getHeartbeatIntervalMs(): number {
    const raw = Number(import.meta.env.VITE_TELEMETRY_HEARTBEAT_MS ?? '30000');
    return Number.isFinite(raw) && raw >= 5_000 ? raw : 30_000;
  }

  public createWatcherKey(): string {
    return createWatcherKey();
  }

  public async startSession(): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    if (activeSessionKey) {
      return activeSessionKey;
    }

    if (startInFlight) {
      return startInFlight;
    }

    startInFlight = this.createSession();
    try {
      const key = await startInFlight;
      activeSessionKey = key;
      return key;
    } finally {
      startInFlight = null;
    }
  }

  private async createSession(): Promise<string | null> {
    const env = collectClientEnvironment();
    const sessionKey = getOrCreateSessionKey();
    const visitorKey = getOrCreateVisitorKey();

    const payload: ClientTelemetryPayload = {
      sessionKey,
      visitorKey,
      browserName: env.browserName,
      browserEngine: env.browserEngine,
      deviceCategory: env.deviceCategory,
      osName: env.osName,
      screenWidth: env.screenWidth,
      screenHeight: env.screenHeight,
      timezone: env.timezone,
      userAgent: env.userAgent,
    };

    try {
      const response = await postJson('/api/telemetry/session', payload);
      if (!response.ok) {
        return null;
      }
      return sessionKey;
    } catch {
      return null;
    }
  }

  public async heartbeat(sessionKey: string): Promise<void> {
    if (!this.isEnabled() || !sessionKey) {
      return;
    }

    const payload: TelemetryHeartbeatPayload = { sessionKey };

    try {
      await postJson('/api/telemetry/heartbeat', payload);
    } catch {
      // Swallow transient network errors; next heartbeat retries.
    }
  }

  public endSession(sessionKey: string): void {
    if (!this.isEnabled() || !sessionKey) {
      return;
    }

    const payload: TelemetryEndPayload = { sessionKey };
    postBeacon('/api/telemetry/end', payload);
    activeSessionKey = null;
  }

  public async watch(accessToken: string, watcherKey: string): Promise<void> {
    const payload: TelemetryWatchPayload = { watcherKey };

    try {
      await postJson('/api/telemetry/watch', payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // Ignore watcher heartbeat failures.
    }
  }

  public endWatch(accessToken: string, watcherKey: string): void {
    const payload: TelemetryWatchPayload = { watcherKey };
    const body = JSON.stringify(payload);

    void fetch('/api/telemetry/watch-end', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body,
      keepalive: true,
    });
  }
}

export const telemetryRepository = new TelemetryRepository();
