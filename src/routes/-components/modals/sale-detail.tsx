import { useSuspenseQuery } from "@tanstack/react-query";
import { orderDetailOptions } from "~/queries/orderQueryOption";
import { dateTransaction } from "~/lib/date";
import { formatUnit } from "~/lib/unit";
import { formatRupiah } from "~/lib/rupiah_currency";

interface SaleDetailProps {
  orderId: string;
}

export default function SaleDetail({ orderId }: SaleDetailProps) {
  const { data } = useSuspenseQuery(orderDetailOptions(orderId));
    console.log(data)
  const sale = data.order;

  const change = Number(sale.paid) - Number(sale.totalAmount);
  return (
    <main className="p-2.5 lg:p-4 min-w-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-semibold">{sale.invoice}</h2>
        <p className="lg:text-lg">{dateTransaction(new Date(sale.date))}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => {
            const total = Number(item.quantity) * Number(item.unitPrice);
            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{formatUnit(item.quantity)}</td>
                <td>{item.unitPrice.split(",")[0]}</td>
                <td>{formatRupiah(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="font-light">
        Payment: <span className="font-semibold">{sale.paymentType}</span>
      </p>
      <div className="grid grid-cols-2 items-center gap-4">
        <h2 className="font-light text-lg">Paid: </h2>
        <h2 className="font-semibold">{formatRupiah(Number(sale.paid))}</h2>

        <h2 className="font-light text-lg">Total Amount: </h2>
        <h2 className="font-semibold">
          {formatRupiah(Number(sale.totalAmount))}
        </h2>

        {sale.paymentType === "cash" && (
          <>
            <h2 className="font-light text-lg">Changes: </h2>
            <h2 className="font-semibold">{formatRupiah(change)}</h2>
          </>
        )}
      </div>
    </main>
  );
}
