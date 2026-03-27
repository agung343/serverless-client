import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createOperationalExpense } from "~/api/expenses";
import { CreateExpenseOperationalSchema } from "~/schema/expenses.schema";

interface Props {
  onSuccess?: () => void;
}

export default function AddExpenseOperationalForm({ onSuccess }: Props) {
  const [fieldError, setFieldError] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createOperationalExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operational-expenses"] });
      if (onSuccess) onSuccess();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const payloadResult = CreateExpenseOperationalSchema.safeParse({
      name: formData.get("name"),
      amount: formData.get("amount"),
      description: formData.get("description") as string | null,
    });
    if (!payloadResult.success) {
      const flatten = z.flattenError(payloadResult.error);
      setFieldError(flatten.fieldErrors);
      return;
    }
    setFieldError({});
    const payload = payloadResult.data;
    mutation.mutate(payload);
  }

  return (
    <>
      <h2 className="mt-2 mb-4 text-lg lg:text-xl text-center font-semibold dark:text-stone-800">
        Add Operational Expense:
      </h2>
      <form onSubmit={handleSubmit} className="dark:text-stone-800">
        {mutation.error?.message && (
          <p className="text-center text-sm text-red-500 font-light">
            {mutation.error.message}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold text-stone-800/70">
              Name{" "}
              {fieldError.name ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldError.name[0]}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}{" "}
            </label>
            <input
              type="text"
              name="name"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="font-semibold text-stone-800/70">
              Amount{" "}
              {fieldError.name ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldError.name[0]}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}{" "}
            </label>
            <input
              type="text"
              name="amount"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="font-semibold text-stone-800/70"
            >
              Description
            </label>
            <textarea
              rows={2}
              name="description"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
        </div>

        <button
          disabled={mutation.isPending}
          className="py-2 px-4 rounded-md bg-green-500/50 hover:cursor-pointer hover:bg-green-500 active:bg-green-500 mx-auto mt-4"
        >
          {mutation.isPending ? "Saving..." : "Add Expense"}
        </button>
      </form>
    </>
  );
}
