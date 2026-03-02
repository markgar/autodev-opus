import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiPort = process.env["PORT"] ?? "3000";

export default defineConfig({
  root: "src/client",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": `http://localhost:${apiPort}`,
    },
  },
});
