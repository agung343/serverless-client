import { useState } from "react";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import { adjustStock } from "~/api/stock";
import { productKeys } from "~/queries/productQueryOptions";
import { productDetailsQueryOptions } from "~/queries/productQueryOptions";
import {
  AdjustStockSchema,
  type AdjustStockPayload,
} from "~/schema/stock.schema";

interface Props {
  productId: string;
  onSuccess: () => void;
}

export default function AdjustForm({ productId, onSuccess }: Props) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery(productDetailsQueryOptions(productId));
  const product = data;

  const mutation = useMutation({
    mutationFn: (payload: AdjustStockPayload) =>
      adjustStock(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: productKeys.all});
      onSuccess();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = AdjustStockSchema.safeParse({
      quantity: formData.get("quantity"),
      note: formData.get("note"),
    });
    if (!result.success) {
      const flatten = z.flattenError(result.error);
      setFieldErrors(flatten.fieldErrors);
      return;
    }
    const payload = result.data;
    setFieldErrors({});
    mutation.mutate(payload);
  }

  return (
    <main className="">
      <div className="flex justify-center">
        <h2 className="text-xl lg:text-2xl my-2.5 font-light lg:my-4 text-stone-800/50">
          Adjust Stock of{" "}
          <span className="font-semibold text-stone-800">{product.name}</span>
        </h2>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-[1fr_4fr] gap-2.5 lg:gap-4 items-center">
          <label htmlFor="quantity">
            Quantity to Adjust{" "}
            {fieldErrors.quantity ? (
              <p className="text-sm font-light text-red-500">
                {fieldErrors.quantity[0]}
              </p>
            ) : (
              <p className="text-sm font-light text-red-500/50">
                must be number
              </p>
            )}
          </label>
          <input
            name="quantity"
            className="py-1.5 px-2.5 rounded-md border bg-stone-300/50"
          />

          <label htmlFor="note">
            Note{" "}
            {fieldErrors.note ? (
              <p className="text-sm font-light text-red-500">
                {fieldErrors.note[0]}
              </p>
            ) : (
              <p className="text-sm font-light text-red-500/50">
                *required
              </p>
            )}
          </label>
          <input
            name="note"
            className="py-1.5 px-2.5 rounded-md border bg-stone-300/50"
          />
        </div>
        <div className="flex items-center justify-center gap-2.5 lg:gap-4">
          <button
            type="button"
            onClick={onSuccess}
            className="py-1.5 px-2.5 rounded-md bg-stone-100 border hover:cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            className="py-1.5 px-2.5 rounded-md bg-yellow-300/50 hover:cursor-pointer active:bg-yellow-300"
          >
            Adjust
          </button>
        </div>
      </form>
    </main>
  );
}
