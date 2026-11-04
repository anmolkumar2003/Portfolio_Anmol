/// <reference types="vite/client" />

declare const __HAS_RESUME_PDF__: boolean;

interface ImportMetaEnv {
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_SRC?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_TELEMETRY_ENABLED?: string;
  readonly VITE_TELEMETRY_HEARTBEAT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
