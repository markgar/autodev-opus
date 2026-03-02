// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProjectDetailPage from "../pages/ProjectDetailPage";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

const sampleProject = {
  id: "proj-001",
  name: "Log Test Project",
  createdAt: "2026-03-01T12:00:00Z",
};

function renderPage(projectId = "proj-001") {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function mockProjectAndLogs(logLines: string[]) {
  vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      new Response(JSON.stringify(sampleProject), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ lines: logLines }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
    .mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ lines: logLines }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
}

describe("ProjectDetailPage — log integration", () => {
  it("displays log lines from the API after project loads", async () => {
    mockProjectAndLogs(["Building app...", "Compile successful"]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Building app...")).toBeInTheDocument();
    });
    expect(screen.getByText("Compile successful")).toBeInTheDocument();
  });

  it("shows log error when logs API returns 500", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleProject), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response("Server Error", { status: 500 })
      )
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ lines: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load logs")).toBeInTheDocument();
    });
  });

  it("pause button toggles to resume after click", async () => {
    const user = userEvent.setup();
    mockProjectAndLogs(["line1"]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Pause")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Pause"));

    await waitFor(() => {
      expect(screen.getByText("Resume")).toBeInTheDocument();
    });
  });

  it("log retry re-fetches and displays recovered logs", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleProject), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response("Error", { status: 500 })
      )
      .mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ lines: ["Recovered log line"] }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
      );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load logs")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText("Recovered log line")).toBeInTheDocument();
    });
  });
});
