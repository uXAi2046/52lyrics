import { describe, expect, it } from 'vitest';
import { serializeStructuredData } from './structuredData';
import { buildImageUrl } from './mockData';

describe('external catalog text at HTML boundaries', () => {
  it('round-trips source titles without allowing them to terminate JSON-LD', () => {
    const source = { '@type': 'MusicAlbum', name: '</script><script>alert(1)</script>', description: 'A & B < C — “quoted”' };
    const serialized = serializeStructuredData(source);
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(source);
    const document = new DOMParser().parseFromString(`<script type="application/ld+json">${serialized}</script>`, 'text/html');
    expect(document.querySelectorAll('script')).toHaveLength(1);
    expect(JSON.parse(document.querySelector('script')!.textContent!)).toEqual(source);
  });

  it('renders ampersands and angle-bracket initials as SVG text, not markup', () => {
    const svg = decodeURIComponent(buildImageUrl('& <').split(',')[1]);
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.querySelector('text')?.textContent).toBe('&<');
    expect(document.querySelectorAll('text')).toHaveLength(1);
  });
});
