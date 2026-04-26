import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archievePurchase } from "~/api/purchase";
import {
  ArchievePurchaseSchema,
  type ArchievePurchasePayload,
} from "~/schema/purchase.schema";
import { purchaseKeys } from "~/queries/purchaseQueryOptions";

interface DeletePurchaseProps {
  purchaseId: string;
  onSuccess: () => void;
}

export default function DeletePurchase({
  purchaseId,
  onSuccess,
}: DeletePurchaseProps) {
  const [fieldError, setFieldError] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  const archieveMutation = useMutation({
    mutationFn: (payload: ArchievePurchasePayload) =>
      archievePurchase(purchaseId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      alert(data.message);
      onSuccess();
    },
    onError: (data:any) => {
      if (data.message) {
        alert(data.message)
      }
    }
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = ArchievePurchaseSchema.safeParse({
      notes: formData.get("notes"),
    });
    if (!result.success) {
      const flatten = z.flattenError(result.error);
      setFieldError(flatten.fieldErrors);
      return;
    }
    const payload = result.data;
    setFieldError({});
    archieveMutation.mutate(payload);
  }

  return (
    <main className="min-w-md p-2.5 lg:p-4 dark:text-stone-800">
      <h2 className="text-xl lg:text-2xl text-center">Delete Purchase</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes">
            Notes{" "}
            {fieldError.notes ? (
              <span className="text-sm font-light text-red-500">
                {fieldError.notes[0]}
              </span>
            ) : (
              <span className="text-sm font-light text-red-500/50">
                *required
              </span>
            )}
          </label>
          <textarea
            rows={2}
            name="notes"
            className="py-1.5 px-2.5 rounded-md bg-stone-200/50"
          />
        </div>
        <div className="flex items-center justify-center gap-2.5 lg:gap-4">
          <button
            type="button"
            onClick={onSuccess}
            className="py-2 px-4 rounded-md border border-gray-300 bg-stone-200/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={archieveMutation.isPending}
            className="py-2 px-4 rounded-md bg-red-500/50 active:bg-red-500 disabled:bg-gray-500"
          >
            {archieveMutation.isPending ? "Deleting" : "Delete"}
          </button>
        </div>
      </form>
    </main>
  );
}
