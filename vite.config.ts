import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // 👇 disable HMR when you’re viewing through Cloudflare tunnel
    hmr: false,
  },
})
