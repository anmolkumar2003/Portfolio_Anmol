import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const srcPath = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

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

export default defineConfig({
  base: '/Portfolio/',
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
