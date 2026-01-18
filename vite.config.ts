import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use root as base so routing works correctly on Vercel
  base: '/',
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/api': {
        target: 'https://limes-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
