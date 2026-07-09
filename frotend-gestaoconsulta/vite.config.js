import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 7071,
    allowedHosts: [
      'localhost',
      '.sslip.io',  // Permite todos os subdomínios .sslip.io
      'gestaoconsultasmedicas-epizxc-46b025-105-172-106-141.sslip.io'
    ]        
  }
})