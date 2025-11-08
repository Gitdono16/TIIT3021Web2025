import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ghPages } from "vite-plugin-gh-pages";

export default defineConfig({
  plugins: [react(), ghPages()],
  build: {
    outDir: "dist",
  },
  base: "/TIIT3021Web2025/"   // ✅ IMPORTANT
});
