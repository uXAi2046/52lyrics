import { expect, test } from '@playwright/test';

test('applies the complete layout stylesheet without a JavaScript handoff', async ({ page }) => {
  await page.route('**/', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy': "script-src 'none'",
      },
    });
  });

  await page.goto('/');

  await expect(page.locator('.home-portrait-grid')).toHaveCSS('display', 'grid');
  await expect(page.locator('.artist-home-hero')).toHaveCSS('display', 'grid');
  await expect(page.locator('.home-spotlight__portrait')).toHaveCSS('display', 'block');
});
