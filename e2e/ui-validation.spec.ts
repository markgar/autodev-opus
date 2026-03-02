import { test, expect } from '@playwright/test';

test('SPA loads at root with HTML content', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  const response = await page.goto('/');
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);

  const contentType = response!.headers()['content-type'] || '';
  expect(contentType).toContain('text/html');
});

test('SPA renders AutoDev heading', async ({ page }) => {
  await page.goto('/');
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('AutoDev');
});

test('No JavaScript errors on page load', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('Page has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('AutoDev');
});

test('Root element exists and has content', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('#root');
  await expect(root).toBeVisible();
  const children = await root.locator('*').count();
  expect(children).toBeGreaterThan(0);
});

test('SPA serves HTML for arbitrary routes (client-side routing)', async ({ page }) => {
  const response = await page.goto('/some/random/route');
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  const contentType = response!.headers()['content-type'] || '';
  expect(contentType).toContain('text/html');
});
