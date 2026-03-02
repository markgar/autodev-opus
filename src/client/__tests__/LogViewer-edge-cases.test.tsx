// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import LogViewer from "../components/LogViewer";

afterEach(() => {
  cleanup();
});

describe("LogViewer — edge cases", () => {
  it("does not render pause/resume button when onTogglePause is not provided", () => {
    render(<LogViewer lines={["some log line"]} loading={false} error={null} />);

    expect(screen.getByText("some log line")).toBeInTheDocument();
    expect(screen.queryByText("Pause")).not.toBeInTheDocument();
    expect(screen.queryByText("Resume")).not.toBeInTheDocument();
  });

  it("shows error message without retry button when onRetry is not provided", () => {
    render(<LogViewer lines={[]} loading={false} error="Network error" />);

    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("renders lines even while loading is true (partial streaming data)", () => {
    render(
      <LogViewer
        lines={["first batch line"]}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText("first batch line")).toBeInTheDocument();
    expect(screen.queryByText("Loading logs...")).not.toBeInTheDocument();
  });
});
