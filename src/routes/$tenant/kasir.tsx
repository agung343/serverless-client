import { useState } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { formatRupiah } from "~/lib/rupiah_currency";
import { ProductCashierSchema } from "~/schema/product.schema";
import { productCashierQueryOptions } from "~/productQueryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

const STORAGE_KEY = "current_order";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export const Route = createFileRoute("/$tenant/kasir")({
  validateSearch: ProductCashierSchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
  }),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    return queryClient.ensureQueryData(productCashierQueryOptions({ search }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [items, setItems] = useState<OrderItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof results)[0] | null
  >(null);
  const [qty, setQty] = useState("1");

  const { search } = useSearch({ from: "/$tenant/kasir" });
  const navigate = useNavigate({ from: "/$tenant/kasir" });

  const { data } = useSuspenseQuery(productCashierQueryOptions({ search }));

  const results = data.products || [];

  const debounceSearch = (value: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined }),
    });
  };

  function handleAddClick() {
    if (!selectedProduct) return;

    const existingIndex = items.findIndex(
      (item) => item.id === selectedProduct.id
    );
    const newItems = [...items];

    if (existingIndex >= 0) {
      newItems[existingIndex].qty += Number(qty);
    } else {
      newItems.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        qty: Number(qty),
      });
    }

    setItems(newItems);
    setQty("1");
    setSelectedProduct(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  }

  return (
    <main className="w-full p-4 lg:p-6 bg-zinc-100">
      <div className="grid grid-cols-[35%_1fr] gap-4 h-[80vh]">
        <div className="flex flex-col gap-4 bg-blue-800/50 h-full rounded-md">
          <h1 className="text-xl lg:text-2xl font-bold p-4 bg-gray-200">
            Current Order:
          </h1>
          <div className="flex flex-col gap-2 p-4 rounded-md flex-1">
            {items.map((item) => (
              <div className="flex items-center justify-between" key={item.id}>
                <h2 className="text-sm lg:text-base font-semibold">
                  {item.qty}x {item.name}
                </h2>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm lg:text-base font-semibold">
                    {formatRupiah(item.price)}
                  </h2>
                  <button
                    onClick={() => {
                      const newItems = items.filter((i) => i.id !== item.id);
                      setItems(newItems);
                      localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(newItems)
                      );
                    }}
                    className="p-1 rounded-md bg-red-500/50 border border-white hover:cursor-pointer hover:bg-red-500 active:bg-red-500 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-200">
            <h2 className="text-xl font-bold text-right">
              Total:{" "}
              {formatRupiah(
                items.reduce((total, item) => total + item.qty * item.price, 0)
              )}
            </h2>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold rounded-md px-2">
            Payment Method
          </h2>
          <div className="grid grid-cols-2 gap-2 px-2 pb-2">
            <button className="w-full py-2 px-4 rounded-md bg-green-500 text-white font-semibold">
              Cash
            </button>
            <button className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-semibold">
              QRIS
            </button>
            <button className="w-full py-2 px-4 rounded-md bg-gray-500 text-white font-semibold">
              Debit / Credit Card
            </button>
            <button className="w-full py-2 px-4 rounded-md bg-purple-500 text-white font-semibold">
              E-Wallet
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-sky-800/50 h-full p-4">
          <h2 className="text-xl lg:text-2xl font-bold">Product Catalog</h2>
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onChange={(e) => debounceSearch(e.target.value)}
            className="w-full p-2 rounded-md mb-4 bg-stone-300/50 border border-gray-500"
          />
          <div className="flex items-center justify-between text-sm lg:text-base">
            <div className="flex items-center gap-2 w-4/5">
              <p className="font-semibold w-3/4 truncate">
                {selectedProduct ? (
                  <span>{selectedProduct.name}</span>
                ) : (
                  <span className="text-stone-800/50">
                    "Please select a product."
                  </span>
                )}
              </p>
              <input
                type="text"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-16 py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800 text-stone-800"
              />
            </div>
            <button
              onClick={() => handleAddClick()}
              className="py-1 px-3 rounded-md bg-green-500/50 border border-white hover:cursor-pointer hover:bg-green-500 active:bg-green-500 text-white font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col overflow-auto h-120">
            {results.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">
                No products found.
              </p>
            ) : (
              results.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 bg-gray-300 mb-2 rounded-md cursor-pointer hover:bg-gray-400"
                  onClick={() => {
                    setSelectedProduct(product);
                    setQty("1");
                  }}
                >
                  <h3 className="font-semibold">{product.name}</h3>
                  <h3 className="font-semibold">
                    {formatRupiah(product.price)}
                  </h3>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
