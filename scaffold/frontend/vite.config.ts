import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/health": { target: "http://localhost:8000", changeOrigin: true },
      // Modo Misión: imágenes vía Vercel (formato float32 por visita).
      // El grid se resuelve en el backend local (ya arreglado para devolver bands/visits/columns).
      "/proto-api": {
        target: "https://spherex-prototipo-d2.vercel.app",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proto-api/, "/api"),
      },
    },
  },
});
