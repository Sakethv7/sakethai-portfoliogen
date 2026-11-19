import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { routeFiles } from "./scripts/routeFilesPlugin";
import { readingTimesModule } from "./scripts/readingTimesPlugin";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: process.env.NODE_ENV === 'production' ? '/sakethai-portfoliogen/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), readingTimesModule(), routeFiles()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));  //
