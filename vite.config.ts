import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // 배포 백엔드(mongle.cloud) CORS는 배포 origin만 허용하므로,
      // 로컬/홈서버에서 직접 호출하면 403이 난다. dev 서버가 같은 origin에서
      // 대신 프록시해 CORS 자체를 우회한다. (changeOrigin으로 Origin을 백엔드 도메인으로 위장)
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'https://mongle.cloud',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: '',
        },
        '/oauth2': {
          target: env.VITE_PROXY_TARGET || 'https://mongle.cloud',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: '',
        },
      },
    },
  };
});
