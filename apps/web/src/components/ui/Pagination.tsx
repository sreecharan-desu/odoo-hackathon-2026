type PaginationProps = {
  total: number;
  limit: number;
  offset: number;
  onChange: (nextOffset: number) => void;
};

export default function Pagination({ total, limit, offset, onChange }: PaginationProps) {
  if (total <= limit) return null;

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const prevDisabled = offset <= 0;
  const nextDisabled = offset + limit >= total;

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button type="button" className="button button--ghost" disabled={prevDisabled} onClick={() => onChange(Math.max(0, offset - limit))}>
        Previous
      </button>
      <span className="pagination__meta text-muted">
        {from}–{to} of {total}
      </span>
      <button type="button" className="button button--ghost" disabled={nextDisabled} onClick={() => onChange(offset + limit)}>
        Next
      </button>
    </div>
  );
}
