import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the React app runs on port 5173 and the API on port 4000.
    // This proxy forwards every request that starts with /api to the API, so
    // frontend code can simply call fetch('/api/...') and the login cookie
    // works as if both were one website.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
