import { expect, test } from '@playwright/test';

test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

test('adapts the homepage edition and lets visitors cycle layouts without losing content', async ({ page }, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-10-30T22:00:00-04:00'));
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const home = page.locator('.artist-home[data-edition-ready="true"]');
  await home.waitFor();
  await expect(home).toHaveAttribute('data-theme', 'nightfall');
  await expect(home).toHaveAttribute('data-region', 'north-america');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One more record.');
  await expect(page.getByRole('heading', { name: 'From North America' })).toBeVisible();
  await expect(page.locator('.home-dial__artists a strong')).toHaveText(['Beyonce', 'Kendrick Lamar', 'Lhasa de Sela']);
  const layout = await home.getAttribute('data-layout');
  const switcher = page.getByRole('button', { name: /Change homepage layout/ });
  const visited = new Set([layout]);
  for (let index = 0; index < 3; index++) {
    await switcher.click();
    const view = await home.getAttribute('data-layout');
    visited.add(view);
    if (testInfo.project.name === 'desktop-chromium') await page.screenshot({ path: `test-results/home-${view}-${testInfo.project.name}.png`, animations: 'disabled' });
  }
  expect(visited).toEqual(new Set(['studio', 'gallery', 'reading']));
  await expect(home).toHaveAttribute('data-layout', layout!);
  await expect(page.locator('.home-spotlight__choices button')).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await home.getAttribute('data-layout') === 'gallery') break;
    await switcher.click();
  }
  await expect(page.locator('.home-portrait-grid')).toHaveCSS('display', 'flex');
  await switcher.click();
  await expect(home).toHaveAttribute('data-layout', 'reading');
  await expect(page.locator('.home-spotlight__portrait img')).toHaveCSS('aspect-ratio', '1 / 1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});

test('offers a different catalog route for a Chinese browser locale', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:5173', locale: 'zh-CN', timezoneId: 'Asia/Shanghai' });
  try {
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date('2026-09-30T22:00:00+08:00'));
    await page.goto('/');
    const home = page.locator('.artist-home[data-edition-ready="true"]');
    await home.waitFor();
    await expect(home).toHaveAttribute('data-region', 'world');
    await expect(home).toHaveAttribute('data-theme', 'harvest');
    await expect(page.getByRole('heading', { name: 'Across the catalog' })).toBeVisible();
    await expect(page.locator('.home-dial__artists a strong')).toHaveText(['Kylie Minogue', 'Lorde', 'Róisín Murphy']);
  } finally {
    await context.close();
  }
});
