import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('html[data-app-ready="true"]').waitFor();
});

test('finds City Lights in two actions and persists a saved song', async ({ page, isMobile }) => {
  if (isMobile) {
    await page.getByRole('button', { name: 'Open search' }).click();
  }
  const search = page.getByRole('combobox', { name: 'Search songs, artists, and albums' }).first();
  await search.fill('City Lights');
  await page.getByRole('option', { name: /City Lights/ }).click();
  await expect(page).toHaveURL(/lyrics\/the-midnight-echo-city-lights/);
  await expect(page.getByRole('heading', { name: 'City Lights', level: 1 })).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Saved to your library')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/saved');
  await expect(page.getByRole('link', { name: /City Lights/ })).toBeVisible();
});

test('shows notes rather than placeholder lyrics for unavailable songs', async ({ page }) => {
  await page.goto('/lyrics/miley-cyrus-flowers');
  await expect(page.getByRole('heading', { name: 'Lyrics unavailable in this catalog.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Context, not a substitute.' })).toBeVisible();
  await expect(page.getByText('[Verse')).toHaveCount(0);
});

test('redirects legacy IDs to canonical slugs', async ({ page }) => {
  await page.goto('/lyrics/alb23_t1');
  await expect(page).toHaveURL(/lyrics\/the-midnight-echo-city-lights$/);
});

test('supports keyboard search and URL-synced result filters', async ({ page, isMobile }) => {
  if (isMobile) await page.getByRole('button', { name: 'Open search' }).click();
  const scope = isMobile ? page.getByRole('dialog', { name: 'Search 52lyrics' }) : page.locator('.site-header');
  const search = scope.getByRole('combobox', { name: 'Search songs, artists, and albums' });
  await search.fill('City Lights');
  await expect(page.getByRole('option', { name: /City Lights/ }).first()).toBeVisible();
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(page).toHaveURL(/lyrics\/the-midnight-echo-city-lights$/);

  await page.goto('/search?q=midnight&type=all');
  await page.getByRole('button', { name: 'Artists' }).click();
  await expect(page).toHaveURL(/q=midnight&type=artists/);
  await expect(page.getByText(/result/).last()).toBeVisible();
});

test('undoes a removal and confirms before clearing saved items', async ({ page }) => {
  await page.goto('/lyrics/the-midnight-echo-city-lights');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Saved' }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/saved');
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('link', { name: /City Lights/ })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByRole('heading', { name: 'Save the pieces worth returning to.' })).toBeVisible();
});

test('falls back to copying the canonical URL when native sharing is unavailable', async ({ page }) => {
  await page.goto('/lyrics/the-midnight-echo-city-lights');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async (value: string) => localStorage.setItem('test:shared-url', value) },
      configurable: true,
    });
  });
  await page.getByRole('button', { name: 'Share' }).click();
  await expect(page.getByText('Link copied')).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('test:shared-url')))
    .toMatch(/lyrics\/the-midnight-echo-city-lights$/);
});

test('renders a complete 404 and survives a canonical deep-link refresh', async ({ page }) => {
  await page.goto('/this-side-does-not-exist');
  await expect(page.getByRole('heading', { name: 'This side is silent.' })).toBeVisible();

  await page.goto('/lyrics/the-midnight-echo-city-lights');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'City Lights', level: 1 })).toBeVisible();
});

test('key pages have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/discover', '/search?q=city&type=all', '/lyrics/the-midnight-echo-city-lights', '/saved']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).exclude('.vercel-toolbar').analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
    expect(serious, `Accessibility violations on ${path}`).toEqual([]);
  }
});
