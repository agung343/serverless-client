import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getSalesArchieveOptions, orderKeys } from "~/queries/orderQueryOption";
import { getSalesArchieve } from "~/api/order";
import { OrderQuerySchema } from "~/schema/order.schema";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import Pagination from "~/routes/-components/ui/pagination";
import SalesSummaryTable from "~/routes/-components/tables/sales-summary.table";
import Modal from "~/routes/-components/modals";
import SaleDetail from "~/routes/-components/modals/sale-detail";

export const Route = createFileRoute("/$tenant/transaction/sales/archieve")({
  validateSearch: OrderQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(getSalesArchieveOptions(deps));
  },
  component: SalesArchieve,
});

function SalesArchieve() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const { tenant } = Route.useParams();
  const query = useSearch({ from: "/$tenant/transaction/sales/archieve" });
  const prefetch = usePrefetch();

  const { setSearch, setPage, setLimit, setDateRange } = useTableNavigation(
    Route.fullPath
  );

  const { data } = useSuspenseQuery(getSalesArchieveOptions(query));
  const sales = data.sales || [];
  const meta = data.meta;

  function closeModal() {
    setIsOpen(false);
    setSelectedSaleId(null);
  }

  function openDetail(orderId: string) {
    setIsOpen(true);
    setSelectedSaleId(orderId);
  }

  const QueryInputs = (
    <div className="flex items-center justify-between text-sm lg:text-base mb-4 md:mb-6">
      <SearchInput
        label="Invoice"
        defaultValue={query.invoice}
        onChange={(value) => setSearch("invoice", value)}
      />
      <DateRange
        startValue={query.startDate}
        endValue={query.endDate}
        onChange={(start, end) => setDateRange(start, end)}
      />
      <LimitSelect value={query.limit} onChange={(limit) => setLimit(limit)} />
    </div>
  );

  if (sales.length === 0) {
    return (
      <main className="p-4 lg:p-8 min-h-screen">
        <div className="flex justify-center my-4">
          <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50">
            No Sales Archieve!
          </h1>
        </div>
       {QueryInputs}
        <div className="my-4 flex">
          <Link
            to="/$tenant/transaction/sales/archieve"
            params={{ tenant }}
            className="text-blue-500 font-semibold py-2 px-4 border rounded-md border-blue-500 bg-transparent cursor-pointer active:bg-blue-500/50"
          >
            Back to Transaction
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-4">
        <h1 className="text-2xl: lg:text-4xl font-bold text-green-500/70 dark:text-green-200">
          Sales Archieve
        </h1>
      </div>
     {QueryInputs}
      <div className="my-4 flex justify-end">
        <Link
          to="/$tenant/transaction/sales"
          params={{ tenant }}
          className="text-green-500 font-semibold py-2 px-4 border rounded-md border-green-500 bg-transparent cursor-pointer active:bg-green-500/50"
        >
          Back Sales
        </Link>
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <SalesSummaryTable
          sales={sales}
          onDetail={openDetail}
          editable={false}
          tenant={tenant}
          isArchieve={true}
        />
      </div>
      <Pagination
        page={query.page}
        hasNextPage={meta.hasNextPage}
        onNextPage={() => setPage(query.page + 1)}
        hasPrevPage={meta.hasPrevPage}
        onPrevPage={() => setPage(query.page - 1)}
        onNextPrefetch={() => {
          prefetch([
            {
              queryKey: orderKeys.archieve({
                ...query,
                page: query.page + 1,
              }),
              queryFn: () =>
                getSalesArchieve({
                  ...query,
                  page: query.page + 1,
                }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: orderKeys.archieve({
                ...query,
                page: query.page - 1,
              }),
              queryFn: () =>
                getSalesArchieve({
                  ...query,
                  page: query.page - 1,
                }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />

      {isOpen && selectedSaleId && (
        <Modal open={isOpen} onClose={closeModal}>
          <SaleDetail orderId={selectedSaleId} />
        </Modal>
      )}
    </main>
  );
}
