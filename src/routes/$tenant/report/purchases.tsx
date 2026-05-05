import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  purchasesReportQueryOptions,
  reportKeys,
} from "~/queries/reportQueryOption";
import { TransactionQuerySchema } from "~/schema/report.schema";
import { getPurchasesReport } from "~/api/report";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import ReportTable from "~/routes/-components/tables/report-table";
import Pagination from "~/routes/-components/ui/pagination";

export const Route = createFileRoute("/$tenant/report/purchases")({
  validateSearch: TransactionQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(purchasesReportQueryOptions(deps));
  },
  component: PurchasesReport,
});

function PurchasesReport() {
  const navigate = useNavigate({ from: "/$tenant/report/purchases" });
  const query = useSearch({ from: "/$tenant/report/purchases" });
  const { setSearch, setPage, setDateRange, setLimit } = useTableNavigation(
    Route.fullPath
  );
  const prefetch = usePrefetch();

  function setRange(range: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        range,
        page: 1,
        startDate: undefined,
        endDate: undefined,
      }),
    });
  }

  const { data } = useSuspenseQuery(purchasesReportQueryOptions(query));
  const purchases = data.purchases || [];
  const meta = data.meta;

  return (
    <main className="p-2.5 lg:p-4">
      <h1 className="text-2xl lg:text-4xl font-bold my-2.5 lg:my-5 text-red-500/70 italic">
        Purchases Report
      </h1>
      <div className="flex items-center justify-between my-4">
        <SearchInput
          label="Product"
          onChange={(value) => setSearch("product", value)}
          defaultValue={query.product}
        />
        <div className="flex items-center justify-between gap-4">
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
      <div className="overflow-auto max-h-150 mt-4 lg:mt-6">
        <ReportTable purchases={purchases} mode="purchases" />
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
              queryKey: reportKeys.purchases({
                ...query,
                page: query.page + 1,
              }),
              queryFn: () =>
                getPurchasesReport({ ...query, page: query.page + 1 }),
              staleTime: 1000 * 60 * 5,
            },  
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: reportKeys.purchases({
                ...query,
                page: query.page - 1,
              }),
              queryFn: () =>
                getPurchasesReport({ ...query, page: query.page - 1 }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />
    </main>
  );
}
