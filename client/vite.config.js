import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client always calls a relative `/api/...` path. In dev, Vite proxies
// those calls (including the Server-Sent Events stream) to the API on :4000,
// so there's no host hardcoded anywhere in the frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
