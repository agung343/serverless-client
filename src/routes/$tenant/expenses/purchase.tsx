import { useState, useMemo } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FindSupplierAndProductsOption } from "~/queries/purchaseQueryOptions";
import { CreatePurchaseQuerySchema } from "~/schema/purchase.schema";
import type { PurchaseItems } from "~/lib/purchase";
import { formatRupiah } from "~/lib/rupiah_currency";
import PurchaseList from "~/routes/-components/purchase/purchase-list";
import PurchaseProducts from "~/routes/-components/purchase/purchase-products";
import PurchasePayment from "~/routes/-components/purchase/purchase-payment";

export const Route = createFileRoute("/$tenant/expenses/purchase")({
  validateSearch: CreatePurchaseQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(FindSupplierAndProductsOption(deps));
  },
  component: ExpensePurchase,
});

const STORAGE_KEY = "purchase-order";

function ExpensePurchase() {
  const [items, setItems] = useState<PurchaseItems[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const { product, supplier } = useSearch({
    from: "/$tenant/expenses/purchase",
  });

  const { data } = useSuspenseQuery(
    FindSupplierAndProductsOption({ product, supplier })
  );

  const { products, suppliers } = data;
  const results = products || [];

  function handleAddClick(newItem: PurchaseItems) {
    setItems((prev) => {
      const updated = [...prev, newItem];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function handleDeleteItem(id: string) {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function clearItems() {
    setItems([]);
  }

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
  }, [items]);

  console.log(items);
  return (
    <>
      <main className="w-full p-4 lg:p-6 bg-zinc-100">
        <div className="grid grid-cols-[30%_37%_30%] gap-4 h-[80vh]">
          <div className="flex flex-col bg-blue-800/50 h-full rounded-md">
            <h1 className="text-xl lg:text-2xl font-bold p-4 bg-gray-200 dark:text-stone-800">
              Purchase Items:
            </h1>
            <PurchaseList items={items} onDeleteItem={handleDeleteItem} />
            <div className="p-4 bg-gray-200">
              <h2 className="text-xl font-bold text-right">
                Total: {formatRupiah(totalAmount)}
              </h2>
            </div>
          </div>
          <PurchaseProducts products={results} onAddItem={handleAddClick} />
          <PurchasePayment
            items={items}
            suppliers={suppliers}
            onSuccess={clearItems}
          />
        </div>
      </main>
    </>
  );
}
