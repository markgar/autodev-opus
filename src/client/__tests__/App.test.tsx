// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App component", () => {
  it("renders the AutoDev heading", () => {
    render(<App />);
    expect(screen.getByText("AutoDev")).toBeInTheDocument();
  });
});
