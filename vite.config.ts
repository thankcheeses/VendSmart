import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
// `VITE_BASE_PATH` lets the GitHub Pages build serve from a project subpath
// (e.g. /VendSmart/). Everything else — local dev, Capacitor native builds —
// keeps relative asset URLs so the bundle works off the filesystem too.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || './',
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
