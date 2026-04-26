import { useSuspenseQuery } from "@tanstack/react-query";
import { PurchaseDetailOption } from "~/queries/purchaseQueryOptions";
import { dateSummary } from "~/lib/date";
import { formatRupiah } from "~/lib/rupiah_currency";
import { formatUnit } from "~/lib/unit";

interface PurchaseDetailProps {
  purchaseId: string;
}

export default function PurchaseDetail({ purchaseId }: PurchaseDetailProps) {
  const { data } = useSuspenseQuery(PurchaseDetailOption(purchaseId));
  const purchase = data;
    console.log(purchase)
  return (
    <main className="p-2.5 lg:p-4 min-w-md">
      <div className="flex flex-col gap-2.5 lg:gap-4">
        <h2 className="text-xl lg:text-2xl font-semibold">
          {purchase.invoice}
        </h2>
        <div className="flex items-center justify-between">
          <p className="font-semibold lg:text-lg">
            {dateSummary(new Date(purchase.date))}
          </p>
          <p className="text-lg font-light">
            Supplier: <span className="font-semibold">{purchase.supplier}</span>
          </p>
        </div>
        <table className="border border-collapse">
          <thead>
            <tr className="bg-blue-300">
              <th className="p-1.5 lg:p-2 border w-64">Product</th>
              <th className="p-1.5 lg:p-2 border text-center w-16">Qty</th>
              <th className="p-1.5 lg:p-2 border text-center">Unit</th>
              <th className="p-1.5 lg:p-2 border text-center">Cost</th>
              <th className="p-1.5 lg:p-2 border text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items.map((item) => (
              <tr key={item.id} className="odd:bg-gray-200 even:bg-gray-300 text-sm lg:text-base">
                <td className="p-1.5 lg:-p-2 border ">{item.name}</td>
                <td className="p-1.5 lg:-p-2 border text-center">{formatUnit(item.quantity)}</td>
                <td className="p-1.5 lg:p-2 border text-center">{item.unit}</td>
                <td className="p-1.5 lg:-p-2 border text-right">{item.unitCost.split(",")[0]}</td>
                <td className="p-1.5 lg:-p-2 border text-right">{item.total.split(",")[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-1.5 lg:gap-2.5">
          <h2 className="text-lg lg:text-xl font-light">
            Paid:{" "}
            <span className="font-semibold">{formatRupiah(purchase.paid)}</span>
          </h2>
          <h2 className="text-lg lg:text-xl font-light">
            Total Amount:{" "}
            <span className="font-semibold">
              {formatRupiah(purchase.totalAmount)}
            </span>
          </h2>
        </div>
        <h2 className="text-lg lg:text-xl font-light">
          Status:
          <span className="font-semibold">{purchase.status}</span>
        </h2>
      </div>
    </main>
  );
}
