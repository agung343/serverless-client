import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  purchasesArchieveOption,
  purchaseKeys,
} from "~/queries/purchaseQueryOptions";
import { getPurchaseArchieve } from "~/api/purchase";
import { PurchaseQuerySchema } from "~/schema/purchase.schema";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import Pagination from "~/routes/-components/ui/pagination";
import PurchaseSummaryTable from "~/routes/-components/tables/purchase-summary.table";
import Modal from "~/routes/-components/modals";
import PurchaseDetail from "~/routes/-components/purchase/purchase-detail";

export const Route = createFileRoute("/$tenant/transaction/purchases/archieve")(
  {
    validateSearch: PurchaseQuerySchema,
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
      return queryClient.ensureQueryData(purchasesArchieveOption(deps));
    },
    component: PurchasesArchieve,
  }
);

function PurchasesArchieve() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null
  );
  const { tenant } = Route.useParams();
  const query = useSearch({ from: "/$tenant/transaction/purchases/archieve" });
  const prefetch = usePrefetch();

  const { setSearch, setPage, setLimit, setDateRange } = useTableNavigation(
    Route.fullPath
  );

  const { data } = useSuspenseQuery(purchasesArchieveOption(query));
  const purchases = data.purchases || [];
  const meta = data.meta;

  function closeModal() {
    setIsOpen(false);
    setSelectedPurchaseId(null);
  }

  function openDetail(orderId: string) {
    setIsOpen(true);
    setSelectedPurchaseId(orderId);
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

  if (purchases.length === 0) {
    return (
      <main className="p-4 lg:p-8 min-h-screen">
        <div className="flex justify-center my-4">
          <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50">
            No Purchases Archieve!
          </h1>
        </div>
        {QueryInputs}
        <div className="my-4 flex">
          <Link
            to="/$tenant/transaction/purchases"
            params={{ tenant }}
            className="text-green-500 font-semibold py-2 px-4 border rounded-md border-green-500 bg-transparent cursor-pointer active:bg-green-500/50"
          >
            Back to Purchases
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-4">
        <h1 className="text-2xl: lg:text-4xl font-bold text-red-500/50 dark:text-stone-200">
          Purchases
        </h1>
      </div>
      {QueryInputs}
      <div className="my-4 flex justify-end">
        <Link
          to="/$tenant/transaction/purchases"
          params={{ tenant }}
          className="text-green-500 font-semibold py-2 px-4 border rounded-md border-green-500 bg-transparent cursor-pointer active:bg-green-500/50"
        >
          Back to Purchases
        </Link>
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <PurchaseSummaryTable
          purchases={purchases}
          onDetail={openDetail}
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
              queryKey: purchaseKeys.archieve({
                ...query,
                page: query.page + 1,
              }),
              queryFn: () =>
                getPurchaseArchieve({
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
              queryKey: purchaseKeys.archieve({
                ...query,
                page: query.page - 1,
              }),
              queryFn: () =>
                getPurchaseArchieve({
                  ...query,
                  page: query.page - 1,
                }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />

      {isOpen && selectedPurchaseId && (
        <Modal open={isOpen} onClose={closeModal}>
          <PurchaseDetail purchaseId={selectedPurchaseId!} />
        </Modal>
      )}
    </main>
  );
}
