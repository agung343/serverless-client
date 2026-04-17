import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOperationalExpense } from "~/api/expenses";
import { CreateNewExpenseOperationalSchema } from "~/schema/expense.schema";

interface Props {
  onSuccess: () => void;
}

export default function AddOperationalForm({ onSuccess }: Props) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const queryClient = useQueryClient();
  const OperationalMutation = useMutation({
    mutationFn: createOperationalExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operationals"] });
      onSuccess();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const result = CreateNewExpenseOperationalSchema.safeParse({
      name: formData.get("name"),
      amount: formData.get("amount"),
      description: formData.get("description"),
    });
    if (!result.success) {
      const flatten = z.flattenError(result.error);
      setFieldErrors(flatten.fieldErrors);
      return;
    }
    setFieldErrors({});
    const payload = result.data;
    OperationalMutation.mutate(payload);
  }

  return (
    <>
      <h2 className="my-4 text-lg: lg:text-xl text-center font-semibold dark:text-stone-800">
        Record New Operational Expense
      </h2>
      <form className="dark:text-stone-800" onSubmit={handleSubmit}>
        {OperationalMutation.error?.message && (
          <p className="text-center text-sm text-red-500 font-light">
            {OperationalMutation.error.message}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold">
              Name{" "}
              {fieldErrors.name ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldErrors.name[0]}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}
            </label>
            <input
              type="text"
              name="name"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="font-semibold">
              Amount{" "}
              {fieldErrors.amount ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldErrors.amount[0]}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}
            </label>
            <input
              type="text"
              name="amount"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold">
              Description
            </label>
            <textarea
              rows={2}
              name="description"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            type="button"
            className="bg-transparent"
            onClick={() => onSuccess()}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={OperationalMutation.isPending}
            className="bg-green-500/50 py-2 px-4 rounded-md hover:cursor-pointer active:bg-green-500"
          >
            {OperationalMutation.isPending ? "Saving..." : "+ Record"}
          </button>
        </div>
      </form>
    </>
  );
}
