import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  test: {
    root: "src/client",
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
  },
});
