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

describe("ViewSpecDialog", () => {
  it("fetches and displays spec content when opened", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("# Hello World", {
        status: 200,
        headers: { "Content-Type": "text/markdown" },
      })
    );

    render(
      <ViewSpecDialog specName="test.md" open={true} onOpenChange={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText("# Hello World")).toBeInTheDocument();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/sample-specs/test.md",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("shows spec name as dialog title", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("content", { status: 200 })
    );

    render(
      <ViewSpecDialog
        specName="my-spec.md"
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText("my-spec.md")).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 })
    );

    render(
      <ViewSpecDialog
        specName="missing.md"
        open={true}
        onOpenChange={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load spec")).toBeInTheDocument();
    });
  });

  it("disables download button while loading", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {})); // never resolves

    render(
      <ViewSpecDialog specName="test.md" open={true} onOpenChange={() => {}} />
    );

    const downloadBtn = screen.getByRole("button", { name: /download/i });
    expect(downloadBtn).toBeDisabled();
  });

  it("does not fetch when dialog is closed", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(
      <ViewSpecDialog
        specName="test.md"
        open={false}
        onOpenChange={() => {}}
      />
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls onOpenChange with false when Close button is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("content", { status: 200 })
    );
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ViewSpecDialog
        specName="test.md"
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("content")).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    const explicitClose = closeButtons.find(
      (btn) => btn.textContent?.trim() === "Close"
    )!;
    await user.click(explicitClose);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
