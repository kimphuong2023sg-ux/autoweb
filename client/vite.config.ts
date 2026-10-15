import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file từ thư mục client (cùng cấp vite.config.ts)
  const env = loadEnv(mode, process.cwd(), '');

  const clientPort = parseInt(env.VITE_CLIENT_PORT || '8080', 10);
  const serverUrl = env.VITE_SERVER_URL || 'http://localhost:8081';

  return {
    plugins: [react()],
    server: {
      port: clientPort,
      proxy: {
        '/api': {
          target: serverUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
