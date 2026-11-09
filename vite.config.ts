import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sirkula/',
  // Dev: transform file utama lebih dulu supaya buka pertama di localhost tidak menunggu rantai import satu per satu.
  server: { warmup: { clientFiles: ['./src/main.tsx', './src/App.tsx', './src/routes/AppRoutes.tsx', './src/pages/HomePage/HomePage.tsx', './src/components/layout/AppShell.tsx'] } },
  optimizeDeps: { include: ['react', 'react-dom/client', 'react-router-dom', 'framer-motion', 'lucide-react', 'recharts', 'leaflet', 'react-leaflet', 'qrcode.react'] },
  build: {
    rollupOptions: {
      output: {
        // Library besar dipisah agar bisa di-cache terpisah dan tidak semua ikut diunduh di halaman pertama.
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'], charts: ['recharts'], maps: ['leaflet', 'react-leaflet'] },
      },
    },
  },
})
