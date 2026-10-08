import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const sheets: [string, number][] = [
  ['the-professors-song', 27], ['s-equals-one-half-g-t-squared', 46], ['the-sac-song', 16],
  ['sociology', 56], ['speeds-song', 16], ['the-subway-song', 8], ['te-amo', 58],
  ['unsong', 45], ['were-talkin-algebra', 72], ['why-not-fight', 30],
  ['i-cant-think-why', 27], ['the-night-i-appeared-as-macbeth', 50],
  ['trees', 15], ['tango-de-la-menegilda', 51],
];

test('reads every remaining approved sheet without runtime errors, missing text or overflow', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) failures.push(response.status() + ' ' + response.url()); });
  for (const [slug, lines] of sheets) {
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

test('finds adaptations by original writer and carries provenance into copied lyrics', async ({ page }, testInfo) => {
  for (const [writer, title] of [
    ['W. S. Gilbert', "I Can't Think Why"], ['William Hargreaves', 'The Night I Appeared as Macbeth'],
    ['Felipe Pérez y González', 'Tango de la Menegilda'], ['Joyce Kilmer', 'Trees'],
  ]) {
    await page.goto('/search?q=' + encodeURIComponent(writer) + '&type=songs');
    await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) }).click();
    await expect(page.getByRole('heading', { name: title, level: 1, exact: true })).toBeVisible();
    await expect(page.locator('.lyrics-copy > footer')).toContainText('Written by ' + writer + ', Tom Lehrer');
    await expect(page.locator('.underlying-work')).toContainText(writer);
    await expect(page.getByRole('link', { name: 'Original-work evidence 1', exact: true })).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('.lyric-source')).not.toContainText('uses only his words');
  }
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async (text: string) => localStorage.setItem('test:adaptation-copy', text) },
  }));
  await page.getByRole('button', { name: 'Copy lyrics', exact: true }).click();
  await expect(page.getByText('Lyrics copied', { exact: true })).toBeVisible();
  const copied = await page.evaluate(() => localStorage.getItem('test:adaptation-copy'));
  expect(copied).toContain('Trees — Joyce Kilmer, Tom Lehrer');
  expect(copied).toContain('https://www.gutenberg.org/ebooks/263');
  expect(copied).toContain('I mean God ---');
  expect(copied).not.toContain('I think that I shall never see');
  await page.locator('.underlying-work').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('adaptation-credits.png') });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
});

test('navigates both duet voices and preserves Spanish language tags after refresh', async ({ page }, testInfo) => {
  await page.goto('/lyrics/tom-lehrer-te-amo');
  await page.reload();
  await expect(page.locator('#section-1 > p')).toHaveCount(4);
  await expect(page.locator('#section-1 > p').first()).toHaveAttribute('lang', 'es');
  await expect(page.locator('#section-2 > p').first()).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: /He · A request$/ }).click();
  await expect(page.getByRole('button', { name: /He · A request$/ })).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#section-3 > p').last()).toHaveText('Un besito de contestación.');
  await expect(page.locator('#section-4 > p').first()).toHaveText('I think he said "amor."');
  await page.getByRole('button', { name: /She · Coda$/ }).click();
  await expect(page.getByRole('button', { name: /She · Coda$/ })).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('#section-8 > p').last()).toHaveText('So we shall see, Si, Si!');
  await page.screenshot({ path: testInfo.outputPath('duet-coda.png') });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.goto('/saved');
  await page.reload();
  await page.locator('.catalog-card').filter({ has: page.getByRole('heading', { name: 'Te Amo', exact: true }) }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
});

test('discovers the new spelling text and keeps all four algebra refrains', async ({ page }) => {
  await page.goto('/discover');
  await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('Learning');
  await expect(page.locator('#wordplay-classroom .catalog-card')).toHaveCount(11);
  await page.locator('#wordplay-classroom .catalog-card').filter({ has: page.getByRole('heading', { name: 'Why Not Fight?', exact: true }) }).click();
  await expect(page.locator('#section-2 > p').nth(7)).toHaveText('Singers: Fight?');
  await expect(page.locator('#section-2 > p').nth(8)).toHaveText('Cheering: Give a cheer, give a yell,');
  expect((await page.locator('.lyrics-copy > section > p').allTextContents()).join('\n')).not.toContain('quarterback');
  await page.goto('/lyrics/tom-lehrer-were-talkin-algebra');
  await page.getByRole('button', { name: /Refrain 4$/ }).click();
  await expect(page.getByRole('button', { name: /Refrain 4$/ })).toHaveAttribute('aria-current', 'step');
  for (const index of [2, 4, 6, 8]) {
    await expect(page.locator('#section-' + index + ' > p')).toHaveCount(10);
    await expect(page.locator('#section-' + index + ' > p').first()).toHaveText("We're talkin' algebra,");
    await expect(page.locator('#section-' + index + ' > p').last()).toHaveText('Yes, you!');
  }
});
