import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The proxy is only active in development (vite dev / vite serve).
// In production the SPA talks directly to VITE_API_URL set in the host env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'build',
    },
  };
});
