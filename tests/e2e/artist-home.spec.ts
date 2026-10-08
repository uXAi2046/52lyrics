import { expect, test } from '@playwright/test';
import { waitForVisualPage } from './helpers/visual';
import { seedHomeSpotlights } from './helpers/homeSpotlights';

test.use({ timezoneId: 'Asia/Shanghai' });

test('switches spotlight by keyboard and persists only the selected artist', async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await page.locator('.home-spotlight[data-rotation-ready="true"]').waitFor();
  const choices = page.getByRole('group', { name: 'Choose a spotlight artist' });
  const buttons = choices.getByRole('button');
  const firstName = (await buttons.nth(1).innerText()).trim();
  await buttons.nth(1).focus();
  await page.keyboard.press('Space');
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  const panel = page.locator('#home-spotlight-panel');
  const artistLink = panel.getByRole('link', { name: `Explore ${firstName}`, exact: true });
  const firstHref = await artistLink.getAttribute('href');
  expect(firstHref).toMatch(/^\/artists\//);
  await panel.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved to your library', { exact: true })).toBeVisible();
  await buttons.nth(2).click();
  const secondHref = await panel.locator('.home-spotlight__portrait').getAttribute('href');
  await expect(panel.getByRole('button', { name: 'Save', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await buttons.nth(1).click();
  await expect(panel.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await page.goto('/saved');
  await expect(page.locator(`.catalog-card[href="${firstHref}"]`)).toBeVisible();
  await expect(page.locator(`.catalog-card[href="${secondHref}"]`)).toHaveCount(0);
});

test('rotates all three artists on reload and return visits without hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const summary = message.text().split('\n')[0];
    if (message.type() === 'error' && /hydrat|did not match|server HTML|Minified React error/i.test(summary)) errors.push(summary);
  });
  const names = async () => {
    await page.locator('.home-spotlight[data-rotation-ready="true"]').waitFor();
    const names = await page.locator('.home-spotlight__choices button').allTextContents();
    expect(new Set(names).size).toBe(3);
    return names;
  };
  await page.goto('/');
  const first = await names();
  await page.reload();
  const second = await names();
  expect(second.some((name) => first.includes(name))).toBe(false);
  await page.locator('.home-index-link').click();
  await expect(page).toHaveURL(/\/artists$/);
  await page.getByRole('banner').getByRole('link', { name: '52lyrics home', exact: true }).click();
  await expect(page).toHaveURL(new URL('/', page.url()).href);
  const third = await names();
  expect(third.some((name) => second.includes(name))).toBe(false);
  expect(errors).toEqual([]);
});

test('filters artist portraits and opens the corresponding index letter', async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await expect(page.locator('.home-portrait-card')).toHaveCount(12);
  const filter = page.getByRole('group', { name: 'Filter selected artists' });
  await filter.getByRole('button', { name: 'Rock', exact: true }).click();
  await expect(page.locator('.home-portrait-card h3')).toHaveText(['David Bowie', 'Radiohead', 'The Beatles']);
  await expect(page.locator('.home-artist-toolbar').getByRole('status')).toHaveText('3 editorial picks');
  await filter.getByRole('button', { name: 'All picks', exact: true }).click();
  await expect(page.locator('.home-portrait-card')).toHaveCount(12);
  await page.getByRole('link', { name: 'Artists starting with N', exact: true }).click();
  await expect(page).toHaveURL(/\/artists\?letter=N$/);
  await expect(page.getByRole('button', { name: 'N', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('follows a sourced record and folds song and album visits into one recent artist', async ({ page }) => {
  await page.goto('/');
  await page.locator('html[data-app-ready="true"]').waitFor();
  const record = page.locator('.home-release-card').first();
  const albumLink = record.locator('.home-release-card__record a');
  const href = await albumLink.getAttribute('href');
  await albumLink.click();
  await expect(page).toHaveURL(new URL(href!, page.url()).href);
  await expect(page.getByRole('heading', { level: 1, name: 'Dangerously in Love', exact: true })).toBeVisible();
  const track = page.locator('.track-list ol li a').first();
  const songHref = await track.getAttribute('href');
  await track.click();
  await expect(page).toHaveURL(new URL(songHref!, page.url()).href);
  await expect(page.getByRole('heading', { name: 'Lyrics unavailable in this catalog.' })).toBeVisible();
  await page.goto('/');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Back to the artists.' })).toBeVisible();
  await expect(page.locator('.home-recent-grid > a')).toHaveCount(1);
  await expect(page.locator('.home-recent-grid > a')).toHaveAttribute('href', '/artists/beyonce');
  await page.locator('.home-read-now').click();
  await expect(page.getByRole('heading', { level: 1, name: 'City Lights', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy lyrics', exact: true })).toBeVisible();
});

test('shows local credited artist photographs instead of generated album covers', async ({ page }) => {
  await page.goto('/');
  await waitForVisualPage(page);
  const imageUrls = await page.locator('main img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(imageUrls.length).toBeGreaterThan(12);
  expect(imageUrls.every((url) => url?.startsWith('/artwork/imported/'))).toBe(true);
  await page.getByText('Photograph credits & sources', { exact: true }).click();
  await expect(page.locator('.home-photo-credits')).toHaveAttribute('open', '');
  await expect(page.locator('.home-photo-credits .source-credit').first()).toBeVisible();
  await expect(page.locator('.home-photo-credits a[href^="https://commons.wikimedia.org/wiki/File:"]').first()).toBeVisible();
});

test('artist-led home at tablet width', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-25T14:00:00+08:00'));
  await seedHomeSpotlights(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await page.locator('.artist-home[data-edition-ready="true"]').waitFor();
  await waitForVisualPage(page);
  await expect(page).toHaveScreenshot('artist-home-tablet.png', { fullPage: true, animations: 'disabled' });
});

test('keeps an artist identifiable if a photograph fails and honors reduced motion', async ({ page }) => {
  await seedHomeSpotlights(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/artwork/imported/e02bd8f2c9272bb86f84.jpg', (route) => route.abort());
  await page.goto('/');
  await page.locator('html[data-app-ready="true"]').waitFor();
  const photo = page.locator('.home-spotlight__portrait img');
  await expect(photo).toHaveAttribute('data-photo-fallback', 'true');
  await expect(photo).toHaveAttribute('alt', 'Beyonce — photo unavailable');
  await expect(photo).toHaveAttribute('src', /^data:image\/svg\+xml/);
  await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.getByRole('group', { name: 'Choose a spotlight artist' }).getByRole('button', { name: 'Nina Simone' }).click();
  await expect(photo).not.toHaveAttribute('data-photo-fallback');
  await expect(photo).toHaveAttribute('src', /^\/artwork\/imported\//);
  expect(await page.locator('.home-portrait-card img').first().evaluate((image) => Number.parseFloat(getComputedStyle(image).transitionDuration))).toBeLessThan(0.01);
});
