import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { stockQueryOptions } from "~/productQueryOptions";
import { StockQuerySchema } from "~/schema/stock.schema";
import { useDebounceCallback } from "~/hooks/debounce";
import { formatUnit } from "~/lib/unit";
import { dateSummary } from "~/lib/date";

export const Route = createFileRoute("/$tenant/inventory/stock")({
  validateSearch: StockQuerySchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
    page: search.page,
    limit: search.limit,
    startDate: search.startDate,
    endDate: search.endDate,
  }),
  loader: async ({
    context: { queryClient },
    deps: { search, page, limit, startDate, endDate },
  }) => {
    return queryClient.ensureQueryData(
      stockQueryOptions({ search, page, limit, startDate, endDate })
    );
  },
  component: StockPage,
});

function StockPage() {
  const { search, page, limit, startDate, endDate } = useSearch({
    from: "/$tenant/inventory/stock",
  });
  const navigate = useNavigate({ from: "/$tenant/inventory/stock" });

  const { data } = useSuspenseQuery(
    stockQueryOptions({ search, page, limit, startDate, endDate })
  );
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
      <div className="flex items-center justify-between text-sm lg:text-base">
        <div className="flex items-center gap-2">
          <label>Search:</label>
          <input
            type="text"
            className="py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800 text-stone-800"
            defaultValue={search}
            onChange={(e) => debounceSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dateRange" className="font-medium">
            Date Range:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleChangeDateRange(e.target.value, endDate)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleChangeDateRange(startDate, e.target.value)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Rows:</label>
          <select
            value={limit}
            onChange={(e) => handleChangeLimit(+e.target.value)}
            className="py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
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
                    <tr key={product.id} className="font-light text-sm lg:text-base odd:bg-gray-100/50 even:bg-gray-200/50">
                        <td className="p-1.5 border text-center">{i + 1 + (page -1 ) * limit}</td>
                        <td className="p-1.5 border ">{product.name}</td>
                        <td className="p-1.5 border text-center">{dateSummary(new Date(product.date))}</td>
                        <td className="p-1.5 border text-center">{product.type.toLowerCase()}</td>
                        <td className="p-1.5 border text-center">{formatUnit(product.quantity)}</td>
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
      </div>
    </main>
  );
}
