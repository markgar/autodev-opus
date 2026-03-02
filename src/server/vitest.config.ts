import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: "src/server",
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
