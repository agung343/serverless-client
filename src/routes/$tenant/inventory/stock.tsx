import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { productKeys, stockQueryOptions } from "~/queries/productQueryOptions";
import { getStockMovement } from "~/api/stock";
import { StockQuerySchema } from "~/schema/stock.schema";
import { useDebounceCallback } from "~/hooks/debounce";
import { usePrefetch } from "~/hooks/usePrefetch";
import { formatUnit } from "~/lib/unit";
import { dateSummary } from "~/lib/date";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import Pagination from "~/routes/-components/ui/pagination";

export const Route = createFileRoute("/$tenant/inventory/stock")({
  validateSearch: StockQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(stockQueryOptions(deps));
  },
  component: StockPage,
});

function StockPage() {
  const query = useSearch({
    from: "/$tenant/inventory/stock",
  });
  const navigate = useNavigate({ from: "/$tenant/inventory/stock" });
  const prefetch = usePrefetch();

  const { data } = useSuspenseQuery(stockQueryOptions(query));
  const products = data.products || [];
  const meta = data.meta;

  const debounceSearch = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  });

  function handleChangePage(newPage: number) {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  }

  function handleChangeLimit(newLimit: number) {
    navigate({
      search: (prev) => ({ ...prev, limit: newLimit, page: 1 }),
    });
  }

  function handleChangeDateRange(startDate?: string, endDate?: string) {
    navigate({
      search: (prev) => ({ ...prev, startDate, endDate, page: 1 }),
    });
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-center text-2xl lg:text-4xl font-bold my-3 text-blue-500/70">
        Stock Movement
      </h1>
      <div className="flex items-center justify-between text-sm lg:text-base">
        <SearchInput
          onChange={debounceSearch}
          defaultValue={query.search}
          label="Search"
        />
        <DateRange
          onChange={handleChangeDateRange}
          startValue={query.startDate}
          endValue={query.endDate}
        />
        <LimitSelect onChange={handleChangeLimit} value={query.limit} />
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <table className="border border-collapse border-black divide-y divide-black min-w-full">
          <thead className="font-semibold sticky top-0 z-10 bg-blue-300">
            <tr>
              <th className="border p-2 text-center w-12">No</th>
              <th className="border p-2 text-center w-64">Product</th>
              <th className="border p-2 text-center w-32">Date</th>
              <th className="border p-2 text-center w-24">Type</th>
              <th className="border p-2 text-center w-16">Quantity</th>
              <th className="border p-2 text-center w-40">Note</th>
              <th className="border p-2 text-center w-20">Checked</th>
              <th className="border p-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr
                key={product.id}
                className="font-light text-sm lg:text-base odd:bg-gray-100/50 even:bg-gray-200/50"
              >
                <td className="p-1.5 border text-center">
                  {i + 1 + (query.page - 1) * query.limit}
                </td>
                <td className="p-1.5 border ">{product.name}</td>
                <td className="p-1.5 border text-center">
                  {dateSummary(new Date(product.date))}
                </td>
                <td className="p-1.5 border text-center">
                  {product.type.toLowerCase()}
                </td>
                <td className="p-1.5 border text-center">
                  {formatUnit(product.quantity)}
                </td>
                <td className="p-1.5 border">{product.note}</td>
                <td className="p-1.5 border text-center">{product.checked}</td>
                <td className="p-1.5 border text-">
                  <div className="flex justify-center gap-2.5">
                    <button>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={query.page}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onPrevPage={() => handleChangePage(query.page - 1)}
          onNextPage={() => handleChangePage(query.page + 1)}
          onPrevPrefetch={() => {
            prefetch([
              {
                queryKey: productKeys.stock({
                  ...query,
                  page: query.page - 1,
                }),
                queryFn: () =>
                  getStockMovement({ ...query, page: query.page - 1 }),
                staleTime: 1000 * 60 * 5,
              },
            ]);
          }}
          onNextPrefetch={() => {
            prefetch([
              {
                queryKey: productKeys.stock({
                  ...query,
                  page: query.page + 1,
                }),
                queryFn: () =>
                  getStockMovement({ ...query, page: query.page + 1 }),
                staleTime: 1000 * 60 * 5,
              },
            ]);
          }}
        />
      </div>
    </main>
  );
}
