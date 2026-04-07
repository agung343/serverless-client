import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orderCashierTodayOptions, orderKeys } from "~/orderQueryOption";
import { OrderQuerySchema } from "~/schema/order.schema";
import { useDebounceCallback } from "~/hooks/debounce";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "../../-components/search-input";
import LimitSelect from "../../-components/limit-select";
import { dateTransaction } from "~/lib/date";
import { formatRupiah } from "~/lib/rupiah_currency";

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
  const { invoice, page, limit } = useSearch({
    from: "/$tenant/cashier/today",
  });
  const navigate = useNavigate({ from: "/$tenant/cashier/today" });
  const prefetch = usePrefetch();
  const { data } = useSuspenseQuery(
    orderCashierTodayOptions({ invoice, page, limit })
  );
  const sales = data.orders;
  const meta = data.meta;

  console.log(sales)

  const debounceInvoice = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({ ...prev, invoice: value || undefined, page: 1 }),
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

  if (sales.length === 0) {
    return (
        <main className="p-4 lg:p-8 min-h-screen">
            <div className="flex justify-center">
                <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50">
                    No sales recorded yet!.
                </h1>
            </div>
        </main>
    )
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-3">
        <h1 className="text-xl lg:text-2xl font-bold">Today Sales</h1>
      </div>
      <div className="flex items-center justify-between text-sm lg:text-base">
        <SearchInput label="Invoice" defaultValue={invoice} onChange={debounceInvoice} />
        <LimitSelect value={limit} onChange={handleChangeLimit} />
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <table className="border min-w-full border-blue-200">
            <thead className="bg-gray-300 dark:bg-blue-400 font-semibold lg:text-lg sticky top-0 z-10">
                <tr>
                    <th className="p-2 border dark:border-stone-100 font-semibold text-center">Invoice</th>
                    <th className="p-2 border dark:border-stone-100 font-semibold text-center">Date</th>
                    <th className="p-2 border dark:border-stone-100 font-semibold text-center">Total</th>
                    <th className="p-2 border dark:border-stone-100 font-semibold text-center">Payment</th>
                    <th className="p-2 border dark:border-stone-100 font-semibold text-"></th>
                </tr>
            </thead>
            <tbody>
                {sales.map(item => (
                    <tr key={item.id} className="font-light text-sm lg:text-base odd:bg-gray-100 even:bg-gray-200">
                        <td className="p-2 border dark:border-stone-100 text-center">{item.invoiceNumber}</td>
                        <td className="p-2 border dark:border-stone-100 text-center">{dateTransaction(new Date(item.date))}</td>
                        <td className="p-2 border dark:border-stone-100 text-right">{formatRupiah(Number(item.totalAmount))}</td>
                        <td className="p-2 border dark:border-stone-100 text-center">{item.paymentType}</td>
                        <td className="p-2 border dark:border-stone-100">
                            <div className="flex items-center justify-center gap-2.5 lg:gap-4">
                                <button className="py-1.5 px-2.5 rounded-md bg-gray-300 border border-gray-300/50">Details</button>
                                <button className="py-1.5 px-2.5 rounded-md bg-red-500/50 text-white">DELETE</button>
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
