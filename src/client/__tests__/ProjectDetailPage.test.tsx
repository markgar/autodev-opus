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
  name: "My Test Project",
  createdAt: "2026-02-01T10:00:00Z",
};

function renderPage(projectId = "proj-001") {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProjectDetailPage", () => {
  it("shows project name and creation date after successful fetch", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleProject), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ lines: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Test Project")).toBeInTheDocument();
    });
    expect(screen.getByText(/february/i)).toBeInTheDocument();
  });

  it("shows 'Project not found' for 404 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Project not found" }), {
        status: 404,
      })
    );

    renderPage("nonexistent");

    await waitFor(() => {
      expect(screen.getByText("Project not found")).toBeInTheDocument();
    });
  });

  it("shows error with retry button on server error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 })
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load project")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("has 'Back to Dashboard' link after load", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleProject), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ lines: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("My Test Project")).toBeInTheDocument();
    });
    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
  });

  it("does not show retry button for 'Project not found' error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Project not found" }), {
        status: 404,
      })
    );

    renderPage("missing");

    await waitFor(() => {
      expect(screen.getByText("Project not found")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("retry button re-fetches project after failure", async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response("Server Error", { status: 500 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(sampleProject), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ lines: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText("My Test Project")).toBeInTheDocument();
    });
  });
});
