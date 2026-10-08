import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const addedSheets: [string, number][] = [
  ['deep-doodoo', 49], ['hes-not-the-one', 75], ['ice-cream-tango', 41],
  ['the-love-song-of-the-physical-anthropologist', 23], ['were-gonna-put-a-man-on-the-moon', 26],
  ['the-menu-song', 55], ['the-mumble-song', 19], ['no-rice', 35],
  ['polaroid-photography-song', 29], ['political-action-song', 27], ['post-thanksgiving-hymn', 21],
  ['scenery', 32], ['take-me-for-a-walk', 58], ['thank-him-for-me', 36],
  ['theres-a-delta-for-every-epsilon', 23], ['without-an-s', 32],
];

test('honors the first rail click from search on a CPU-throttled device', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/search?q=He%27s%20Not%20the%20One&type=songs');
  await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: "He's Not the One", exact: true }) }).click();
  await expect(page.locator('.lyrics-copy > header')).toContainText('no music was written');
  await page.getByRole('button', { name: /Second password$/ }).click();
  await expect(page.getByRole('button', { name: /Second password$/ })).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#section-8')).toBeInViewport();
});

test('renders every new author text with complete line counts, source links and bounded layout', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.status() + ' ' + response.url());
  });
  for (const [slug, lines] of addedSheets) {
    await page.goto('/lyrics/tom-lehrer-' + slug);
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.lyrics-copy > section > p'), slug).toHaveCount(lines);
    await expect(page.locator('.lyric-facts')).toContainText('Undated text');
    await expect(page.getByRole('link', { name: 'Read the author’s lyric sheet (PDF)' })).toHaveAttribute('href', /^https:\/\/tomlehrersongs\.com\/.*\.pdf$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), slug).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect(page.locator('.back-link')).toHaveAttribute('href', '/albums/tom-lehrer-author-lyric-sheets');
  }
  expect(failures).toEqual([]);
});

test('discovers the menu text, copies its chosen ending and retains it in Saved after refresh', async ({ page }) => {
  await page.goto('/discover');
  await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('Learning');
  await page.getByRole('combobox', { name: 'Lyrics', exact: true }).selectOption('full');
  await page.locator('#wordplay-classroom .catalog-card').filter({ has: page.getByRole('heading', { name: 'The Menu Song', exact: true }) }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'The Menu Song', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Dessert$/ }).click();
  await expect(page.locator('#section-4')).toBeInViewport();
  await expect(page.locator('#section-4 > p').last()).toHaveText('soap flakes.');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text: string) => localStorage.setItem('test:menu-copy', text) },
  }));
  await page.getByRole('button', { name: 'Copy lyrics', exact: true }).click();
  await expect(page.getByText('Lyrics copied', { exact: true })).toBeVisible();
  const copied = await page.evaluate(() => localStorage.getItem('test:menu-copy'));
  expect(copied).toContain('[Soup]');
  expect(copied).toContain('[Dessert]');
  expect(copied).toContain('soap flakes.');
  expect(copied).not.toContain('1911');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.goto('/saved');
  await page.reload();
  await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: 'The Menu Song', exact: true }) }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('keeps uncomposed theatre text and alternate versions explicit through chapter navigation', async ({ page }, testInfo) => {
  await page.goto('/search?q=He%27s%20Not%20the%20One&type=songs');
  await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: "He's Not the One", exact: true }) }).click();
  await expect(page.locator('.lyrics-copy > header')).toContainText('no music was written');
  await page.getByRole('button', { name: /Second password$/ }).click();
  await expect(page.locator('#section-8')).toBeInViewport();
  await expect(page.locator('#section-8')).toContainText('while S and J encourage him');
  await page.getByRole('button', { name: /The exchange$/ }).click();
  await expect(page.getByRole('button', { name: /The exchange$/ })).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#section-9 > p').last()).toHaveText('ALL: The one');
  await page.screenshot({ path: 'test-results/author-trio-' + testInfo.project.name + '.png' });
  await page.goto('/lyrics/tom-lehrer-polaroid-photography-song');
  await page.reload();
  await page.getByRole('button', { name: /Final chorus$/ }).click();
  await expect(page.getByRole('button', { name: /Final chorus$/ })).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#section-11')).toBeInViewport();
  await expect(page.locator('.lyrics-copy > header')).toContainText('not the separate 1972');
  await expect(page.locator('.lyrics-copy')).not.toContainText('infra-red');
  await page.goto('/lyrics/tom-lehrer-take-me-for-a-walk');
  await page.getByRole('button', { name: /Interlude$/ }).click();
  await expect(page.locator('#section-5')).toBeInViewport();
  await expect(page.locator('.lyrics-copy')).not.toContainText('Cancel lunch');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
