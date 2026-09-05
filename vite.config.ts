import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/threat-feed/openphish': {
        target: 'https://openphish.com',
        changeOrigin: true,
        rewrite: () => '/feed.txt'
      }
    }
  }
})
