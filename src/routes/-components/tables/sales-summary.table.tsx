import { useNavigate } from "@tanstack/react-router";
import { getOrderDetails, type Sale } from "~/api/order";
import { orderKeys } from "~/queries/orderQueryOption";
import { usePrefetch } from "~/hooks/usePrefetch";
import { formatRupiah } from "~/lib/rupiah_currency";
import { dateTransaction } from "~/lib/date";

interface SaleTableProps {
  sales: Sale[];
  onDetail: (id: string) => void;
  onDelete: (id: string) => void;
  editable: boolean;
  tenant: string;
}

export default function SalesSummaryTable({
  sales,
  onDetail,
  onDelete,
  editable,
  tenant,
}: SaleTableProps) {
  const navigate = useNavigate()
  const prefetch = usePrefetch();

  return (
    <table className="border min-w-full border-blue-200 dark:text-stone-800">
      <thead className="bg-gray-300 dark:bg-blue-400 font-semibold lg:text-lg sticky top-0 z-10">
        <tr>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Invoice
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Date
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Total
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Payment
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-"></th>
        </tr>
      </thead>
      <tbody>
        {sales.map((item) => (
          <tr
            key={item.id}
            className="font-light text-sm lg:text-base odd:bg-gray-100 even:bg-gray-200"
          >
            <td className="p-2 border dark:border-stone-100 text-center">
              {item.invoiceNumber}
            </td>
            <td className="p-2 border dark:border-stone-100 text-center">
              {dateTransaction(new Date(item.date))}
            </td>
            <td className="p-2 border dark:border-stone-100 text-right">
              {formatRupiah(Number(item.totalAmount))}
            </td>
            <td className="p-2 border dark:border-stone-100 text-center">
              {item.paymentType}
            </td>
            <td className="p-2 border dark:border-stone-100">
              <div className="flex items-center justify-center gap-2.5 lg:gap-4">
                <button
                  onClick={() => onDetail(item.id)}
                  onMouseEnter={() =>
                    prefetch([
                      {
                        queryKey: orderKeys.detail(item.id),
                        queryFn: () => getOrderDetails(item.id),
                        staleTime: 1000 * 60 * 5,
                      },
                    ])
                  }
                  className="py-1.5 px-2.5 rounded-md bg-gray-300 border border-gray-300/50"
                >
                  Details
                </button>
                {editable && (
                  <button
                    onClick={() =>
                      navigate({
                        to: "/$tenant/cashier/edit/$orderId",
                        params: { tenant, orderId: item.id },
                      })
                    }
                    className="py-1.5 px-2.5 rounded-md bg-yellow-300 text-stone-800/50"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => onDelete(item.id)}
                  className="py-1.5 px-2.5 rounded-md bg-red-500/50 text-white"
                >
                  DELETE
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
