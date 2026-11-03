import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { resumeFileName } from './src/data/resume.data.ts';

const srcPath = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

/**
 * Vercel serves the app at the domain root (`/`).
 * GitHub Pages project sites need `/Portfolio/`.
 *
 * Priority:
 * 1. `VITE_BASE_PATH` (explicit override)
 * 2. `VERCEL=1` (set automatically by Vercel builds) → `/`
 * 3. Default → `/Portfolio/` for GitHub Pages
 */
function resolveBase(): string {
  const fromEnv = process.env.VITE_BASE_PATH?.trim();

  if (fromEnv) {
    const withLeading = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`;
    return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  }

  if (process.env.VERCEL === '1') {
    return '/';
  }

  return '/Portfolio/';
}

function githubPages404(): Plugin {
  return {
    name: 'github-pages-404',
    closeBundle() {
      const indexFile = srcPath('./dist/index.html');
      const notFoundFile = srcPath('./dist/404.html');

      if (existsSync(indexFile)) {
        copyFileSync(indexFile, notFoundFile);
      }
    },
  };
}

const hasResumePdf = existsSync(srcPath(`./public/${resumeFileName}`));
const base = resolveBase();

export default defineConfig({
  base,
  define: {
    __HAS_RESUME_PDF__: JSON.stringify(hasResumePdf),
  },
  plugins: [react(), githubPages404()],
  resolve: {
    alias: {
      '@app': srcPath('./src/app'),
      '@models': srcPath('./src/models'),
      '@views': srcPath('./src/views'),
      '@viewmodels': srcPath('./src/viewmodels'),
      '@repositories': srcPath('./src/repositories'),
      '@data': srcPath('./src/data'),
      '@styles': srcPath('./src/styles'),
      '@assets': srcPath('./src/assets'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [srcPath('./src/styles')],
      },
    },
  },
});
