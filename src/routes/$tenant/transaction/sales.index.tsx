import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getAllSalesOptions, orderKeys } from "~/queries/orderQueryOption";
import { OrderQuerySchema } from "~/schema/order.schema";
import { getAllSales } from "~/api/order";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import DateRange from "~/routes/-components/ui/date-range";
import LimitSelect from "~/routes/-components/ui/limit-select";
import Pagination from "~/routes/-components/ui/pagination";
import Modal from "~/routes/-components/modals";
import SaleDetail from "~/routes/-components/modals/sale-detail";
import DeleteSale from "~/routes/-components/modals/delete-sale";
import SalesSummaryTable from "~/routes/-components/tables/sales-summary.table";

type ModalType = "detail" | "edit" | "delete";

export const Route = createFileRoute("/$tenant/transaction/sales/")({
  validateSearch: OrderQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(getAllSalesOptions(deps));
  },
  component: SalesPage,
});

function SalesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const { tenant } = Route.useParams();
  const { invoice, page, limit, startDate, endDate } = useSearch({
    from: "/$tenant/transaction/sales/",
  });
  const prefetch = usePrefetch();

  const { data } = useSuspenseQuery(
    getAllSalesOptions({ invoice, page, limit, startDate, endDate })
  );

  const { sales, meta } = data;

  const { setSearch, setPage, setLimit, setDateRange } = useTableNavigation(
    Route.fullPath
  );

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

  if (sales.length === 0) {
    return (
      <main className="p-4 lg:p-8 min-h-screen">
        <div className="flex justify-center my-4">
          <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50">
            No sales recorded yet!.
          </h1>
        </div>
        <div className="flex items-center justify-between text-sm lg:text-base mb-4 md:mb-6">
          <SearchInput
            label="Invoice"
            defaultValue={invoice}
            onChange={(value) => setSearch("invoice", value)}
          />
          <DateRange
            startValue={startDate}
            endValue={endDate}
            onChange={(start, end) => setDateRange(start, end)}
          />
          <LimitSelect value={limit} onChange={(limit) => setLimit(limit)} />
        </div>
        <div className="my-4 flex justify-end">
          <Link
            to="/$tenant/transaction/sales/archieve"
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
        <h1 className="text-2xl: lg:text-4xl font-bold text-red-500/50 dark:text-stone-200">
          Sales
        </h1>
      </div>
      <div className="flex items-center justify-between text-sm lg:text-base mb-4 md:mb-6">
        <SearchInput
          label="Invoice"
          defaultValue={invoice}
          onChange={(value) => setSearch("invoice", value)}
        />
        <DateRange
          startValue={startDate}
          endValue={endDate}
          onChange={(start, end) => setDateRange(start, end)}
        />
        <LimitSelect value={limit} onChange={(limit) => setLimit(limit)} />
      </div>
      <div className="my-4 flex justify-end">
        <Link
          to="/$tenant/transaction/sales/archieve"
          params={{ tenant }}
          className="text-red-500 font-semibold py-2 px-4 border rounded-md border-red-500 bg-transparent cursor-pointer active:bg-red-500/50"
        >
          Achieve
        </Link>
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <SalesSummaryTable
          sales={sales}
          onDetail={openDetail}
          onDelete={openDelete}
          editable={false}
          tenant={tenant}
        />
      </div>
      <Pagination
        page={page}
        hasNextPage={meta.hasNextPage}
        onNextPage={() => setPage(page + 1)}
        hasPrevPage={meta.hasPrevPage}
        onPrevPage={() => setPage(page - 1)}
        onNextPrefetch={() => {
          prefetch([
            {
              queryKey: orderKeys.sales({
                invoice,
                page: page + 1,
                limit,
                startDate,
                endDate,
              }),
              queryFn: () =>
                getAllSales({
                  invoice,
                  page: page + 1,
                  limit,
                  startDate,
                  endDate,
                }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: orderKeys.sales({
                invoice,
                page: page - 1,
                limit,
                startDate,
                endDate,
              }),
              queryFn: () =>
                getAllSales({
                  invoice,
                  page: page - 1,
                  limit,
                  startDate,
                  endDate,
                }),
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
          <DeleteSale orderId={selectedOrderId} onSuccess={closeModal} />
        </Modal>
      )}
    </main>
  );
}
