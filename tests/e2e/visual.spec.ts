import { expect, test } from '@playwright/test';
import { waitForVisualPage } from './helpers/visual';
import { seedHomeSpotlights } from './helpers/homeSpotlights';

test.describe('home visual', () => {
  test.use({ timezoneId: 'Asia/Shanghai' });

  test('home visual', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-25T14:00:00+08:00'));
    await seedHomeSpotlights(page);
    await page.goto('/');
    await page.locator('.artist-home[data-edition-ready="true"]').waitFor();
    await waitForVisualPage(page);
    await expect(page).toHaveScreenshot('home.png', { fullPage: true, animations: 'disabled' });
  });
});

test('full lyric visual', async ({ page }) => {
  await page.goto('/lyrics/the-midnight-echo-city-lights');
  await waitForVisualPage(page);
  await expect(page).toHaveScreenshot('full-lyric.png', { fullPage: true, animations: 'disabled' });
});

test('metadata song visual', async ({ page }) => {
  await page.goto('/lyrics/miley-cyrus-flowers');
  await waitForVisualPage(page);
  await expect(page).toHaveScreenshot('metadata-song.png', { fullPage: true, animations: 'disabled' });
});
