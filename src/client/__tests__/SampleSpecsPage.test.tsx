// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock DeleteSpecDialog to avoid transitive @radix-ui/react-alert-dialog dep (not installed — see bug #84)
vi.mock("../components/DeleteSpecDialog", () => ({
  default: ({ specName, open, onOpenChange, onDeleted }: any) =>
    open
      ? React.createElement(
          "div",
          { "data-testid": "delete-dialog" },
          React.createElement("span", null, `Delete ${specName}?`),
          React.createElement("button", { onClick: () => { onOpenChange(false); onDeleted(); } }, "Confirm Delete")
        )
      : null,
}));

const toastMock = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn() }));
vi.mock("sonner", () => ({ toast: toastMock }));

import SampleSpecsPage from "../pages/SampleSpecsPage";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
  toastMock.mockClear();
  toastMock.error.mockClear();
});

const sampleSpecsResponse = [
  { name: "design.md", size: 512, lastModified: "2026-01-15T10:00:00.000Z" },
  { name: "requirements.md", size: 2048, lastModified: "2026-02-20T12:00:00.000Z" },
];

describe("SampleSpecsPage", () => {
  it("shows empty state when API returns no specs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(<SampleSpecsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/no sample specs uploaded yet/i)
      ).toBeInTheDocument();
    });
  });

  it("renders spec table after successful fetch", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(sampleSpecsResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(<SampleSpecsPage />);

    await waitFor(() => {
      expect(screen.getAllByText("design.md").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("requirements.md").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows error state with retry button on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Server Error", { status: 500 })
    );

    render(<SampleSpecsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load specs")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("retry button re-fetches specs after failure", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("Server Error", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleSpecsResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    render(<SampleSpecsPage />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Failed to load specs")).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole("button", { name: /retry/i }));

    // Wait for specs to load
    await waitFor(() => {
      expect(screen.getAllByText("design.md").length).toBeGreaterThanOrEqual(1);
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("opens view dialog when View button is clicked on a spec", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleSpecsResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response("# Design Content", { status: 200 })
      );

    render(<SampleSpecsPage />);

    // Wait for specs to render
    await waitFor(() => {
      expect(screen.getAllByText("design.md").length).toBeGreaterThanOrEqual(1);
    });

    // Click view button
    const viewButtons = screen.getAllByRole("button", { name: /view design\.md/i });
    await user.click(viewButtons[0]);

    // ViewSpecDialog should open and fetch content
    await waitFor(() => {
      expect(screen.getByText("# Design Content")).toBeInTheDocument();
    });
  });
});
