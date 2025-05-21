import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['smsit.mit'],
    hmr: {
	host: '192.168.100.33',
	port: 80
    }
  }
})
