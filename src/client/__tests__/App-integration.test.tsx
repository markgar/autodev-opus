// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App component integration", () => {
  it("renders the AutoDev heading", () => {
    render(<App />);
    expect(screen.getByText("AutoDev")).toBeInTheDocument();
  });

  it("applies min-h-svh layout class for full viewport height", () => {
    const { container } = render(<App />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("min-h-svh");
  });

  it("includes Sonner Toaster component in the render tree", () => {
    render(<App />);
    const toasters = screen.getAllByRole("region", { name: /Notifications/ });
    expect(toasters.length).toBeGreaterThan(0);
  });
});
