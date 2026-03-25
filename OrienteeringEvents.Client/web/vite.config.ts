import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@web": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared")
    }
  },
  server: {
    fs: {
      allow: [
        ".." // allow access to one level up (/shared)
      ]
    }
  }
})
