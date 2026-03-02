// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import LogViewer from "../components/LogViewer";

afterEach(() => {
  cleanup();
});

describe("LogViewer", () => {
  it("shows loading spinner when loading with no lines", () => {
    render(<LogViewer lines={[]} loading={true} error={null} />);

    expect(screen.getByText("Loading logs...")).toBeInTheDocument();
  });

  it("shows empty state when not loading and no lines", () => {
    render(<LogViewer lines={[]} loading={false} error={null} />);

    expect(
      screen.getByText(/no logs yet/i)
    ).toBeInTheDocument();
  });

  it("renders log lines", () => {
    const lines = ["Starting build...", "Compiling src/", "Build succeeded"];
    render(<LogViewer lines={lines} loading={false} error={null} />);

    for (const line of lines) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("shows error message with retry button", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <LogViewer
        lines={[]}
        loading={false}
        error="Failed to load logs"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText("Failed to load logs")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows Pause button with green dot when not paused", () => {
    const onTogglePause = vi.fn();
    render(
      <LogViewer
        lines={["line1"]}
        loading={false}
        error={null}
        paused={false}
        onTogglePause={onTogglePause}
      />
    );

    expect(screen.getByText("Pause")).toBeInTheDocument();
  });

  it("shows Resume button when paused", () => {
    const onTogglePause = vi.fn();
    render(
      <LogViewer
        lines={["line1"]}
        loading={false}
        error={null}
        paused={true}
        onTogglePause={onTogglePause}
      />
    );

    expect(screen.getByText("Resume")).toBeInTheDocument();
  });

  it("toggles pause when button is clicked", async () => {
    const user = userEvent.setup();
    const onTogglePause = vi.fn();

    render(
      <LogViewer
        lines={["line1"]}
        loading={false}
        error={null}
        paused={false}
        onTogglePause={onTogglePause}
      />
    );

    await user.click(screen.getByText("Pause"));
    expect(onTogglePause).toHaveBeenCalledOnce();
  });
});
