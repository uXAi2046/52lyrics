import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import type { paginate } from '../../data/pagination';

interface Props {
  pagination: ReturnType<typeof paginate>;
  label: string;
  anchor: string;
  parameter?: string;
  position?: 'top' | 'bottom';
}

export function Pagination({ pagination, label, anchor, parameter = 'page', position = 'top' }: Props) {
  const location = useLocation();
  const { page, pages, offset, end, total } = pagination;
  if (pages <= 1) return null;
  const href = (target: number) => {
    const params = new URLSearchParams(location.search);
    if (target === 1) params.delete(parameter); else params.set(parameter, String(target));
    return `${location.pathname}${params.size ? `?${params}` : ''}#${anchor}`;
  };
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((number) => number >= 1 && number <= pages).sort((a, b) => a - b);
  return (
    <nav className="catalog-pagination" aria-label={`${label} (${position})`}>
      <p aria-live={position === 'top' ? 'polite' : undefined}>Showing {offset + 1}–{end} of {total}</p>
      <div>
        {page > 1 ? <Link to={href(page - 1)} aria-label="Previous page"><ArrowLeft aria-hidden="true" /><span>Previous</span></Link> : <span className="catalog-pagination__disabled" aria-disabled="true"><ArrowLeft aria-hidden="true" /><span>Previous</span></span>}
        {numbers.map((number, index) => (
          <span className="catalog-pagination__number" key={number}>
            {index > 0 && number - numbers[index - 1] > 1 && <span aria-hidden="true">…</span>}
            {number === page ? <span aria-current="page" aria-label={`Page ${number}`}>{number}</span> : <Link to={href(number)} aria-label={`Page ${number}`}>{number}</Link>}
          </span>
        ))}
        {page < pages ? <Link to={href(page + 1)} aria-label="Next page"><span>Next</span><ArrowRight aria-hidden="true" /></Link> : <span className="catalog-pagination__disabled" aria-disabled="true"><span>Next</span><ArrowRight aria-hidden="true" /></span>}
      </div>
    </nav>
  );
}
