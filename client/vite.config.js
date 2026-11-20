import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Send any request starting with /api to the Express server,
    // so the frontend can call fetch('/api/...') with no CORS setup.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
