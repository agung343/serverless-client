import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewCategory } from "~/api/category";
import { CreateNewCategorySchema } from "~/schema/product.schema";

export default function AddCategoryForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [fieldError, setFieldError] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNewCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const result = CreateNewCategorySchema.safeParse({
      name: formData.get("name"),
    });
    if (!result.success) {
      setFieldError(result.error.flatten().fieldErrors);
      return;
    }
    setFieldError({});
    mutation.mutate(result.data);
  }

  return (
    <>
      <h2 className="mt-4 text-lg lg:text-xl text-center font-semibold dark:text-stone-800">Add Category:</h2>
      <form onSubmit={handleSubmit} className="dark:text-stone-800">
        {mutation.error?.message && (
          <p className="text-center text-sm text-red-500 font-light">
            The name already existed.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">
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

        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            type="button"
            className="bg-transparent"
            onClick={() => onSuccess()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-green-500/50 py-2 px-4 rounded-md hover:cursor-pointer active:bg-green-500"
          >
            {mutation.isPending ? "Creating..." : "+ Create"}
          </button>
        </div>
      </form>
    </>
  );
}
