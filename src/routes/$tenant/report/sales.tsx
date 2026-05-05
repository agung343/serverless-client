import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TransactionQuerySchema } from "~/schema/report.schema";
import {
  salesReportQueryOptions,
  reportKeys,
} from "~/queries/reportQueryOption";
import { getSalesReport } from "~/api/report";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import ReportTable from "~/routes/-components/tables/report-table";
import Pagination from "~/routes/-components/ui/pagination";

export const Route = createFileRoute("/$tenant/report/sales")({
  validateSearch: TransactionQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(salesReportQueryOptions(deps));
  },
  component: SalesReport,
});

function SalesReport() {
  const navigate = useNavigate({ from: "/$tenant/report/sales" });
  const query = useSearch({ from: "/$tenant/report/sales" });
  const { setSearch, setPage, setDateRange, setLimit } = useTableNavigation(
    Route.fullPath
  );
  const prefetch = usePrefetch();

  function setRange(range: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        range: range,
        page: 1,
        startDate: undefined,
        endDate: undefined,
      }),
    });
  }

  const { data } = useSuspenseQuery(salesReportQueryOptions(query));
  const sales = data.sales || [];
  const meta = data.meta;

  return (
    <main className="p-2.5 lg:p-4">
      <h1 className="text-2xl lg:text-4xl font-bold my-2.5 lg:my-5 text-green-500/70 italic">
        Sales Report
      </h1>
      <div className="flex items-center justify-between my-4">
        <SearchInput
          label="Product"
          onChange={(value) => setSearch("product", value)}
          defaultValue={query.product}
        />
        <div className="flex items-center gap-4">
          <DateRange
            onChange={(start, end) => setDateRange(start, end)}
            startValue={query.startDate}
            endValue={query.endDate}
          />
          <div className="flex items-center gap-2">
            <label>Range</label>
            <select
              name="range"
              id="range"
              onChange={(e) => setRange(e.target.value)}
              className="text-sm lg:text-base py-1.5 px-2.5 rounded-md border border-neutral-300/50"
            >
              <option value={""}>Choose range...</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <LimitSelect
          value={query.limit || 25}
          onChange={(limit) => setLimit(limit)}
        />
      </div>
      <div className="overflow-auto max-h-150 mt-4 lg:mt-6 p-2.5 md:p-4">
        <ReportTable sales={sales} mode="sales" />
      </div>
      <Pagination
        page={query.page}
        hasNextPage={meta.hasNextPage}
        hasPrevPage={meta.hasPrevPage}
        onNextPage={() => setPage(query.page + 1)}
        onPrevPage={() => setPage(query.page - 1)}
        onNextPrefetch={() => {
          prefetch([
            {
              queryKey: reportKeys.sales({ ...query, page: query.page + 1 }),
              queryFn: () => getSalesReport({ ...query, page: query.page + 1 }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: reportKeys.sales({ ...query, page: query.page - 1 }),
              queryFn: () => getSalesReport({ ...query, page: query.page - 1 }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />
    </main>
  );
}
