import { formatRupiah } from "~/lib/rupiah_currency";
import { X } from "lucide-react";
import { PurchaseItems } from "~/lib/purchase";

interface ListProps {
  items: PurchaseItems[];
  onDeleteItem: (id: string) => void;
}

export default function PurchaseList({ items, onDeleteItem }: ListProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-md flex-1">
      {items.map((item) => (
        <div className="flex items-center justify-between" key={item.id}>
          <h2 className="text-sm lg:text-base font-semibold">
            {item.quantity}x {item.name}
          </h2>
          <div className="flex items-center gap-2">
            <h2 className="text-sm lg:text-base font-semibold">
              {formatRupiah(item.cost)}
            </h2>
            <button
              onClick={() => onDeleteItem(item.id)}
              className="p-1 rounded-md bg-red-500/70 border border-white hover:cursor-pointer hover:bg-red-500 active:bg-red-500 text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
