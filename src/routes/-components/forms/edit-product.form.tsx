import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { productDetailsQueryOptions } from "~/productQueryOptions";
import { categoriesQueryOptions } from "~/categoryQueryOption";
import { updateProduct } from "~/api/product";
import { type UpdateProductPayload } from "~/schema/product.schema";

interface Props {
  onSuccess: () => void;
  productId: string;
}

export default function EditProductForm({ onSuccess, productId }: Props) {
  const queryClient = useQueryClient();

  const { data: product } = useSuspenseQuery(
    productDetailsQueryOptions(productId)
  );

  const { data } = useSuspenseQuery(categoriesQueryOptions());
  const categories = data.categories || [];

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProductPayload) =>
      updateProduct(payload, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product-detail", productId],
      });
      onSuccess();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload: UpdateProductPayload = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      price: Number(formData.get("price")),
      cost: Number(formData.get("cost")),
      description: formData.get("description") as string,
      categoryId: formData.get("category") as string,
    };

    updateMutation.mutate(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="dark:text-stone-700">
      <h1 className="text-xl lg:text-2xl font-semibold text-center">
        Update Product
      </h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold text-gray-800/70">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={product.name}
            className="py-2 px-4 rounded-md bg-stone-300/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="code" className="font-semibold text-gray-800/70">Code</label>
          <input
            type="text"
            name="code"
            defaultValue={product.code}
            className="py-2 px-4 rounded-md bg-stone-300/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="font-semibold text-gray-800/70">Category</label>
          <select
            name="category"
            className="py-2 px-4 rounded-md border border-gray-500"
            defaultValue={product.category.id}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="unit" className="font-semibold text-gray-800/70">Unit</label>
          <select
            name="unit"
            className="py-2 px-4 rounded-md border border-gray-500"
          >
            <option value="">Select unit</option>
            <option value="1">Piece</option>
            <option value="2">Kg</option>
            <option value="4">Liter</option>
            <option value="5">Meter</option>
            <option value="6">Box</option>
            <option value="7">Doz</option>
            <option value="8">Pack</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="font-semibold">Price</label>
          <input
            type="text"
            name="price"
            defaultValue={product.price}
            className="py-2 px-4 rounded-md bg-stone-300/50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cost" className="font-semibold">Cost</label>
          <input
            type="text"
            name="cost"
            defaultValue={product.cost}
            className="py-2 px-4 rounded-md bg-stone-300/50"
          />
        </div>{" "}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-semibold">Description</label>
          <textarea
            rows={2}
            name="description"
            defaultValue={product.description}
            className="py-2 px-4 rounded-md bg-stone-300/50"
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          type="button"
          onClick={onSuccess}
          className="py-2 px-4 rounded-md bg-transparent border border-gray-500 font-semibold hover:cursor-pointer"
        >
          Back
        </button>
        <button
          type="submit"
          className="py-2 px-4 rounded-md bg-green-500/50 font-semibold hover:cursor-pointer active:bg-green-500"
        >
          Update
        </button>
      </div>
    </form>
  );
}
