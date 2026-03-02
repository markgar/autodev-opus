import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    root: "src/client",
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/client"),
    },
  },
});
