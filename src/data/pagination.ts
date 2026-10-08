export function paginate(total: number, rawPage: string | null, pageSize = 24) {
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(pageSize) || pageSize < 1) throw new RangeError('Invalid pagination size');
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const requested = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page = Math.min(pages, Math.max(1, Number.isSafeInteger(requested) ? requested : 1));
  const offset = (page - 1) * pageSize;
  return { page, pages, offset, end: Math.min(total, offset + pageSize), total };
}
