import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// El proxy hace que API, WebSocket y videos salgan del mismo origen que la SPA
// (necesario para que el atributo `download` funcione en "Descargar MP4").
const BACKEND = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: BACKEND, ws: true, changeOrigin: true },
      '/static': { target: BACKEND, changeOrigin: true },
    },
  },
})
