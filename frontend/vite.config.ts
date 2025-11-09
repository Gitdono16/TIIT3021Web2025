import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/TIIT3021Web2025/",   // ✅ IMPORTANT POUR GITHUB PAGES
  build: {
    outDir: "dist"
  }
});