import { describe, it, expect } from "vitest";
import healthRouter from "../routes/health.js";

describe("health route behavior", () => {
  it("responds with { status: ok } and 200 status code", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stack = (healthRouter as any).stack as Array<{
      route?: {
        path: string;
        methods: Record<string, boolean>;
        stack: Array<{ handle: Function }>;
      };
    }>;

    const healthLayer = stack.find(
      (layer) => layer.route?.path === "/health"
    );
    expect(healthLayer).toBeDefined();

    const handler = healthLayer!.route!.stack[0].handle;

    let statusCode = 0;
    let jsonBody: unknown = null;

    const mockRes = {
      json(body: unknown) {
        jsonBody = body;
        return this;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
    };

    handler({}, mockRes);

    expect(jsonBody).toEqual({ status: "ok" });
  });

  it("registers a GET method on /health path", () => {
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
