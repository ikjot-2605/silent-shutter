import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/silent-shutter/",
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});
