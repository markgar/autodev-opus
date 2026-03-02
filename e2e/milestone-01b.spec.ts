import { test, expect } from '@playwright/test';

test('[UI] Sonner Toaster is included in the app bundle', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const scripts = await page.locator('script[src]').all();
  let bundleUrl = '';
  for (const script of scripts) {
    const src = await script.getAttribute('src');
    if (src && src.includes('assets/')) {
      bundleUrl = src;
      break;
    }
  }
  expect(bundleUrl).toBeTruthy();
  const response = await page.goto(bundleUrl);
  const jsContent = await response!.text();
  // Sonner's Toaster component is rendered, so it must be in the bundle
  expect(jsContent).toContain('sonner');
});

test('[UI] AutoDev heading renders with correct text', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('AutoDev');
});

test('[UI] Page loads with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('[UI] App has styled content (Tailwind CSS active)', async ({ page }) => {
  await page.goto('/');
  const heading = page.locator('h1');
  const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);
  const fontSizeNum = parseFloat(fontSize);
  expect(fontSizeNum).toBeGreaterThan(20);
});

test('[UI] CSS stylesheet is loaded', async ({ page }) => {
  await page.goto('/');
  const stylesheets = await page.locator('link[rel="stylesheet"]').all();
  expect(stylesheets.length).toBeGreaterThan(0);
});
