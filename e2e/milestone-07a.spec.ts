import { test, expect } from "@playwright/test";

test.describe("Milestone 07a — Sample Specs Service and CRUD API", () => {
  test("J-1: Health check returns response", async ({ request }) => {
    const response = await request.get("/api/health");
    // Without Azure, expect 503 degraded; with Azure, 200
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
  });

  test("J-1: SPA loads at / with 200", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("J-1: Sidebar shows AutoDev heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=AutoDev").first()).toBeVisible();
  });

  test("J-1: Sidebar has Projects section with Dashboard", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("text=Projects").first()).toBeVisible();
    await expect(page.locator("text=Dashboard").first()).toBeVisible();
  });

  test("J-1: Sidebar has Admin section with Sample Specs", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("text=Admin").first()).toBeVisible();
    await expect(page.locator("text=Sample Specs").first()).toBeVisible();
  });

  test("J-1: Click Dashboard shows active highlight and navigates to /", async ({
    page,
  }) => {
    await page.goto("/admin/sample-specs");
    const dashboardLink = page.locator("a", { hasText: "Dashboard" });
    await dashboardLink.click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1", { hasText: "Projects" })).toBeVisible();
  });

  test("J-1: Click Sample Specs navigates to /admin/sample-specs", async ({
    page,
  }) => {
    await page.goto("/");
    const specsLink = page.locator("a", { hasText: "Sample Specs" });
    await specsLink.click();
    await expect(page).toHaveURL("/admin/sample-specs");
    await expect(
      page.locator("h1", { hasText: "Sample Specs" })
    ).toBeVisible();
  });

  test("J-1: Click Dashboard again returns to /", async ({ page }) => {
    await page.goto("/admin/sample-specs");
    await page.locator("a", { hasText: "Dashboard" }).click();
    await expect(page).toHaveURL("/");
  });

  test("no JavaScript errors on any page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.goto("/admin/sample-specs");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("API: GET /api/sample-specs route exists", async ({ request }) => {
    const response = await request.get("/api/sample-specs");
    // Route should be registered (not 404). 200 with Azure, 500 without.
    expect(response.status()).not.toBe(404);
  });

  test("API: POST /api/sample-specs validates name ending", async ({
    request,
  }) => {
    const response = await request.post("/api/sample-specs", {
      data: { name: "test.txt", content: "hello" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain(".md");
  });

  test("API: POST /api/sample-specs validates content required", async ({
    request,
  }) => {
    const response = await request.post("/api/sample-specs", {
      data: { name: "test.md", content: "" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain("content");
  });

  test("API: DELETE /api/sample-specs/:name route exists", async ({
    request,
  }) => {
    const response = await request.delete("/api/sample-specs/nonexistent.md");
    // Should not be 404 from API catch-all — should be 500 (no Azure) or 204/404 from handler
    expect(response.status()).not.toBe(404);
  });

  test("API: Unknown API route returns 404", async ({ request }) => {
    const response = await request.get("/api/nonexistent");
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toBe("Not found");
  });
});
