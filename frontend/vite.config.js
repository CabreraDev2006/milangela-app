import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],

  // 🔥 Evita que Vite rompa sql.js
  optimizeDeps: {
    exclude: ["sql.js"]
  },

  // 🔥 Evita que Vite intente procesar módulos de Node
  build: {
    rollupOptions: {
      external: ["fs", "crypto"]
    }
  }
});
