import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3010,
    host: '0.0.0.0',
  },
})
