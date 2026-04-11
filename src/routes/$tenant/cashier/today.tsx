import { useState } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orderCashierTodayOptions, orderKeys } from "~/orderQueryOption";
import { OrderQuerySchema } from "~/schema/order.schema";
import { getOrdersTodays } from "~/api/order";
import { useDebounceCallback } from "~/hooks/debounce";
import { usePrefetch } from "~/hooks/usePrefetch";

import SearchInput from "../../-components/search-input";
import LimitSelect from "../../-components/limit-select";
import Modal from "~/routes/-components/modals";
import SalesSummaryTable from "~/routes/-components/tables/sales-summary.table";
import SaleDetail from "~/routes/-components/modals/sale-detail";
import Pagination from "~/routes/-components/pagination";

type ModalType = "detail" | "edit" | "delete";

export const Route = createFileRoute("/$tenant/cashier/today")({
  validateSearch: OrderQuerySchema,
  loaderDeps: ({ search }) => ({
    invoice: search.invoice,
    page: search.page,
    limit: search.limit,
  }),
  loader: async ({
    context: { queryClient },
    deps: { invoice, page, limit },
  }) => {
    return queryClient.ensureQueryData(
      orderCashierTodayOptions({ invoice, page, limit })
    );
  },
  component: CashierToday,
});

function CashierToday() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const { tenant } = Route.useParams();
  const { invoice, page, limit } = useSearch({
    from: "/$tenant/cashier/today",
  });
  const navigate = useNavigate();
  const prefetch = usePrefetch();
  const { data } = useSuspenseQuery(
    orderCashierTodayOptions({ invoice, page, limit })
  );
  const sales = data.orders;
  const meta = data.meta;

  function closeModal() {
    setIsOpen(false);
    setModalType(null);
    setSelectedOrderId(null);
  }

  function openDetail(orderId: string) {
    setIsOpen(true);
    setModalType("detail");
    setSelectedOrderId(orderId);
  }

  function openDelete(orderId: string) {
    setIsOpen(true);
    setModalType("delete");
    setSelectedOrderId(orderId);
  }

  const debounceInvoice = useDebounceCallback((value: string) => {
    navigate({
      from: "/$tenant/cashier/today",
      search: (prev) => ({ ...prev, invoice: value || undefined, page: 1 }),
    });
  });

  function handleChangePage(newPage: number) {
    navigate({
      from: "/$tenant/cashier/today",
      search: (prev) => ({ ...prev, page: newPage }),
    });
  }

  function handleChangeLimit(newLimit: number) {
    navigate({
      from: "/$tenant/cashier/today",
      search: (prev) => ({ ...prev, limit: newLimit, page: 1 }),
    });
  }

  if (sales.length === 0) {
    return (
      <main className="p-4 lg:p-8 min-h-screen">
        <div className="flex justify-center">
          <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50">
            No sales recorded yet!.
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-3">
        <h1 className="text-xl lg:text-2xl font-bold">Today Sales</h1>
      </div>
      <div className="flex items-center justify-between text-sm lg:text-base">
        <SearchInput
          label="Invoice"
          defaultValue={invoice}
          onChange={debounceInvoice}
        />
        <LimitSelect value={limit} onChange={handleChangeLimit} />
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <SalesSummaryTable
          sales={sales}
          onDetail={openDetail}
          onDelete={openDelete}
          editable={true}
          tenant={tenant}
        />
      </div>
      <Pagination
        page={page}
        hasNextPage={meta.hasNextPage}
        onNextPage={() => handleChangePage(page + 1)}
        hasPrevPage={meta.hasPrevPage}
        onPrevPage={() => handleChangePage(page - 1)}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: orderKeys.cashier({ invoice, page: page - 1, limit }),
              queryFn: () =>
                getOrdersTodays({ invoice, page: page - 1, limit }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onNextPrefetch={() => {
          prefetch([
            {
              queryKey: orderKeys.cashier({ invoice, page: page + 1, limit }),
              queryFn: () =>
                getOrdersTodays({ invoice, page: page + 1, limit }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />

      {isOpen && modalType === "detail" && selectedOrderId && (
        <Modal open={isOpen} onClose={closeModal}>
          <SaleDetail orderId={selectedOrderId} />
        </Modal>
      )}

      {isOpen && modalType === "delete" && selectedOrderId && (
        <Modal open={isOpen} onClose={closeModal}>
          <h1 className="text-xl lg:text-2xl text-center">Delete: </h1>
        </Modal>
      )}
    </main>
  );
}
