import { useState } from "react";
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  purchaseKeys,
  PurchaseQueryOption,
} from "~/queries/purchaseQueryOptions";
import { PurchaseQuerySchema } from "~/schema/purchase.schema";
import { getAllPurchases } from "~/api/purchase";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import { formatRupiah } from "~/lib/rupiah_currency";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import Pagination from "~/routes/-components/ui/pagination";
import Modal from "~/routes/-components/modals";
import PurchaseDetail from "~/routes/-components/purchase/purchase-detail";
import PurchaseSummaryTable from "~/routes/-components/tables/purchase-summary.table";
import DeletePurchase from "~/routes/-components/modals/delete-purchase";

type ModalType = "detail" | "delete";

export const Route = createFileRoute("/$tenant/transaction/purchases/")({
  validateSearch: PurchaseQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(PurchaseQueryOption(deps));
  },
  component: PurchasesPage,
});

function PurchasesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null
  );
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const { tenant } = Route.useParams();
  const query = useSearch({ from: "/$tenant/transaction/purchases/" });
  const prefetch = usePrefetch();

  const { data } = useSuspenseQuery(PurchaseQueryOption(query));
  const purchases = data.purchases || [];
  const netPurchases = purchases.reduce(
    (sum, item) => sum + Number(item.totalAmount),
    0
  );

  const meta = data.meta;

  const { setSearch, setPage, setLimit, setDateRange } = useTableNavigation(
    Route.fullPath
  );
  function closeModal() {
    setIsOpen(false);
    setSelectedPurchaseId(null);
    setModalType(null);
  }

  function openDetail(purchaseId: string) {
    setIsOpen(true);
    setModalType("detail");
    setSelectedPurchaseId(purchaseId);
  }

  function openDelete(purchaseId: string) {
    setIsOpen(true);
    setModalType("delete");
    setSelectedPurchaseId(purchaseId);
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
            No Purchase recorded yet!.
          </h1>
        </div>
        {QueryInputs}
        <div className="my-4 flex justify-end">
          <Link
            to="/$tenant/transaction/purchases/archieve"
            params={{ tenant }}
            className="text-red-500 font-semibold py-2 px-4 border rounded-md border-red-500 bg-transparent cursor-pointer active:bg-red-500/50"
          >
            Achieve
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-4">
        <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50 dark:text-stone-200">
          Purchase
        </h1>
      </div>
      {QueryInputs}
      <div className="my-4 flex items-center justify-between">
        <h2 className="text-lg lg:text-2xl text-red-500/70">
          Net Cost:{" "}
          <span className="font-semibold">{formatRupiah(netPurchases)}</span>
        </h2>

        <Link
          to="/$tenant/transaction/sales/archieve"
          params={{ tenant }}
          className="text-red-500 font-semibold py-2 px-4 border rounded-md border-red-500 bg-transparent cursor-pointer active:bg-red-500/50"
        >
          Achieve
        </Link>
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <PurchaseSummaryTable
          purchases={purchases}
          onDetail={openDetail}
          onArchieve={openDelete}
          tenant={tenant}
          isArchieve={false}
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
              queryKey: purchaseKeys.list({ ...query, page: query.page + 1 }),
              queryFn: () =>
                getAllPurchases({ ...query, page: query.page + 1 }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: purchaseKeys.list({ ...query, page: query.page - 1 }),
              queryFn: () =>
                getAllPurchases({ ...query, page: query.page - 1 }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />

      {isOpen && selectedPurchaseId && modalType === "detail" && (
        <Modal open={isOpen} onClose={closeModal}>
          <PurchaseDetail purchaseId={selectedPurchaseId} />
        </Modal>
      )}

      {isOpen && selectedPurchaseId && modalType === "delete" && (
        <Modal open={isOpen} onClose={closeModal}>
          <DeletePurchase
            purchaseId={selectedPurchaseId}
            onSuccess={closeModal}
          />
        </Modal>
      )}
    </main>
  );
}
