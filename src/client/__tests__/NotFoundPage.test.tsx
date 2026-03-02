// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import NotFoundPage from "../pages/NotFoundPage";

afterEach(() => {
  cleanup();
});

describe("NotFoundPage", () => {
  it("renders Page Not Found heading and description", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByRole("heading", { name: "Page Not Found" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The page you requested does not exist.")
    ).toBeInTheDocument();
  });
});
