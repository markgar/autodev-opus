import { test, expect } from '@playwright/test';

test('GET /api/health returns structured health response', async ({ request }) => {
  const res = await request.get('/api/health');
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty('status');
  expect(body).toHaveProperty('checks');
  expect(['ok', 'degraded']).toContain(body.status);
});

test('GET /api/nonexistent returns 404 JSON', async ({ request }) => {
  const res = await request.get('/api/nonexistent');
  expect(res.status()).toBe(404);
  const body = await res.json();
  expect(body).toEqual({ message: 'Not found' });
});

test('GET /api/foo/bar returns 404 JSON', async ({ request }) => {
  const res = await request.get('/api/foo/bar');
  expect(res.status()).toBe(404);
  const body = await res.json();
  expect(body).toEqual({ message: 'Not found' });
});

test('SPA root page loads without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await expect(page).toHaveTitle('AutoDev');
  expect(errors).toHaveLength(0);
});

test('SPA serves index.html for unknown client routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/some/unknown/route');
  await expect(page).toHaveTitle('AutoDev');
  expect(errors).toHaveLength(0);
});
