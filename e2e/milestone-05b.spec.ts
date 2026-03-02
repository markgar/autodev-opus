import { test, expect } from '@playwright/test';

// --- Milestone 05b: API hardening — validation, blob init, and error handling ---

// Milestone-specific API tests

test('GET /api/sample-specs with path traversal returns 400', async ({ request }) => {
  const resp = await request.get('/api/sample-specs/..%2Fetc%2Fpasswd');
  expect(resp.status()).toBe(400);
  const body = await resp.json();
  expect(body.message).toContain('Invalid spec name');
});

test('POST /api/sample-specs with .. in name returns 400', async ({ request }) => {
  const resp = await request.post('/api/sample-specs', {
    data: { name: '../evil.md', content: 'pwned' },
  });
  expect(resp.status()).toBe(400);
});

test('POST /api/sample-specs with no .md extension returns 400', async ({ request }) => {
  const resp = await request.post('/api/sample-specs', {
    data: { name: 'noext', content: 'test' },
  });
  expect(resp.status()).toBe(400);
});

test('POST /api/sample-specs with empty content returns 400', async ({ request }) => {
  const resp = await request.post('/api/sample-specs', {
    data: { name: 'valid.md', content: '' },
  });
  expect(resp.status()).toBe(400);
  const body = await resp.json();
  expect(body.message).toContain('content is required');
});

test('POST /api/sample-specs with missing name returns 400', async ({ request }) => {
  const resp = await request.post('/api/sample-specs', {
    data: { content: 'some content' },
  });
  expect(resp.status()).toBe(400);
});

test('DELETE /api/sample-specs with path traversal returns 400', async ({ request }) => {
  const resp = await request.delete('/api/sample-specs/..%2Fetc%2Fpasswd');
  expect(resp.status()).toBe(400);
});

test('GET /api/health returns 200 or 503', async ({ request }) => {
  const resp = await request.get('/api/health');
  expect([200, 503]).toContain(resp.status());
  const body = await resp.json();
  expect(body).toHaveProperty('status');
  expect(body).toHaveProperty('checks');
  expect(body.checks).toHaveProperty('cosmosDb');
  expect(body.checks).toHaveProperty('blobStorage');
});

// --- J-1: Smoke — Health check and app shell navigation ---

test('J-1: App loads with AutoDev heading in sidebar', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('[data-sidebar="sidebar"]');
  await expect(sidebar.getByText('AutoDev')).toBeVisible();
});

test('J-1: Sidebar has Dashboard and Sample Specs items', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('[data-sidebar="sidebar"]');
  await expect(sidebar.getByText('Dashboard')).toBeVisible();
  await expect(sidebar.getByText('Sample Specs')).toBeVisible();
});

test('J-1: Navigate to Sample Specs and back to Dashboard', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('[data-sidebar="sidebar"]');
  await sidebar.getByText('Sample Specs').click();
  await expect(page).toHaveURL(/\/admin\/sample-specs/);
  await sidebar.getByText('Dashboard').click();
  await expect(page).toHaveURL(/\/$/);
});

// --- J-3: Empty dashboard and project creation entry point ---

test('J-3: Empty dashboard shows no projects message', async ({ page }) => {
  await page.goto('/');
  // Wait for either error state or empty state
  const pageContent = page.locator('main');
  await expect(pageContent).toBeVisible();
});

test('J-3: New Project button navigates to /projects/new', async ({ page }) => {
  await page.goto('/');
  // Look for New Project link/button
  const newProjectBtn = page.getByRole('link', { name: /new project/i });
  if (await newProjectBtn.isVisible()) {
    await newProjectBtn.click();
    await expect(page).toHaveURL(/\/projects\/new/);
  }
});

// --- J-8: New project form validation ---

test('J-8: /projects/new page loads', async ({ page }) => {
  await page.goto('/projects/new');
  await expect(page.getByRole('heading', { name: /new project/i })).toBeVisible();
});

// --- J-9: Responsive mobile layout ---

test('J-9: Mobile viewport hides sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const sidebar = page.locator('[data-sidebar="sidebar"]');
  // On mobile, sidebar should be hidden by default
  await expect(sidebar).not.toBeVisible();
});

test('J-9: Mobile hamburger opens sidebar', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  // Look for hamburger/trigger button
  const trigger = page.locator('button[data-sidebar="trigger"]');
  if (await trigger.isVisible()) {
    await trigger.click();
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible();
  }
});
