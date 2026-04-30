type Props = {
  readonly total: number;
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
};

export function Pagination({ total, currentPage, onPageChange }: Props) {
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-[var(--text)]">
        {total} {total === 1 ? "registro encontrado" : "registros encontrados"}
      </p>
      <div className="flex gap-2">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-full font-semibold ${
              page === currentPage
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--white)] text-[var(--primary)] hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
