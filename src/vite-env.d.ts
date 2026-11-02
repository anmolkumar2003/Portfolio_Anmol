/// <reference types="vite/client" />

declare const __HAS_RESUME_PDF__: boolean;

interface ImportMetaEnv {
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
