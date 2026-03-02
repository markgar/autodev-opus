import { describe, it, expect } from "vitest";
import healthRouter from "../routes/health.js";

describe("health route", () => {
  it("exports a Router instance", () => {
    expect(healthRouter).toBeDefined();
    expect(typeof healthRouter).toBe("function");
  });

  it("has a GET /health route registered", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stack = (healthRouter as any).stack as Array<{
      route?: { path: string; methods: Record<string, boolean> };
    }>;
    const healthLayer = stack.find(
      (layer) => layer.route?.path === "/health"
    );
    expect(healthLayer).toBeDefined();
    expect(healthLayer!.route!.methods["get"]).toBe(true);
  });
});
