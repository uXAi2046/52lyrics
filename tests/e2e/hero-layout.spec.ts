import { expect, test } from '@playwright/test';

for (const path of ['/', '/lyrics/john-newton-amazing-grace', '/lyrics/tom-lehrer-dont-major-in-physics']) {
  test(`keeps the layout viewport at the requested device width on ${path}`, async ({ page }) => {
    for (const width of [360, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      await page.locator('html[data-app-ready="true"]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      // On mobile Chromium, overflow can inflate innerWidth too; it is not the device width.
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} at ${width}px`).toBeLessThanOrEqual(width);
    }
  });
}

test('keeps the artist spotlight and City Lights shortcut inside the desktop hero viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1635, height: 853 });
  await page.goto('/');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await page.locator('.artist-home[data-edition-ready="true"]').waitFor();

  for (let view = 0; view < 3; view++) {
    for (const selector of ['.home-read-now', '.home-spotlight']) {
      const bounds = await page.locator(selector).boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(829);
    }
    await page.getByRole('button', { name: /Change homepage layout/ }).click();
  }
});
