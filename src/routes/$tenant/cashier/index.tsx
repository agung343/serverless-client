import { useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { z } from "zod";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { formatRupiah } from "~/lib/rupiah_currency";
import { ProductCashierQuerySchema } from "~/schema/product.schema";
import { CreateOrderSchema } from "~/schema/order.schema";
import { productCashierQueryOptions } from "~/productQueryOptions";
import { orderKeys } from "~/orderQueryOption";
import {
  useSuspenseQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrderCashier } from "~/api/order";
import { X } from "lucide-react";
import Modal from "../../-components/modals";
import CashierPrinter from "../../-components/cashier-printer";

export type OrderItems = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type Payment = "cash" | "qris" | "card" | "e-money" | null;

const STORAGE_KEY = "current_order";

export const Route = createFileRoute("/$tenant/cashier/")({
  validateSearch: ProductCashierQuerySchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
  }),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    return queryClient.ensureQueryData(productCashierQueryOptions({ search }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<OrderItems[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof results)[0] | null
  >(null);
  const [fieldErros, setFieldErrors] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState("1");
  const [paymentType, setPaymentType] = useState<Payment>(null);
  const [paid, setPaid] = useState(0);
  const [printedOrder, setPrintedOrder] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { search } = useSearch({ from: "/$tenant/cashier/" });
  const navigate = useNavigate({ from: "/$tenant/cashier/" });

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
      (item) => item.productId === selectedProduct.id
    );
    const newItems = [...items];

    if (existingIndex >= 0) {
      newItems[existingIndex].quantity += Number(qty);
    } else {
      newItems.push({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        unitPrice: selectedProduct.price,
        quantity: Number(qty),
      });
    }

    setItems(newItems);
    setQty("1");
    setSelectedProduct(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  }

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  const changes = paid - totalAmount;

  function closeModal() {
    setIsOpen(false);
    setPaymentType(null);
    setPaid(0);
  }

  function clear() {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
    setPaid(0);
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      clear();
      setPrintedOrder(null);
    },
  });

  const mutation = useMutation({
    mutationFn: createOrderCashier,
    onSuccess: (data) => {
      setPrintedOrder(data.sale);
      setTimeout(() => {
        handlePrint?.();
      }, 300);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      closeModal();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = CreateOrderSchema.safeParse({
      paid: totalAmount,
      notes: formData.get("notes") || undefined,
      paymentType: paymentType,
      cardLastFour: formData.get("card-digits") || undefined,
      cardReference: formData.get("card-reference") || undefined,
      emoneyPlatform: formData.get("platform") || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    if (!result.success) {
      const flatten = z.flattenError(result.error);
      setFieldErrors(flatten.fieldErrors);
      return;
    }

    setFieldErrors({});
    const payload = result.data;
    console.log(payload);
    mutation.mutate(payload);
  }

  const disabledButton = items.length === 0;

  return (
    <main className="w-full p-4 lg:p-6 bg-zinc-100">
      <div className="grid grid-cols-[35%_1fr] gap-4 h-[80vh]">
        <div className="flex flex-col gap-4 bg-blue-800/50 h-full rounded-md">
          <h1 className="text-xl lg:text-2xl font-bold p-4 bg-gray-200">
            Current Order:
          </h1>
          <div className="flex flex-col gap-2 p-4 rounded-md flex-1">
            {items.map((item) => (
              <div
                className="flex items-center justify-between"
                key={item.productId}
              >
                <h2 className="text-sm lg:text-base font-semibold">
                  {item.quantity}x {item.name}
                </h2>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm lg:text-base font-semibold">
                    {formatRupiah(item.unitPrice)}
                  </h2>
                  <button
                    onClick={() => {
                      const newItems = items.filter(
                        (i) => i.productId !== item.productId
                      );
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
              Total: {formatRupiah(totalAmount)}
            </h2>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold rounded-md px-2">
            Payment Method
          </h2>
          <div className="grid grid-cols-2 gap-2 px-2 pb-2">
            <button
              onClick={() => {
                setIsOpen(true);
                setPaymentType("cash");
              }}
              disabled={disabledButton}
              className="w-full py-2 px-4 rounded-md bg-green-500 text-white font-semibold"
            >
              Cash
            </button>
            <button
              onClick={() => {
                setIsOpen(true);
                setPaymentType("qris");
              }}
              disabled={disabledButton}
              className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-semibold"
            >
              QRIS
            </button>
            <button
              onClick={() => {
                setIsOpen(true);
                setPaymentType("card");
              }}
              disabled={disabledButton}
              className="w-full py-2 px-4 rounded-md bg-gray-500 text-white font-semibold"
            >
              Debit / Credit Card
            </button>
            <button
              onClick={() => {
                setIsOpen(true);
                setPaymentType("e-money");
              }}
              disabled={disabledButton}
              className="w-full py-2 px-4 rounded-md bg-purple-500 text-white font-semibold"
            >
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
      {isOpen && typeof paymentType === "string" && items.length > 0 && (
        <Modal open={isOpen} onClose={closeModal}>
          <main className="md:min-w-md">
            <h2 className="text-xl lg:text-2xl font-bold text-center mb-2.5">
              {paymentType.toUpperCase()} Payment
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex items-center justify-between ">
                <label htmlFor="paid" className="w-3/10">
                  Paid Amount
                </label>
                <input
                  type="text"
                  name="paid"
                  value={paymentType === "cash" ? paid : totalAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setPaid(0);
                      return;
                    }

                    const num = Number(value);
                    if (!isNaN(num)) {
                      setPaid(num);
                    }
                  }}
                  disabled={paymentType !== "cash"}
                  className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300 font-semibold text-lg: lg:text-xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="paid" className="w-3/10">
                  Total Amount
                </label>
                <input
                  type="text"
                  name="totalAmount"
                  defaultValue={formatRupiah(totalAmount)}
                  disabled
                  className="w-3/4 py-1.5 px-2.5 rounded-md bg-transparent font-semibold text-lg: lg:text-xl"
                />
              </div>
              {paymentType === "cash" && (
                <div className="flex items-center justify-between">
                  <label htmlFor="paid" className="w-3/10">
                    Changes
                  </label>
                  <input
                    type="text"
                    name="changes"
                    value={formatRupiah(Math.max(changes, 0))}
                    disabled
                    className="w-3/4 py-1.5 px-2.5 rounded-md bg-transparent font-semibold text-lg: lg:text-xl"
                  />
                </div>
              )}

              {paymentType === "card" && (
                <>
                  <div className="flex items-center justify-between">
                    <label htmlFor="digits" className="w-3/10">
                      Last 4 digits{" "}
                      {fieldErros.cardLastFour && (
                        <span className="text-sm font-light text-red-500/50">
                          {fieldErros.cardLastFour}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="card-digits"
                      placeholder="XXXX"
                      className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300/50 placeholder:italic"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="approval" className="w-3/10">
                      Reference No{" "}
                      {fieldErros.cardReference && (
                        <span className="text-sm font-light text-red-500/50">
                          {fieldErros.cardReference}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="card-reference"
                      placeholder="APV-XXXX"
                      className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300/50 placeholder:italic"
                    />
                  </div>
                </>
              )}
              {paymentType === "e-money" && (
                <div className="flex items-center justify-between">
                  <label htmlFor="platform" className="w-3/10">
                    Select Platform
                  </label>
                  <select
                    name="platform"
                    className="w-3/4 py-1.5 px-2.5 rounded-md border border-stone-300/50"
                  >
                    <option value={"Flazz"}>Flazz BCA</option>
                    <option value={"E-Money Mandiri"}>E-Money Mandiri</option>
                    <option value={"Brizzi"}>Brizzi BRI</option>
                    <option value={"Tapcash"}>Tapcash BNI</option>
                  </select>
                </div>
              )}
              <div className="flex justify-center items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2 px-4 rounded-2xl border border-stone-800/50 bg-transparent text-lg lg:text-xl font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-green-500/70 py-2 px-4 rounded-2xl text-lg lg:text-xl hover:cursor-pointer active:bg-green-500"
                >
                  Print order
                </button>
              </div>
            </form>
          </main>
        </Modal>
      )}

      {printedOrder && (
        <div className="hidden">
          <CashierPrinter ref={printRef} sale={printedOrder} />
        </div>
      )}
    </main>
  );
}
