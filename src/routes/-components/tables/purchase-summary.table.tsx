import { useNavigate } from "@tanstack/react-router";
import { getPurchaseDetail, type Purchase } from "~/api/purchase";
import { purchaseKeys } from "~/queries/purchaseQueryOptions";
import { usePrefetch } from "~/hooks/usePrefetch";
import { formatRupiah } from "~/lib/rupiah_currency";
import { dateTransaction } from "~/lib/date";

interface PurchaseProps {
  purchases: Purchase[];
  onDetail: (id: string) => void;
  onArchieve?: (id: string) => void;
  tenant: string;
  isArchieve: boolean;
}

export default function PurchaseSummaryTable({
  purchases,
  onDetail,
  onArchieve,
  tenant,
  isArchieve,
}: PurchaseProps) {
  const navigate = useNavigate();
  const prefetch = usePrefetch();

  return (
    <table className="border min-w-full border-blue-200 dark:text-stone-800">
      <thead className="bg-gray-300 dark:bg-blue-400 font-semibold lg:text-xl sticky top-0 z-10">
        <tr>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Invoice
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Date
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Supplier
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Total
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Paid
          </th>
          <th className="p-2 border dark:border-stone-100 font-semibold text-center">
            Status
          </th>
          <th className="p-2 border dark:border-stone-100"></th>
        </tr>
      </thead>
      <tbody>
        {purchases.map((purchase) => (
          <tr
            key={purchase.id}
            className="font-light text-sm lg:text-base odd:bg-gray-100 even:bg-gray-200"
          >
            <td className="p-2 border dark:border-stone-100 text-center">
              {purchase.invoice}
            </td>
            <td className="p-2 border dark:border-stone-100 text-center">
              {dateTransaction(new Date(purchase.date))}
            </td>
            <td className="p-2 border dark:border-stone-100 text-center">
              {purchase.supplier}
            </td>
            <td className="p-2 border dark:border-stone-100 text-right">
              {formatRupiah(purchase.totalAmount)}
            </td>
            <td className="p-2 border dark:border-stone-100 text-right">
              {formatRupiah(purchase.paid)}
            </td>
            <td className="p-2 border dark:border-stone-100 text-center">
              {purchase.status}
            </td>
            <td className="p-2 border dark:border-stone-100">
              <div className="flex items-center justify-center gap-2.5 lg:gap-4">
                <button
                  onClick={() => onDetail(purchase.id)}
                  onMouseEnter={() => {
                    prefetch([
                      {
                        queryKey: purchaseKeys.detail(purchase.id),
                        queryFn: () => getPurchaseDetail(purchase.id),
                        staleTime: 1000 * 60 * 5,
                      },
                    ]);
                  }}
                  className="py-1.5 px-2.5 rounded-md bg-gray-300 border border-gray-300/50 hover:cursor-pointer active:bg-gray-400"
                >
                  Details
                </button>
                {!isArchieve && onArchieve && (
                  <button
                    onClick={() => onArchieve(purchase.id)}
                    className="py-1.5 px-2.5 rounded-md bg-red-500/50 hover:bg-red-500 active:bg-red-500 text-white"
                  >
                    DELETE
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
