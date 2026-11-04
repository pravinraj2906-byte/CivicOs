import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/citizen/',
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
