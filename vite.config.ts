import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.DEX_API_PORT || process.env.DEX_API_PORT || "8787";
  const DEX_API_TARGET =
    env.DEX_API_PROXY?.trim() ||
    process.env.DEX_API_PROXY?.trim() ||
    `http://127.0.0.1:${apiPort}`;

  return {
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
  };
});
