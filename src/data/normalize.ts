// Source typography varies; matching never changes stored titles, IDs or URLs.
export const normalizeCatalogText = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[‐‑]/g, '-')
  .toLowerCase()
  .trim();
