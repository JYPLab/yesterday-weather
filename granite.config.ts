import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'yesterday-weather',
  brand: {
    displayName: '어제보다',
    primaryColor: '#0059b9',
    icon: 'https://placehold.co/512x512/0059b9/ffffff?text=날씨', // TODO: 실제 앱 아이콘 URL로 교체
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'npm run dev:client',
      build: 'npm run build -w client',
    },
  },
  outdir: 'client/dist',
  permissions: [],
});
