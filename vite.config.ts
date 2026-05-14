import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Dev-only proxy so the browser doesn't fight CORS while you
        // point at a local Spring Boot instance.
        '/api/v1': {
          target: env.VITE_API_BASE_URL || 'http://localhost:9771',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      sourcemap: mode !== 'production',
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
            'query-vendor':  ['@tanstack/react-query'],
            'chart-vendor':  ['recharts'],
            'radix-vendor':  [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-toast',
            ],
          },
        },
      },
    },
  };
});
