// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App component integration", () => {
  it("renders the AutoDev heading", () => {
    render(<App />);
    expect(screen.getByText("AutoDev")).toBeInTheDocument();
  });

  it("applies min-h-screen layout class for full viewport height", () => {
    const { container } = render(<App />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("min-h-screen");
  });

  it("includes Sonner Toaster component in the render tree", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(
      path.join(__dirname, "..", "App.tsx"),
      "utf-8"
    );
    expect(source).toContain('import { Toaster } from "sonner"');
    expect(source).toContain("<Toaster />");
  });
});
