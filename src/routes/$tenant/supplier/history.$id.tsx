import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  supplierHistoryQueryOption,
  supplierKeys,
} from "~/queries/supplierQueryOptions";
import { SupplierHistoryQuerySchema } from "~/schema/supplier.schema";
import { getSupplierHistory } from "~/api/supplier";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import Pagination from "~/routes/-components/ui/pagination";
import Modal from "~/routes/-components/modals";
import PurchaseDetail from "~/routes/-components/purchase/purchase-detail";
import PurchaseSummaryTable from "~/routes/-components/tables/purchase-summary.table";
import DeletePurchase from "~/routes/-components/modals/delete-purchase";
import { useState } from "react";

type ModalType = "detail" | "delete";

export const Route = createFileRoute("/$tenant/supplier/history/$id")({
  validateSearch: SupplierHistoryQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, params: { id }, deps }) => {
    return queryClient.ensureQueryData(supplierHistoryQueryOption(id, deps));
  },
  component: SupplierHistory,
});

function SupplierHistory() {
  const params = Route.useParams();
  const { tenant, id } = params;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null
  );
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const query = useSearch({ from: "/$tenant/supplier/history/$id" });
  const { setSearch, setPage, setLimit, setDateRange } = useTableNavigation(
    Route.fullPath
  );
  const prefetch = usePrefetch();

  const { data } = useSuspenseQuery(supplierHistoryQueryOption(id, query));
  const purchases = data.purchases || [];
  const meta = data.meta;

  function closeModal() {
    setIsOpen(false);
    setModalType(null);
    setSelectedPurchaseId(null);
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
      </main>
    );
  }
  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-4">
        <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50 dark:text-stone-200">
          Supplier Records
        </h1>
      </div>
      {QueryInputs}

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
              queryKey: supplierKeys.history(id, {
                ...query,
                page: query.page + 1,
              }),
              queryFn: () =>
                getSupplierHistory(id, { ...query, page: query.page + 1 }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: supplierKeys.history(id, {
                ...query,
                page: query.page - 1,
              }),
              queryFn: () =>
                getSupplierHistory(id, { ...query, page: query.page - 1 }),
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
