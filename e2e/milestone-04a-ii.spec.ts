import { test, expect } from '@playwright/test';

test.describe('Milestone 04a-ii — Projects service and API routes', () => {
  test('GET /api/projects route exists and returns JSON', async ({ request }) => {
    const res = await request.get('/api/projects');
    // Without Cosmos DB, expect 500; with Cosmos, expect 200 with []
    expect([200, 500]).toContain(res.status());
    const body = await res.json();
    if (res.status() === 200) {
      expect(Array.isArray(body)).toBe(true);
    } else {
      expect(body).toHaveProperty('message');
    }
  });

  test('GET /api/projects/nonexistent-id route exists and returns JSON', async ({ request }) => {
    const res = await request.get('/api/projects/nonexistent-id');
    // Without Cosmos DB, expect 500; with Cosmos, expect 404
    expect([404, 500]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });

  test('GET /api/projects returns JSON error envelope on failure', async ({ request }) => {
    const res = await request.get('/api/projects');
    const body = await res.json();
    expect(body).toBeDefined();
    // Response is either an array (200) or has a message property (500)
    if (res.status() !== 200) {
      expect(body.message).toBe('Internal server error');
    }
  });

  test('GET /api/projects/:id returns JSON error envelope on failure', async ({ request }) => {
    const res = await request.get('/api/projects/test-id-123');
    const body = await res.json();
    expect(body).toBeDefined();
    if (res.status() === 404) {
      expect(body.message).toBe('Project not found');
    } else if (res.status() === 500) {
      expect(body.message).toBe('Internal server error');
    }
  });

  test('unknown API path still returns 404', async ({ request }) => {
    const res = await request.get('/api/nonexistent-route');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toBe('Not found');
  });

  test('health endpoint still works after projects route registration', async ({ request }) => {
    const res = await request.get('/api/health');
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('checks');
  });

  test('Dashboard page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('Dashboard page shows "Projects" heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { name: 'Projects' });
    await expect(heading).toBeVisible();
  });

  test('New Project page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('New Project page shows heading', async ({ page }) => {
    await page.goto('/projects/new');
    const heading = page.getByRole('heading', { name: 'New Project' });
    await expect(heading).toBeVisible();
  });

  test('Project Detail page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/projects/test-123');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('Project Detail page shows heading and ID', async ({ page }) => {
    await page.goto('/projects/test-123');
    const heading = page.getByRole('heading', { name: 'Project Detail' });
    await expect(heading).toBeVisible();
    await expect(page.getByText('test-123')).toBeVisible();
  });

  test('sidebar navigation works between Dashboard and Sample Specs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Sample Specs
    const sampleSpecsLink = page.getByRole('link', { name: /sample specs/i });
    await expect(sampleSpecsLink).toBeVisible();
    await sampleSpecsLink.click();
    await expect(page).toHaveURL('/admin/sample-specs');

    // Click Dashboard
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await dashboardLink.click();
    await expect(page).toHaveURL('/');
  });
});
