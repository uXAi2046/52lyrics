import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Read independent source snapshots without importing the application's catalog adapter.
const snapshot = (name: string) => JSON.parse(readFileSync(new URL(`../../src/data/imported/${name}.json`, import.meta.url), 'utf8'));
const batch = snapshot('musicbrainz');
const profiles = snapshot('artist-profiles');
const images = snapshot('commons');

test.beforeEach(() => {
  // Staging is deliberately not published early. These must run at the final publication gate.
  test.skip(!('expansion' in batch), 'The reviewed artist-expansion batch has not been promoted yet.');
});

for (const fixture of ['Lady Gaga', 'LMFAO', 'last admitted artist']) {
  test(`expanded catalog connects and persists ${fixture}`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    expect(batch.expansion.target).toBeGreaterThanOrEqual(600);
    expect(batch.artists.filter((record) => record.albums.length > 0).length).toBeGreaterThanOrEqual(batch.expansion.target);
    const record = fixture === 'last admitted artist' ? batch.artists.at(-1) : batch.artists.find((item) => item.name === fixture);
    expect(record).toBeDefined();
    const artistId = record.existingId || `mb-artist-${record.mbid}`;
    const album = record.albums[0];
    const song = album.tracks[0];
    const profile = profiles.records.find((item) => item.wikidataId === record.wikidataId);
    expect(profile).toBeDefined();
    const photo = images.records.find((item) => item.wikidataId === record.wikidataId);
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`/artists/${artistId}`);
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(page).not.toHaveURL(new RegExp(`/artists/${artistId}(?:[?#]|$)`));
    const artistUrl = new URL(page.url()).pathname;
    expect(artistUrl).not.toBe(`/artists/${artistId}`);
    await page.goto(`/search?${new URLSearchParams({ q: record.name, type: 'artists' })}`);
    await page.locator(`.catalog-card[href="${artistUrl}"]`).click();
    await expect(page.getByRole('heading', { level: 1, name: record.name, exact: true })).toBeVisible();
    if (profile.description) await expect(page.locator('.artist-hero__bio')).toContainText(profile.description);
    await expect(page.getByRole('link', { name: 'MusicBrainz', exact: true })).toHaveAttribute('href', `https://musicbrainz.org/artist/${record.mbid}`);
    if (profile.description || profile.genres.length && !record.genres.length) {
      await expect(page.getByRole('link', { name: 'Wikidata', exact: true })).toHaveAttribute('href', profile.sourceUrl);
    } else {
      await expect(page.getByRole('link', { name: 'Wikidata', exact: true })).toHaveCount(0);
    }
    await expect(page.locator('.artist-hero .tag-list span')).toHaveText(record.genres.length ? record.genres : profile.genres.map((genre) => genre.name));
    const portrait = page.locator('.artist-hero__image img');
    await expect(portrait).toHaveAttribute('src', photo ? photo.localPath : /^data:image\/svg\+xml/);
    await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.locator('.artist-hero').screenshot({ path: `test-results/expanded-${fixture.replaceAll(' ', '-')}-${testInfo.project.name}.png`, animations: 'disabled' });

    await page.locator('.catalog-card[href^="/albums/"]').first().click();
    await expect(page.getByRole('heading', { level: 1, name: album.title, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'MusicBrainz', exact: true })).toHaveAttribute('href', `https://musicbrainz.org/release/${album.releaseId}`);
    await expect(page.locator('.track-list ol li')).toHaveCount(album.tracks.length);
    await expect(page.locator('.track-list ol li a strong')).toHaveText(album.tracks.map((track) => track.title));
    const firstTrack = page.locator('.track-list ol li a').first();
    const songUrl = await firstTrack.getAttribute('href');
    expect(songUrl).toMatch(/^\/lyrics\//);
    await firstTrack.click();
    await expect(page).toHaveURL(new URL(songUrl!, page.url()).href);
    await expect(page.getByRole('heading', { level: 1, name: song.title, exact: true })).toBeVisible();
    await page.reload();
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(page.getByRole('heading', { level: 1, name: song.title, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lyrics unavailable in this catalog.' })).toBeVisible();
    await expect(page.locator('.lyrics-copy')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Copy lyrics', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'MusicBrainz', exact: true })).toHaveAttribute('href', `https://musicbrainz.org/recording/${song.recordingId}`);

    await page.goto('/saved');
    await page.reload();
    await page.getByRole('button', { name: 'Artists', exact: true }).click();
    await page.locator(`.catalog-card[href="${artistUrl}"]`).click();
    await expect(page.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(pageErrors).toEqual([]);
  });
}

test('expanded directory reaches the last page and source aliases resolve to one identity', async ({ page }) => {
  expect(batch.artists.filter((record) => record.albums.length > 0).length).toBeGreaterThanOrEqual(batch.expansion.target);
  await page.goto('/artists');
  await page.locator('html[data-app-ready="true"]').waitFor();
  const pages = page.getByRole('navigation', { name: 'Artist pages (top)', exact: true });
  const total = Number((await pages.locator('p').innerText()).match(/of (\d+)$/)![1]);
  expect(total).toBeGreaterThanOrEqual(batch.artists.length);
  const lastPage = Math.ceil(total / 24);
  await pages.getByRole('link', { name: `Page ${lastPage}`, exact: true }).click();
  await page.reload();
  await expect(page).toHaveURL(new RegExp(`page=${lastPage}(?:#|$)`));
  await expect(page.locator('.artist-index .catalog-card')).toHaveCount(total - (lastPage - 1) * 24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);

  const record = batch.artists.find((item) => item.name === 'Tupac Shakur')!;
  expect(record).toBeDefined();
  expect(record.nameInSource).toBe('2Pac');
  const artistId = record.existingId || `mb-artist-${record.mbid}`;
  await page.goto(`/artists/${artistId}`);
  await page.locator('html[data-app-ready="true"]').waitFor();
  await expect(page).not.toHaveURL(new RegExp(`/artists/${artistId}(?:[?#]|$)`));
  const artistUrl = new URL(page.url()).pathname;
  await page.goto('/search?q=2Pac&type=artists');
  const result = page.locator(`.catalog-card[href="${artistUrl}"]`);
  await expect(result).toHaveCount(1);
  await expect(result.getByRole('heading')).toHaveText('Tupac Shakur');
  await result.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Tupac Shakur', exact: true })).toBeVisible();
});
