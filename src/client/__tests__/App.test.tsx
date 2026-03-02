// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App.js";

describe("App component", () => {
  it("renders the AutoDev heading", () => {
    render(<App />);
    expect(screen.getByText("AutoDev")).toBeDefined();
  });
});
