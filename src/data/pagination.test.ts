import { describe, expect, it } from 'vitest';
import { paginate } from './pagination';

describe('catalog pagination', () => {
  it('covers every item once across a 500-artist directory', () => {
    const indices = Array.from({ length: 21 }, (_, index) => paginate(500, String(index + 1))).flatMap(({ offset, end }) => Array.from({ length: end - offset }, (_, index) => offset + index));
    expect(indices).toEqual(Array.from({ length: 500 }, (_, index) => index));
  });
  it('clamps stale pages after filtering and rejects malformed page values', () => {
    expect(paginate(25, '999')).toMatchObject({ page: 2, offset: 24, end: 25 });
    for (const page of [null, '', '0', '-1', '1.5', 'Infinity', 'abc', '1e2', '99999999999999999999']) {
      expect(paginate(500, page).page).toBe(1);
    }
    expect(paginate(0, '9')).toMatchObject({ page: 1, pages: 1, offset: 0, end: 0 });
    expect(() => paginate(10, '1', 0)).toThrow(RangeError);
  });
});
