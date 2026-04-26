import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { categoriesQueryOptions } from "~/queries/categoryQueryOption";
import { createNewCategory } from "~/api/category";
import { CreateNewCategorySchema } from "~/schema/product.schema";

export const Route = createFileRoute("/$tenant/inventory/category")({
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(categoriesQueryOptions());
  },
  component: CategoryComponent,
});

function CategoryComponent() {
  const queryClient = useQueryClient();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { data } = useSuspenseQuery(categoriesQueryOptions());
  const categories = data.categories || [];

  const categoryMutation = useMutation({
    mutationFn: createNewCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const error = categoryMutation.error

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const result = CreateNewCategorySchema.safeParse({
      name: formData.get("name"),
    });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setFieldErrors({})
    categoryMutation.mutate(result.data);
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-2xl lg:text-4xl font-bold text-center text-blue-500/70">Categories List</h1>
      <form onSubmit={handleSubmit} className="my-4 md:my-8 mx-auto">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="name">New Category</label>
            <input
              type="text"
              name="name"
              className="bg-gray-300/50 py-1.5 px-3 rounded-md"
            />
          </div>
          <button className="bg-green-500/70 py-2 w-fit px-4 rounded-md font-semibold md:text-lg hover:cursor-pointer hover:bg-green-500 active:bg-green-500">
            + Add
          </button>
        </div>
        {fieldErrors?.name && (
          <p className="text-xs text-center font-light text-red-500">
            {fieldErrors.name[0]}
          </p>
        )}
        {error && <p className="text-xs text-center font-light text-red-500">
            Category already existed.
          </p>}
      </form>
      <table className="border border-collapse max-w-md mx-auto my-4 md:my-6">
        <thead className="bg-gray-300/50 dark:bg-blue-300/50">
          <tr className="md:text-lg font-semibold">
            <th className="p-2.5 border dark:border-white">Name</th>
            <th className="p-2.5 border dark:border-white">Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="p-2 border text-center">{cat.name}</td>
              <td className="p-2 border ">
                <div className="flex justify-center">
                  <button className="py-2 px-4 rounded-md bg-gray-300/50 dark:bg-gray-100 text-stone-800">
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
