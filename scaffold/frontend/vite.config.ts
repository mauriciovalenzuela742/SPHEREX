import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // BASE_PATH permite servir desde un subdirectorio (GitHub Pages: /SPHEREX/). Por defecto, la raíz.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    port: 5173,
    // El backend del esqueleto corre en 8000. Con este proxy, el frontend
    // llama a /api/... sin preocuparse de CORS en desarrollo.
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/health": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});
