import { test, expect } from "@playwright/test";

// J-1: Smoke — Health check and app shell navigation
test("J-1: health endpoint returns response", async ({ request }) => {
  const res = await request.get("/api/health");
  // 200 healthy or 503 degraded — both are valid in Docker without Azure
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty("status");
  expect(body).toHaveProperty("checks");
});

test("J-1: app shell renders with sidebar navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-sidebar='sidebar']")).toContainText("AutoDev");
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sample Specs" })).toBeVisible();
});

test("J-1: sidebar navigation works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sample Specs" }).click();
  await expect(page).toHaveURL(/\/admin\/sample-specs/);
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL(/\/$/);
});

// Milestone 05a: New project creation — API validation
test("POST /api/projects with empty body returns 400", async ({ request }) => {
  const res = await request.post("/api/projects", { data: {} });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.message).toContain("name");
});

test("POST /api/projects with missing specName returns 400", async ({ request }) => {
  const res = await request.post("/api/projects", {
    data: { name: "Test Project" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.message).toContain("specName");
});

test("POST /api/projects with name > 100 chars returns 400", async ({ request }) => {
  const res = await request.post("/api/projects", {
    data: { name: "A".repeat(101), specName: "some-spec.md" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.message).toMatch(/100 characters/);
});

test("POST /api/projects with missing name returns 400", async ({ request }) => {
  const res = await request.post("/api/projects", {
    data: { specName: "some-spec.md" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.message).toContain("name");
});

// Milestone 05a: /projects/new page renders correctly
test("J-8: /projects/new page renders form elements", async ({ page }) => {
  await page.goto("/projects/new");
  await expect(page.getByRole("heading", { name: "New Project" })).toBeVisible();
  await expect(page.getByLabel("Project Name")).toBeVisible();
  await expect(page.getByLabel("Sample Spec")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Project" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
});

test("J-8: name input has autoFocus and correct placeholder", async ({ page }) => {
  await page.goto("/projects/new");
  const nameInput = page.getByLabel("Project Name");
  await expect(nameInput).toBeFocused();
  await expect(nameInput).toHaveAttribute("placeholder", "My awesome app");
});

test("J-8: submitting empty form shows validation errors", async ({ page }) => {
  // Mock specs API to return a spec so the submit button is enabled
  await page.route("**/api/sample-specs", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ name: "test.md", size: 100, lastModified: new Date().toISOString() }]) })
  );
  await page.goto("/projects/new");
  await page.getByRole("button", { name: "Create Project" }).click();
  // Should show name required error
  await expect(page.getByText("Project name is required")).toBeVisible();
});

test("J-8: cancel button navigates back to dashboard", async ({ page }) => {
  await page.goto("/projects/new");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("J-12: spec picker shows no specs message when none available", async ({ page }) => {
  // Without Azure, /api/sample-specs fails so specs list will be empty
  await page.goto("/projects/new");
  // Wait for specs to load
  await page.waitForTimeout(2000);
  // The select trigger should show the "no specs" placeholder
  const selectTrigger = page.locator("button[role='combobox']");
  await expect(selectTrigger).toContainText(
    "No specs available"
  );
  // Create Project button should be disabled when no specs
  await expect(page.getByRole("button", { name: "Create Project" })).toBeDisabled();
});

test("J-8: name field shows required error after type and clear", async ({ page }) => {
  // Mock specs API so submit button is enabled
  await page.route("**/api/sample-specs", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ name: "test.md", size: 100, lastModified: new Date().toISOString() }]) })
  );
  await page.goto("/projects/new");
  const nameInput = page.getByLabel("Project Name");
  await nameInput.fill("something");
  await nameInput.clear();
  // Submit to trigger validation
  await page.getByRole("button", { name: "Create Project" }).click();
  await expect(page.getByText("Project name is required")).toBeVisible();
});

// J-9: Mobile layout
test("J-9: mobile layout hides sidebar and shows hamburger", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/projects/new");
  // Sidebar should be hidden on mobile
  const sidebar = page.locator("[data-sidebar='sidebar']");
  await expect(sidebar).not.toBeVisible();
  // Hamburger/trigger button should exist
  const trigger = page.locator("button[data-sidebar='trigger']");
  await expect(trigger).toBeVisible();
});

// API: GET /api/projects returns list (may be 500 without Azure)
test("GET /api/projects endpoint exists", async ({ request }) => {
  const res = await request.get("/api/projects");
  // 200 with data or 500 without Azure
  expect([200, 500]).toContain(res.status());
});

// J-12: spec picker loads options from API and shows display names without .md
test("J-12: spec picker loads and displays spec names without .md", async ({ page }) => {
  await page.route("**/api/sample-specs", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { name: "my-app-spec.md", size: 500, lastModified: new Date().toISOString() },
        { name: "other-spec.md", size: 300, lastModified: new Date().toISOString() },
      ]),
    })
  );
  await page.goto("/projects/new");
  // Click the select trigger to open dropdown
  const selectTrigger = page.locator("button[role='combobox']");
  await selectTrigger.click();
  // Verify spec names are displayed without .md extension
  await expect(page.getByRole("option", { name: "my-app-spec" })).toBeVisible();
  await expect(page.getByRole("option", { name: "other-spec" })).toBeVisible();
});

// J-8: form submission with valid data navigates to project detail (mocked)
test("J-8: successful form submission navigates to project detail page", async ({ page }) => {
  const fakeProjectId = "fake-project-id-123";
  await page.route("**/api/sample-specs", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { name: "my-spec.md", size: 500, lastModified: new Date().toISOString() },
      ]),
    })
  );
  await page.route("**/api/projects", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: fakeProjectId,
          organizationId: "default",
          type: "project",
          name: "Test Project",
          specName: "my-spec.md",
          createdAt: new Date().toISOString(),
          latestRunStatus: null,
          runCount: 0,
        }),
      });
    }
    return route.continue();
  });
  // Also mock the project detail fetch so the detail page doesn't error
  await page.route(`**/api/projects/${fakeProjectId}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: fakeProjectId,
        name: "Test Project",
        createdAt: new Date().toISOString(),
      }),
    })
  );
  await page.route(`**/api/projects/${fakeProjectId}/logs`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ lines: [] }),
    })
  );

  await page.goto("/projects/new");
  // Fill in the form
  await page.getByLabel("Project Name").fill("Test Project");
  // Open select and pick a spec
  const selectTrigger = page.locator("button[role='combobox']");
  await selectTrigger.click();
  await page.getByRole("option", { name: "my-spec" }).click();
  // Submit
  await page.getByRole("button", { name: "Create Project" }).click();
  // Should navigate to the project detail page
  await expect(page).toHaveURL(new RegExp(`/projects/${fakeProjectId}`));
  // Should show the project name
  await expect(page.getByRole("heading", { name: "Test Project" })).toBeVisible();
});

// J-8: submitting without selecting spec shows spec validation error
test("J-8: submitting with name but no spec shows spec error", async ({ page }) => {
  await page.route("**/api/sample-specs", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { name: "test.md", size: 100, lastModified: new Date().toISOString() },
      ]),
    })
  );
  await page.goto("/projects/new");
  await page.getByLabel("Project Name").fill("Test Project");
  await page.getByRole("button", { name: "Create Project" }).click();
  await expect(page.getByText("Please select a sample spec")).toBeVisible();
});

// J-8: API error on submit shows toast error
test("J-8: API error on form submit shows toast", async ({ page }) => {
  await page.route("**/api/sample-specs", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { name: "test.md", size: 100, lastModified: new Date().toISOString() },
      ]),
    })
  );
  await page.route("**/api/projects", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      });
    }
    return route.continue();
  });

  await page.goto("/projects/new");
  await page.getByLabel("Project Name").fill("Test Project");
  const selectTrigger = page.locator("button[role='combobox']");
  await selectTrigger.click();
  await page.getByRole("option", { name: "test" }).click();
  await page.getByRole("button", { name: "Create Project" }).click();

  // Should show error toast
  await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 5000 });
});
