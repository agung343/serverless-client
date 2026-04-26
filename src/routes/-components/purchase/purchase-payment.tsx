import { useState, useRef } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatRupiah } from "~/lib/rupiah_currency";
import { createPurchase } from "~/api/purchase";
import { CreatePurchaseSchema } from "~/schema/purchase.schema";
import { purchaseKeys } from "~/queries/purchaseQueryOptions";
import type { PurchaseItems } from "~/lib/purchase";

interface PaymentProps {
  items: PurchaseItems[];
  onSuccess: () => void;
  suppliers: {
    id: string;
    name: string;
  }[];
}

export default function PurchasePayment({
  items,
  onSuccess,
  suppliers,
}: PaymentProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [stocked, setStocked] = useState(false);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.cost,
    0
  );

  const paymentMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      formRef.current?.reset();
      setStocked(false);
      onSuccess();
    }
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = CreatePurchaseSchema.safeParse({
      invoiceNumber: formData.get("invoiceNumber"),
      date: formData.get("date"),
      notes: formData.get("notes"),
      supplierId: formData.get("supplier"),
      addToStock: formData.get("addToStock"),
      paid: formData.get("paid"),
      items: items.map(({ cost, id, ...rest }) => ({
        ...rest,
        unitCost: cost,
      })),
      totalAmount,
    });
    console.log(result)
    if (!result.success) {
      const flatten = z.flattenError(result.error);
      setFieldErrors(flatten.fieldErrors);
      console.log("validation error", flatten);
      return;
    }
    setFieldErrors({});
    const payload = result.data;
    paymentMutation.mutate(payload);
  }
  return (
    <div className="flex flex-col p-4">
      <h2 className="text-xl lg:text-2xl font-bold dark:text-stone-800 mb-2.5">
        Purchase Payment
      </h2>
      <form
        ref={formRef}
        className="flex flex-col gap-2.5 lg:gap-4 dark:text-stone-800"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="invoice"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Invoice Number{" "}
            {fieldErrors.invoiceNumber ? (
              <span className="font-light text-xs lg:text-sm text-red-500">
                {fieldErrors.invoiceNumber[0]}
              </span>
            ) : (
              <span className="font-light text-xs lg:text-sm text-red-500/50">
                *required
              </span>
            )}
          </label>
          <input
            type="text"
            name="invoiceNumber"
            className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="date"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Purchase Date{" "}
            {fieldErrors.date ? (
              <span className="font-light text-xs lg:text-sm text-red-500">
                {fieldErrors.date[0]}
              </span>
            ) : (
              <span className="font-light text-xs lg:text-sm text-red-500/50">
                *required
              </span>
            )}
          </label>
          <input
            type="date"
            name="date"
            className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="supplier"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Supplier{" "}
            {fieldErrors.supplier ? (
              <span className="font-light text-xs lg:text-sm text-red-500">
                {fieldErrors.supplier[0]}
              </span>
            ) : (
              <span className="font-light text-xs lg:text-sm text-red-500/50">
                *required
              </span>
            )}
          </label>
          <select
            name="supplier"
            className="text-sm lg:text-base py-1.5 px-2.5 rounded-md border border-neutral-300/50"
          >
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="addToStock"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Add to Stock
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`${
                !stocked ? "bg-red-500" : "bg-neutral-100"
              } py-1.5 px-2.5 rounded-xl text-sm font-semibold`}
              onClick={() => setStocked(false)}
            >
              No
            </button>
            <button
              type="button"
              className={`${
                stocked ? "bg-green-500" : "bg-neutral-100"
              } py-1.5 px-2.5 rounded-xl text-sm font-semibold`}
              onClick={() => setStocked(true)}
            >
              Yes
            </button>
          </div>
          <input type="hidden" name="addToStock" value={stocked.toString()} />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="notes"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Note
          </label>
          <input
            type="text"
            name="notes"
            className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="paid"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Paid{" "}
            {fieldErrors.paid ? (
              <span className="font-light text-xs lg:text-sm text-red-500">
                {fieldErrors.paid[0]}
              </span>
            ) : (
              <span className="font-light text-xs lg:text-sm text-red-500/50">
                *required
              </span>
            )}
          </label>
          <input
            type="text"
            name="paid"
            className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="total"
            className="text-sm lg:text-base font-semibold text-neutral-800/70"
          >
            Total
          </label>
          <input
            type="text"
            readOnly
            className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light"
            value={formatRupiah(totalAmount)}
          />
        </div>
        <div className="flex justify-center">
          <button
            disabled={paymentMutation.isPending}
            className="py-2 px-4 font-semibold rounded-md bg-green-600 disabled:bg-gray-500"
          >
            {paymentMutation.isPending ? "Saving..." : "Save Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}
