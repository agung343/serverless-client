import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { productQueryOptions } from "~/queries/productQueryOptions";
import { getAllProducts, getProductDetail, type Product } from "~/api/product";
import { productKeys } from "~/queries/productQueryOptions";
import { useDebounceCallback } from "~/hooks/debounce";
import Modal from "../../-components/modals";
import EditProductForm from "../../-components/forms/edit-product.form";
import AdjustForm from "~/routes/-components/forms/adjust-stock";
import Pagination from "~/routes/-components/pagination";
import { PaginationProductSchema } from "~/schema/product.schema";
import { usePrefetch } from "~/hooks/usePrefetch";
import { formatUnit } from "~/lib/unit";
import SearchInput from "~/routes/-components/search-input";
import LimitSelect from "~/routes/-components/limit-select";

export const Route = createFileRoute("/$tenant/inventory/products")({
  validateSearch: PaginationProductSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({
    context: { queryClient },
    deps,
  }) => {
    return queryClient.ensureQueryData(
      productQueryOptions(deps)
    );
  },
  component: ProductsComponent,
});

function ProductsComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product["id"] | null>(
    null
  );
  const [modalType, setModalType] = useState<string | null>(null);
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
    setModalType(null);
    setSelectedProduct(null);
  }

  function openEditModal(productId: string) {
    setIsOpen(true);
    setModalType("edit");
    setSelectedProduct(productId);
  }

  function openAdjustment(productId: string) {
    setIsOpen(true);
    setModalType("adjust");
    setSelectedProduct(productId);
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-center text-xl lg:text-2xl font-bold my-3">
        Catalog Products
      </h1>

      <div className="flex items-center justify-between text-sm lg:text-base">
        <SearchInput
          label="Search"
          defaultValue={search}
          onChange={debounceSearch}
        />
        <LimitSelect value={limit} onChange={handleChangeLimit} />
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
              <th className="p-2 font-semibold border dark:border-stone-100 text-center w-64">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr
                key={product.id}
                className="font-light text-sm lg:text-base odd:bg-gray-100/50 even:bg-gray-200/50"
              >
                <td className="p-2 border">{i + 1 + (page - 1) * limit}</td>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.code}</td>
                <td className="p-2 border text-center">
                  {product.category.name}
                </td>
                <td className="p-2 border dark:border-stone-100 text-right">
                  {product.price}
                </td>
                <td className="p-2 border dark:border-stone-100 text-right">
                  {product.cost}
                </td>
                <td className="p-2 border dark:border-stone-100 text-center">
                  {formatUnit(product.stock)}
                </td>
                <td className="p-2 border dark:border-stone-100 text-center">
                  {product.unit}
                </td>
                <td className="p-2 border dark:border-stone-100">
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => openEditModal(product.id)}
                      onMouseEnter={() =>
                        prefetch([
                          {
                            queryKey: productKeys.detail(product.id),
                            queryFn: () => getProductDetail(product.id),
                            staleTime: 1000 * 60 * 5,
                          },
                        ])
                      }
                      className="py-2 px-4 rounded-md bg-gray-300/50 dark:bg-gray-100 text-stone-800 hover:cursor-pointer active:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openAdjustment(product.id)}
                      onMouseEnter={() =>
                        prefetch([
                          {
                            queryKey: productKeys.detail(product.id),
                            queryFn: () => getProductDetail(product.id),
                            staleTime: 1000 * 60 * 5,
                          },
                        ])
                      }
                      className="py-2 px-4 rounded-md bg-yellow-300/50 dark:bg-yellow-500 text-stone-800 hover:cursor-pointer active:bg-yellow-300"
                    >
                      Adjust
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        hasPrevPage={meta.hasPrevPage}
        hasNextPage={meta.hasNextPage}
        onPrevPage={() => handleChangePage(page - 1)}
        onNextPage={() => handleChangePage(page + 1)}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: productKeys.list({ search, page: page - 1, limit }),
              queryFn: () => getAllProducts({ search, page: page - 1, limit }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onNextPrefetch={() => {
          prefetch([
            {
              queryKey: productKeys.list({ search, page: page + 1, limit }),
              queryFn: () => getAllProducts({ search, page: page + 1, limit }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />

      {isOpen && selectedProduct && modalType === "edit" && (
        <Modal open={isOpen} onClose={closeModal}>
          <EditProductForm onSuccess={closeModal} productId={selectedProduct} />
        </Modal>
      )}

      {isOpen && selectedProduct && modalType === "adjust" && (
        <Modal open={isOpen} onClose={closeModal}>
          <AdjustForm productId={selectedProduct} onSuccess={closeModal} />
        </Modal>
      )}
    </main>
  );
}
