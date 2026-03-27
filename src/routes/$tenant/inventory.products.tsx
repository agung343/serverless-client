import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { productQueryOptions } from "~/productQueryOptions";
import { getProductDetail, type Product } from "~/api/product";
import { useDebounceCallback } from "~/hooks/debounce";
import Modal from "../-components/modals";
import EditProductForm from "../-components/forms/edit-product.form";
import { PaginationProductSchema } from "~/schema/product.schema";
import { usePrefetch } from "~/hooks/usePrefetch";
import { formatUnit } from "~/lib/unit";

export const Route = createFileRoute("/$tenant/inventory/products")({
  validateSearch: PaginationProductSchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
    page: search.page,
    limit: search.limit,
  }),
  loader: async ({
    context: { queryClient },
    deps: { search, page, limit },
  }) => {
    return queryClient.ensureQueryData(
      productQueryOptions({ search, page, limit })
    );
  },
  component: ProductsComponent,
});

function ProductsComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product["id"] | null>(
    null
  );
  const { search, page, limit } = useSearch({
    from: "/$tenant/inventory/products",
  });
  const navigate = useNavigate({ from: "/$tenant/inventory/products" });

  const prefetch = usePrefetch();

  const { data } = useSuspenseQuery(
    productQueryOptions({ search, page, limit })
  );
  const products = data.products || [];
  const meta = data.meta;

  const debounceSearch = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  }, 500);

  function handleChangePage(newPage: number) {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  }

  function handleChangeLimit(newLimit: number) {
    navigate({
      search: (prev) => ({ ...prev, limit: newLimit, page: 1 }),
    });
  }

  function closeModal() {
    setIsOpen(false);
    setSelectedProduct(null);
  }

  function openEditModal(productId: string) {
    setIsOpen(true);
    setSelectedProduct(productId);
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-center text-xl lg:text-2xl font-bold my-3">
        Catalog Products
      </h1>

      <div className="flex items-center justify-between text-sm lg:text-base">
        <div className="flex items-center gap-2">
          <label>Search:</label>
          <input
            type="text"
            className="py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800 text-stone-800"
            defaultValue={search}
            onChange={(e) => debounceSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Rows:</label>
          <select
            value={limit}
            onChange={(e) => handleChangeLimit(+e.target.value)}
            className="py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <p className="text-sm font-light mb-1">Total: {meta.total}</p>
        <table className="border border-collapse min-w-full border-blue-200">
          <thead className="bg-gray-300 dark:bg-blue-400 font-semibold lg:text-lg sticky top-0 z-10">
            <tr>
              <th className="p-2 font-semibold border w-12">No</th>
              <th className="p-2 font-semibold border dark:border-stone-100">
                Name
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100">
                Code
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100">
                Category
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100 text-center">
                Price
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100 text-center">
                Cost
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100 text-center">
                Stock
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100 text-center">
                Unit
              </th>
              <th className="p-2 font-semibold border dark:border-stone-100 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr key={product.id} className="font-light">
                <td className="p-2 border">{i + 1 + (page - 1) * limit}</td>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.code}</td>
                <td className="p-2 border text-center">
                  {product.category.name}
                </td>
                <td className="p-2 border text-right">{product.price}</td>
                <td className="p-2 border text-right">{product.cost}</td>
                <td className="p-2 border text-center">{formatUnit(product.stock)}</td>
                <td className="p-2 border text-center">{product.unit}</td>
                <td className="p-2 border">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => openEditModal(product.id)}
                      onMouseEnter={() =>
                        prefetch([
                          {
                            queryKey: ["product-detail", product.id],
                            queryFn: () => getProductDetail(product.id),
                            staleTime: 1000 * 60 * 5,
                          },
                        ])
                      }
                      className="py-2 px-4 rounded-md bg-gray-300/50 dark:bg-gray-100 text-stone-800 hover:cursor-pointer active:bg-gray-300"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="text-stone-600">Page {page}</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={!meta.hasPrevPage}
            className="py-1 px-3 rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={!meta.hasNextPage}
            className="py-1 px-3 rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {isOpen && selectedProduct && (
        <Modal open={isOpen} onClose={closeModal}>
          <EditProductForm onSuccess={closeModal} productId={selectedProduct} />
        </Modal>
      )}
    </main>
  );
}
