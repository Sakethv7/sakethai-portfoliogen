import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { routeFiles } from "./scripts/routeFilesPlugin";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: process.env.NODE_ENV === 'production' ? '/sakethai-portfoliogen/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), routeFiles()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));  //
