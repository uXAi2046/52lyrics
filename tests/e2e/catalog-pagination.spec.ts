import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('artist pages preserve URL state, refresh and return without rendering the whole archive', async ({ page }, testInfo) => {
  await page.goto('/artists');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await expect(page.locator('.artist-index .catalog-card')).toHaveCount(24);
  const firstPage = await page.locator('.artist-index .catalog-card h3').allTextContents();
  const pages = page.getByRole('navigation', { name: 'Artist pages (top)', exact: true });
  await pages.getByRole('link', { name: 'Next page' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('.artist-index .catalog-card h3')).not.toHaveText(firstPage);
  const secondPage = await page.locator('.artist-index .catalog-card h3').allTextContents();
  expect(secondPage.length).toBeGreaterThan(0);
  expect(secondPage.some((name) => firstPage.includes(name))).toBe(false);
  await page.reload();
  await expect(page.locator('.artist-index .catalog-card h3')).toHaveText(secondPage);
  await page.goBack();
  await expect(page.locator('.artist-index .catalog-card h3')).toHaveText(firstPage);
  await page.getByRole('textbox', { name: 'Filter artists' }).fill('Adele');
  await expect(page).toHaveURL(/q=Adele/);
  await expect(page.locator('.artist-index .catalog-card[href="/artists/adele"]')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Filter artists' })).toHaveValue('Adele');
  await expect(page.locator('.artist-index .catalog-card[href="/artists/adele"] h3')).toHaveText('Adele');
  await page.getByRole('button', { name: 'Clear artist filter' }).click();
  await expect(page.locator('.artist-index .catalog-card')).toHaveCount(24);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  await pages.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/artist-pagination-${testInfo.project.name}.png` });
});

test('search pagination keeps the query and type and resets when switching filters', async ({ page }) => {
  await page.goto('/search?q=album&type=songs');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await expect(page.locator('#search-results .catalog-card')).toHaveCount(24);
  const firstPage = await page.locator('#search-results .catalog-card h3').allTextContents();
  const nav = page.getByRole('navigation', { name: 'Search result pages (top)' });
  await nav.getByRole('link', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/q=album&type=songs&page=2/);
  await expect(page.locator('#search-results .catalog-card h3')).not.toHaveText(firstPage);
  const secondPage = await page.locator('#search-results .catalog-card h3').allTextContents();
  await page.reload();
  await expect(page.locator('#search-results .catalog-card h3')).toHaveText(secondPage);
  await page.getByRole('button', { name: 'Artists', exact: true }).click();
  await expect(page).toHaveURL(/q=album&type=artists$/);
  await expect(page.getByRole('button', { name: 'Artists', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#search-results .availability')).toHaveCount(0);
});

test('album archive pages retain their section anchor across a deep-link refresh', async ({ page }) => {
  await page.goto('/discover#album-archive');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await expect(page.locator('#album-archive .catalog-card')).toHaveCount(24);
  const firstPage = await page.locator('#album-archive .catalog-card h3').allTextContents();
  await page.locator('#album-archive').getByRole('navigation').first().getByRole('link', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page-album-archive=2#album-archive$/);
  await expect(page.locator('#album-archive .catalog-card h3')).not.toHaveText(firstPage);
  const secondPage = await page.locator('#album-archive .catalog-card h3').allTextContents();
  expect(secondPage).not.toEqual(firstPage);
  await page.reload();
  await expect(page.locator('#album-archive .catalog-card h3')).toHaveText(secondPage);
});
