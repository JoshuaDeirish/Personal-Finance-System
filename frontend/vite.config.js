import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // DEV_BACKEND_URL has no VITE_ prefix on purpose: it configures the dev
  // proxy only and must never be bundled into client code.
  const env = loadEnv(mode, import.meta.dirname, "");
  const backend = env.DEV_BACKEND_URL || "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      // Same-origin API in development, mirroring the Vercel rewrite in
      // production, so the session cookie is always first-party.
      proxy: {
        "/api": backend,
        "/admin": backend,
        "/static": backend,
      },
    },
  };
});
