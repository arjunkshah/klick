import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEX_API_TARGET = process.env.DEX_API_PROXY ?? "http://localhost:8787";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: DEX_API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      "/api": { target: DEX_API_TARGET, changeOrigin: true },
    },
  },
});
