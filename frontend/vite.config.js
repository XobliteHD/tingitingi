import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: false, // Disable HMR
    proxy: {
      // Proxy API requests
      "/api": {
        target: "http://localhost:5000", // Your backend server
        changeOrigin: true, // Recommended for virtual hosted sites
        secure: false, // Set to true if your backend uses HTTPS with a valid certificate
        // rewrite: (path) => path.replace(/^\/api/, '') // Use if your backend routes don't have /api
      },
    },
  },
});
