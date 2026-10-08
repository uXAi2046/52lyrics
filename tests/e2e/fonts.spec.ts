import { expect, test } from '@playwright/test';

test('applies the bundled heading and body fonts even when their download is delayed', async ({ page }) => {
  await page.route('**/*.woff2', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    await route.continue();
  });
  await page.goto('/lyrics/the-midnight-echo-city-lights');
  await page.locator('html[data-app-ready="true"]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const selector of ['h1', '#section-1 > p:first-of-type']) {
    const metrics = await page.locator(selector).evaluate(async (element) => {
      const style = getComputedStyle(element);
      const family = style.fontFamily.split(',')[0].replaceAll(/["']/g, '').trim();
      const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]);
      const face = rules.find((rule) => rule instanceof CSSFontFaceRule
        && rule.style.fontFamily.replaceAll(/["']/g, '') === family
        && rule.style.fontWeight === style.fontWeight) as CSSFontFaceRule;
      if (!face) throw new Error(`Missing bundled face: ${family} ${style.fontWeight}`);
      // An independent loaded face reveals fallback rendering even when fonts.ready resolves.
      const referenceName = `Reference${family.replaceAll(' ', '')}`;
      const reference = new FontFace(referenceName, face.style.getPropertyValue('src'), { weight: style.fontWeight, display: 'swap' });
      await reference.load();
      document.fonts.add(reference);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      context.font = `${style.fontWeight} ${style.fontSize} ${referenceName}`;
      context.letterSpacing = style.letterSpacing;
      const range = document.createRange();
      range.selectNodeContents(element);
      return { actual: range.getBoundingClientRect().width, expected: context.measureText(element.textContent || '').width };
    });
    expect(metrics.actual, `Applied font for ${selector}`).toBeCloseTo(metrics.expected, 0);
  }
});
