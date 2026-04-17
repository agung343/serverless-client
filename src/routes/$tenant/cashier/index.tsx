import { useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { z } from "zod";
import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrderCashier } from "~/api/order";
import { formatRupiah } from "~/lib/rupiah_currency";
import { useDebounceCallback } from "~/hooks/debounce";
import { ProductCashierQuerySchema } from "~/schema/product.schema";
import { CreateOrderSchema } from "~/schema/order.schema";
import { productCashierQueryOptions } from "~/queries/productQueryOptions";
import { orderKeys } from "~/queries/orderQueryOption";
import CashierList from "~/routes/-components/cashier/cashier-list";
import CashierProducts from "~/routes/-components/cashier/cashier-products";
import CashierPayment, {
  type PaymentMethods,
} from "~/routes/-components/cashier/cashier-payment";
import Modal from "../../-components/modals";
import PaymentField from "~/routes/-components/modals/payment-field";
import CashierPrinter from "~/routes/-components/cashier/cashier-printer";
import type { OrderItems } from "~/lib/order";

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
  const [paymentType, setPaymentType] = useState<PaymentMethods>(null);
  const [paid, setPaid] = useState(0);
  const [printedOrder, setPrintedOrder] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { search } = useSearch({ from: "/$tenant/cashier/" });
  
  const navigate = useNavigate({from: "/$tenant/cashier/"})
  const debounceSearch = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({...prev, search: value || undefined})
    })
  },100)

  const { data } = useSuspenseQuery(productCashierQueryOptions({ search }));

  const results = data.products || [];

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
          <h1 className="text-xl lg:text-2xl font-bold p-4 bg-gray-200 dark:text-stone-800">
            Current Order:
          </h1>
          <CashierList
            items={items}
            onDeleteItem={(id: string) => {
              const newItems = items.filter((i) => i.productId !== id);
              setItems(newItems);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            }}
          />
          <div className="p-4 bg-gray-200">
            <h2 className="text-xl font-bold text-right dark:text-neutral-800">
              Total: {formatRupiah(totalAmount)}
            </h2>
          </div>
          <CashierPayment
            disabled={disabledButton}
            onSelect={(type) => {
              setIsOpen(true);
              setPaymentType(type);
            }}
          />
        </div>
        <CashierProducts
          products={results}
          searchQuery={search}
          onSearch={debounceSearch}
          selectedProduct={selectedProduct}
          onSelectProduct={(product) => {
            setSelectedProduct(product);
            setQty("1");
          }}
          quantity={qty}
          onQuantityChange={setQty}
          onAddProduct={handleAddClick}
        />
      </div>
      {isOpen && typeof paymentType === "string" && items.length > 0 && (
        <Modal open={isOpen} onClose={closeModal}>
          <PaymentField
            payment={paymentType}
            paid={paid}
            onPaidAmount={(val) => {
              const num = Number(val);
              if (!isNaN(num)) setPaid(num);
            }}
            totalAmount={totalAmount}
            changes={changes}
            fieldErrors={fieldErros}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isEdit={false}
          />
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
