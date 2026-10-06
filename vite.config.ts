import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3070",
        changeOrigin: true,
      },
      "/paginas": {
        target: "http://localhost:3070",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
