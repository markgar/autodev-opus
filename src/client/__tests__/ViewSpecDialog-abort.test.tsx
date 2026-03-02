// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ViewSpecDialog from "../components/ViewSpecDialog";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ViewSpecDialog abort and retry behavior", () => {
  it("aborts in-flight fetch when dialog closes", async () => {
    let abortSignal: AbortSignal | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, init) => {
      abortSignal = (init as RequestInit)?.signal ?? undefined;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = render(
      <ViewSpecDialog specName="test.md" open={true} onOpenChange={() => {}} />
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    unmount();

    expect(abortSignal?.aborted).toBe(true);
  });

  it("does not show error state when fetch is aborted", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, init) => {
      const signal = (init as RequestInit)?.signal;
      return new Promise((_resolve, reject) => {
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new DOMException("The operation was aborted.", "AbortError");
            reject(err);
          });
        }
      });
    });

    const { unmount } = render(
      <ViewSpecDialog specName="test.md" open={true} onOpenChange={() => {}} />
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    unmount();

    // Re-render to check no error persists — the abort should be silenced
    render(
      <ViewSpecDialog specName="test.md" open={false} onOpenChange={() => {}} />
    );

    expect(screen.queryByText("Failed to load spec")).not.toBeInTheDocument();
  });

  it("retry after error fetches spec content again", async () => {
    const user = userEvent.setup();

    // First fetch fails
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("Not Found", { status: 404 }))
      .mockResolvedValueOnce(
        new Response("# Retried Content", { status: 200 })
      );

    render(
      <ViewSpecDialog specName="retry.md" open={true} onOpenChange={() => {}} />
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Failed to load spec")).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole("button", { name: /retry/i }));

    // Wait for retried content
    await waitFor(() => {
      expect(screen.getByText("# Retried Content")).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
