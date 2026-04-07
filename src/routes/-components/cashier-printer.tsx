import { forwardRef } from "react";
import { useParams } from "@tanstack/react-router";
import type { OrderDetailsReturn } from "~/api/order";
import { dateTransaction } from "~/lib/date";
import { formatUnit } from "~/lib/unit";
import { formatRupiah } from "~/lib/rupiah_currency";

interface Props {
  sale: OrderDetailsReturn;
}

const CashierPrinter = forwardRef<HTMLDivElement, Props>(({ sale }, ref) => {
  const { tenant } = useParams({ from: "/$tenant" });

  const change = Number(sale.paid) - Number(sale.totalAmount);
  return (
    <div
      ref={ref}
      className="receipt p-2 text-xs font-mono leading-snug text-black bg-white"
    >
      <div className="text-center mb-2">
        <h2 className="text-base font-bold tracking-widest uppercase">{tenant}</h2>

        <p className="font-extralight text-[11px] text-gray-500">
          {sale.invoice} :&bull; {dateTransaction(new Date(sale.date))}
        </p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
        <span className="w-2/5">Item</span>
        <span className="w-1/5 text-right">Qty</span>
        <span className="w-1/5 text-right">Price</span>
        <span className="w-1/5 text-right">Total</span>
      </div>
      {sale.items.map((item) => {
        const lineTotal = Number(item.quantity) * Number(item.unitPrice)
        return (
          <div key={item.productId} className="flex justify-between py-0.5">
            <span className="w-2/5 truncate">{item.name}</span>
            <span className="w-1/5 text-right">{item.quantity}</span>
            <span className="w-1/5 text-right">{Number(item.unitPrice)}</span>
            <span className="w-1/5 text-right">{lineTotal}</span>
          </div>
        )
      })}

      <div className="border-t border-dashed border-gray-400 my-2" />
      
      <div className="space-y-0.5">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatRupiah(Number(sale.totalAmount))}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-500">{sale.payment}</span>
          <span>{formatRupiah(Number(sale.paid))}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-gray-500">Change</span>
          <span>{formatRupiah(change)}</span>
        </div>
      </div>
      
      <div className="border-t border-dashed border-gray-400 my-2" />

      <p className="text-center text-[10px] text-gray-400 tracking-widest uppercase mt-4">Thank you</p>
    </div>
  );
});

CashierPrinter.displayName = "CashierPriter";

export default CashierPrinter;
