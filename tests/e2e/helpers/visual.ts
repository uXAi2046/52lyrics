import { expect, type Page } from '@playwright/test';

export async function waitForVisualPage(page: Page) {
  await page.locator('html[data-app-ready="true"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Full-page capture does not scroll offscreen lazy images into view by itself.
  await page.locator('img').evaluateAll((images) => images.forEach((image) => { image.loading = 'eager'; }));
  await expect.poll(() => page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
  // Loaded offscreen photos may still be awaiting asynchronous decoding when a full-page capture starts.
  await page.locator('img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
}
