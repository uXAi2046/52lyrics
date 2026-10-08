import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const paths = ['6764cb6d', 'ee8297a6', '8d9ea326', 'de01325a', '5e800292'].map((suffix) => '/lyrics/tom-lehrer-my-home-town-' + suffix);

test('renders the complete score reading in all five existing release entries', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  for (const path of paths) {
    await page.goto(path);
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(page.locator('.lyrics-copy > section > p')).toHaveCount(36);
    await expect(page.locator('#section-4 > p').first()).toHaveText('The guy that taught us math,');
    await expect(page.locator('#section-5 > p').nth(3)).toHaveText('(Hum)');
    await expect(page.locator('#section-7 > p').last()).toHaveText('In my home town.');
    await expect(page.getByRole('link', { name: 'Read the author’s score (PDF)', exact: true })).toHaveAttribute('href', 'https://tomlehrersongs.com/wp-content/uploads/2019/02/my-home-town-music.pdf');
    await expect(page.locator('.lyric-source')).toContainText('both lyric rows in repeat order');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  expect(errors).toEqual([]);
});

test('finds the newly readable song and preserves its score edition through reading and saving', async ({ page }, testInfo) => {
  await page.goto('/search?q=My%20Home%20Town&type=songs');
  await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: 'My Home Town', exact: true }) }).first().click();
  await page.getByRole('button', { name: /Just plain folks$/ }).click();
  await expect(page.getByRole('button', { name: /Just plain folks$/ })).toHaveAttribute('aria-current', 'step');
  await page.getByRole('button', { name: /A return home$/ }).click();
  await expect(page.getByRole('button', { name: /A return home$/ })).toHaveAttribute('aria-current', 'step');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.goto('/saved');
  await page.reload();
  await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: 'My Home Town', exact: true }) }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async (text: string) => localStorage.setItem('test:score-copy', text) },
  }));
  await page.getByRole('button', { name: 'Copy lyrics', exact: true }).click();
  const copied = await page.evaluate(() => localStorage.getItem('test:score-copy'));
  expect(copied).toContain('My Home Town — Tom Lehrer');
  expect(copied).toContain('(Hum)');
  expect(copied).toContain('my-home-town-music.pdf');
  await page.locator('.lyric-source').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('score-source.png') });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});
