import { expect, test } from '@playwright/test';

test('reading guides connect the homepage to real catalog entries', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Follow a song to its release edition' }).click();
  await expect(page).toHaveURL(/\/guides\/follow-a-song-to-its-release$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Follow a song to its release edition');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost:5173/guides/follow-a-song-to-its-release');
  await page.getByRole('article').getByRole('link', { name: 'Dangerously in Love' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dangerously in Love');
});

test('guides have distinct summaries and private or empty pages stay out of search', async ({ page }) => {
  await page.goto('/guides/which-lyrics-can-you-read');
  await expect(page.getByRole('article').getByRole('link', { name: 'City Lights' })).toHaveAttribute('href', '/lyrics/the-midnight-echo-city-lights');
  const lyricDescription = await page.locator('meta[name="description"]').getAttribute('content');
  await page.goto('/guides/read-the-historical-songbook');
  await expect(page.getByRole('article').getByRole('link', { name: 'Amazing Grace' })).toHaveAttribute('href', '/lyrics/john-newton-amazing-grace');
  expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toBe(lyricDescription);
  await page.goto('/search');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.goto('/saved');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('source-led guides link to complete texts and explain the edition shown', async ({ page }) => {
  await page.goto('/guides/tom-lehrer-lyrics-source-guide');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tom Lehrer lyrics: follow the author’s source sheets');
  await expect(page.getByRole('article').getByRole('link', { name: 'The Elements' })).toHaveAttribute('href', /\/lyrics\/tom-lehrer-the-elements-/);

  await page.goto('/guides/amazing-grace-1840-lyrics');
  await expect(page.getByRole('article').getByRole('link', { name: '52lyrics reading page' })).toHaveAttribute('href', '/lyrics/john-newton-amazing-grace');
  await expect(page.getByRole('article')).toContainText('six-stanza printed text');
});
