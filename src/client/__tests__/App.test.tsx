// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App component", () => {
  it("renders the AutoDev heading in sidebar", () => {
    render(<App />);
    expect(screen.getByText("AutoDev")).toBeInTheDocument();
  });
});
