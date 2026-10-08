import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { waitForVisualPage } from './helpers/visual';

test('discovers, reads, copies and saves imported lyrics with source attribution', async ({ page }) => {
  await page.goto('/search?q=Amazing%20Grace&type=songs');
  await page.locator('html[data-app-ready="true"]').waitFor();
  // Multiple recording artists can share a title; select the visible writer and availability.
  const reading = page.getByRole('link', { name: /Public-domain lyrics Amazing Grace John Newton/ });
  await expect(page.locator('.catalog-card').first()).toHaveAttribute('href', '/lyrics/john-newton-amazing-grace');
  await reading.click();
  await expect(page).toHaveURL(/\/lyrics\/john-newton-amazing-grace$/);
  await expect(page.getByText('Complete public-domain lyrics', { exact: true })).toBeVisible();
  await expect(page.getByText('Complete original lyrics', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Read the source on Wikisource' })).toHaveAttribute('href', /oldid=15417564$/);
  await expect(page.locator('.lyrics-copy > section')).toHaveCount(6);
  await page.getByRole('button', { name: /Verse 6/ }).click();
  await expect(page.locator('#section-6')).toBeInViewport();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => localStorage.setItem('test:copied', text) } });
  });
  await page.getByRole('button', { name: 'Copy lyrics' }).click();
  await expect(page.getByText('Lyrics copied', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('test:copied'))).toContain('oldid=15417564');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/saved');
  await expect(page.getByRole('link', { name: /Amazing Grace/ })).toBeVisible();
});

test('filters public-domain texts and connects their writer and songbook', async ({ page }) => {
  await page.goto('/discover');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('History');
  await page.getByRole('combobox', { name: 'Lyrics', exact: true }).selectOption('full');
  await expect(page.locator('.collection-section')).toHaveCount(1);
  await expect(page.locator('.collection-section .catalog-card')).toHaveCount(8);
  await page.getByRole('link', { name: /Amazing Grace/ }).click();
  await page.getByRole('link', { name: 'John Newton', exact: true }).click();
  await expect(page.getByText('Writer file · Lifespan · 1725–1807')).toBeVisible();
  await page.getByRole('link', { name: /Songbook.*John Newton/ }).click();
  await expect(page.getByText(/An editorial songbook, not a recorded album/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inside the songbook.' })).toBeVisible();
});

test('historical lyric layout is accessible and fits the viewport', async ({ page }) => {
  await page.goto('/lyrics/john-newton-amazing-grace');
  await waitForVisualPage(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  await expect(page).toHaveScreenshot('public-domain-lyric.png', { fullPage: true, animations: 'disabled' });
});
