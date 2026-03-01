import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const cacheDir = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, 'wecom-oa-vite-cache')
  : '.vite'

export default defineConfig({
  plugins: [react()],
  cacheDir,
  build: {
    emptyOutDir: false
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
