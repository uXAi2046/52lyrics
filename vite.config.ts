import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const siteUrl = process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  || 'http://localhost:5173';

const gaMeasurementId = process.env.GA_MEASUREMENT_ID || '';
const baiduTongjiId = process.env.BAIDU_TONGJI_ID || '';

export default defineConfig({
  define: {
    __SITE_URL__: JSON.stringify(siteUrl.replace(/\/$/, '')),
    __VERCEL_ANALYTICS_ENABLED__: JSON.stringify(process.env.VERCEL === '1'),
    __GA_MEASUREMENT_ID__: JSON.stringify(gaMeasurementId),
    __BAIDU_TONGJI_ID__: JSON.stringify(baiduTongjiId),
  },
  build: {
    sourcemap: false,
  },
  plugins: [reactRouter(), tsconfigPaths()],
});
