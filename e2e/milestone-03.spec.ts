import { test, expect } from "@playwright/test";

test.describe("Milestone 03 — App Shell and Routing", () => {
  test("GET / returns 200 with HTML containing AutoDev title", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/AutoDev/);
  });

  test("sidebar contains AutoDev heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("text=AutoDev").first();
    await expect(heading).toBeVisible();
  });

  test("sidebar has Projects group with Dashboard item", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Projects").first()).toBeVisible();
    await expect(page.locator("text=Dashboard").first()).toBeVisible();
  });

  test("sidebar has Admin group with Sample Specs item", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Admin").first()).toBeVisible();
    await expect(page.locator("text=Sample Specs").first()).toBeVisible();
  });

  test("root page renders Dashboard with Projects heading", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1", { hasText: "Projects" })).toBeVisible();
  });

  test("navigating to /projects/new renders New Project heading", async ({
    page,
  }) => {
    await page.goto("/projects/new");
    await expect(
      page.locator("h1", { hasText: "New Project" })
    ).toBeVisible();
  });

  test("navigating to /projects/test-123 renders Project Detail heading", async ({
    page,
  }) => {
    await page.goto("/projects/test-123");
    await expect(
      page.locator("h1", { hasText: "Project Detail" })
    ).toBeVisible();
  });

  test("project detail page displays project id", async ({ page }) => {
    await page.goto("/projects/test-123");
    await expect(page.locator("text=test-123")).toBeVisible();
  });

  test("navigating to /admin/sample-specs renders Sample Specs heading", async ({
    page,
  }) => {
    await page.goto("/admin/sample-specs");
    await expect(
      page.locator("h1", { hasText: "Sample Specs" })
    ).toBeVisible();
  });

  test("sidebar navigation works - click Dashboard navigates to /", async ({
    page,
  }) => {
    await page.goto("/admin/sample-specs");
    await page.locator("a", { hasText: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1", { hasText: "Projects" })).toBeVisible();
  });

  test("sidebar navigation works - click Sample Specs navigates to /admin/sample-specs", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("a", { hasText: "Sample Specs" }).click();
    await expect(page).toHaveURL("/admin/sample-specs");
    await expect(
      page.locator("h1", { hasText: "Sample Specs" })
    ).toBeVisible();
  });

  test("SidebarTrigger hamburger button is present", async ({ page }) => {
    await page.goto("/");
    // The SidebarTrigger button should exist in the DOM (visible on mobile)
    const trigger = page.locator("button").filter({ has: page.locator("svg") });
    const count = await trigger.count();
    expect(count).toBeGreaterThan(0);
  });

  test("no JavaScript errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("no JavaScript errors on /projects/new", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/projects/new");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("no JavaScript errors on /admin/sample-specs", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/admin/sample-specs");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
});
