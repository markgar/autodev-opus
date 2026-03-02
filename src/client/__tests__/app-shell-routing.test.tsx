// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "../components/AppSidebar";
import AppLayout from "../components/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import NewProjectPage from "../pages/NewProjectPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import SampleSpecsPage from "../pages/SampleSpecsPage";

// Force desktop width so the shadcn sidebar renders the desktop variant only
// (jsdom defaults innerWidth to 0 which triggers mobile Sheet with portal duplicates)
Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });

afterEach(() => {
  cleanup();
});

function renderWithRouter(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="admin/sample-specs" element={<SampleSpecsPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("App routing", () => {
  it("renders DashboardPage at root path", () => {
    renderWithRouter("/");
    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument();
  });

  it("renders NewProjectPage at /projects/new", () => {
    renderWithRouter("/projects/new");
    expect(
      screen.getByRole("heading", { name: "New Project" })
    ).toBeInTheDocument();
  });

  it("renders ProjectDetailPage at /projects/:id with param displayed", () => {
    renderWithRouter("/projects/abc-123");
    expect(
      screen.getByRole("heading", { name: "Project Detail" })
    ).toBeInTheDocument();
    expect(screen.getByText("abc-123")).toBeInTheDocument();
  });

  it("renders SampleSpecsPage at /admin/sample-specs", () => {
    renderWithRouter("/admin/sample-specs");
    expect(
      screen.getByRole("heading", { name: "Sample Specs" })
    ).toBeInTheDocument();
  });
});

describe("AppSidebar navigation", () => {
  function renderSidebar(path = "/") {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </MemoryRouter>
    );
  }

  it("displays AutoDev heading in sidebar", () => {
    renderSidebar();
    expect(screen.getByText("AutoDev")).toBeInTheDocument();
  });

  it("shows Projects and Admin group labels", () => {
    renderSidebar();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows Dashboard and Sample Specs nav links", () => {
    renderSidebar();
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Sample Specs/i })
    ).toBeInTheDocument();
  });

  it("Dashboard link points to root path", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: /Dashboard/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("Sample Specs link points to /admin/sample-specs", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: /Sample Specs/i });
    expect(link).toHaveAttribute("href", "/admin/sample-specs");
  });

  it("marks Dashboard as active when at root path", () => {
    renderSidebar("/");
    const dashLink = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashLink).toHaveAttribute("data-active", "true");
  });

  it("marks Sample Specs as active when at /admin/sample-specs", () => {
    renderSidebar("/admin/sample-specs");
    const specsLink = screen.getByRole("link", { name: /Sample Specs/i });
    expect(specsLink).toHaveAttribute("data-active", "true");
  });

  it("does not mark Dashboard as active when at another route", () => {
    renderSidebar("/admin/sample-specs");
    const dashLink = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashLink).not.toHaveAttribute("data-active", "true");
  });
});

describe("AppLayout structure", () => {
  it("renders sidebar trigger button", () => {
    renderWithRouter("/");
    expect(
      screen.getByRole("button", { name: /toggle sidebar/i })
    ).toBeInTheDocument();
  });

  it("renders sidebar alongside page content", () => {
    renderWithRouter("/");
    expect(screen.getByText("AutoDev")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument();
  });
});

describe("Navigation integration", () => {
  it("navigates from Dashboard to Sample Specs via sidebar link", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument();

    const specsLink = screen.getByRole("link", { name: /Sample Specs/i });
    await user.click(specsLink);

    expect(
      screen.getByRole("heading", { name: "Sample Specs" })
    ).toBeInTheDocument();
  });

  it("navigates from Sample Specs back to Dashboard via sidebar link", async () => {
    const user = userEvent.setup();
    renderWithRouter("/admin/sample-specs");

    expect(
      screen.getByRole("heading", { name: "Sample Specs" })
    ).toBeInTheDocument();

    const dashLink = screen.getByRole("link", { name: /Dashboard/i });
    await user.click(dashLink);

    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument();
  });

  it("preserves sidebar content when navigating between routes", async () => {
    const user = userEvent.setup();
    renderWithRouter("/");

    expect(screen.getByText("AutoDev")).toBeInTheDocument();

    const specsLink = screen.getByRole("link", { name: /Sample Specs/i });
    await user.click(specsLink);

    expect(screen.getByText("AutoDev")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toBeInTheDocument();
  });
});
