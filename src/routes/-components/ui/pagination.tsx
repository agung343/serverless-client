interface Props {
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  onNextPrefetch: () => void
  onPrevPrefetch: () => void
}

export default function Pagination({
  page,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  onNextPrefetch,
  onPrevPrefetch
}: Props) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-stone-600">Page {page}</p>
      <div className="flex gap-2">
        <button
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          onMouseEnter={onPrevPrefetch}
          className="py-1 px-3 rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          onMouseEnter={onNextPrefetch}
          className="py-1 px-3 rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
