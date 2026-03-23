import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { categoriesQueryOptions } from "~/categoryQueryOption";
import { createNewProduct } from "~/product";
import Modal from "../-components/modals";
import AddCategoryForm from "../-components/forms/add-category.form";
import { ApiError } from "~/lib/error";

export const Route = createFileRoute("/$tenant/inventory/create-product")({
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(categoriesQueryOptions());
  },
  component: CreateProduct,
});

function CreateProduct() {
  const { tenant } = Route.useParams();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  function closeModal() {
    setIsOpen(false);
  }

  function openCategory() {
    setIsOpen(true);
  }

  const { data } = useSuspenseQuery(categoriesQueryOptions());
  const categories = data.categories || [];

  const mutation = useMutation({
    mutationFn: createNewProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const fieldErrors =
    mutation.error instanceof ApiError ? mutation.error : null;

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = new FormData(e.currentTarget);

    mutation.mutate({
      name: payload.get("name") as string,
      code: payload.get("code") as string,
      categoryId: payload.get("category") as string,
      price: Number(payload.get("price")),
      cost: Number(payload.get("cost")),
      description: payload.get("description")?.toString(),
    });
  }

  return (
    <main className="p-4 lg:p-6 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-1/2 mx-auto border p-4 rounded-md shadow-gray-600/50 shadow-sm my-4 text-sm lg:text-base"
      >
        <h1 className="text-center text-xl lg:text-2xl font-bold">
          Create New Product
        </h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name">
              Name{" "}
              {fieldErrors?.getFieldErrors("name") ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldErrors.getFieldErrors("name")}
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
            <label htmlFor="code">
              Code{" "}
              {fieldErrors?.getFieldErrors("code") ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldErrors.getFieldErrors("code")}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}
            </label>
            <input
              type="text"
              name="code"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="category">
              Category{" "}
              {fieldErrors?.getFieldErrors("categoryId") ? (
                <span className="text-sm font-light text-red-500/50">
                  {fieldErrors.getFieldErrors("categoryId")}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}
            </label>
            <select
              name="category"
              className="py-2 px-4 rounded-md border border-gray-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => openCategory()}
              className="py-2 px-4 rounded-md bg-stone-500/50 border border-white"
            >
              + New Category
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="price">Price</label>
            <input
              type="text"
              name="price"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="cost">Cost</label>
            <input
              type="text"
              name="cost"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>{" "}
          <div className="flex flex-col gap-2">
            <label htmlFor="description">Description</label>
            <textarea
              rows={2}
              name="description"
              className="py-2 px-4 rounded-md bg-stone-300/50"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            type="reset"
            className="py-2 px-4 rounded-md bg-transparent border border-gray-500 font-semibold hover:cursor-pointer"
          >
            Clear
          </button>
          <button
            type="submit"
            className="py-2 px-4 rounded-md bg-green-500/50 font-semibold hover:cursor-pointer active:bg-green-500"
          >
            + Create
          </button>
        </div>
      </form>
      {isOpen && (
        <Modal open={isOpen} onClose={closeModal}>
          <AddCategoryForm onSuccess={closeModal} />
        </Modal>
      )}
    </main>
  );
}
