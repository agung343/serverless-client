import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { productQueryOptions } from "~/productQueryOptions";
import { PaginationProductSchema } from "~/product";
import { useDebounceCallback } from "~/lib/debounce";

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
  const { search, page, limit } = useSearch({
    from: "/$tenant/inventory/products",
  });
  const navigate = useNavigate({ from: "/$tenant/inventory/products" });

  const { data } = useSuspenseQuery(
    productQueryOptions({ search, page, limit })
  );
  const products = data.products || [];
  const meta = data.meta

  const debounceSearch = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  });

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

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-center text-xl lg:text-2xl font-bold my-3">
        Products
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

      <table className="border border-collapse min-w-full border-blue-200 mt-4 lg:mt-6">
        <thead className="bg-gray-300">
          <tr>
            <th className="p-2 font-semibold border">Name</th>
            <th className="p-2 font-semibold border">Code</th>
            <th className="p-2 font-semibold border">Category</th>
            <th className="p-2 font-semibold border text-center">Price</th>
            <th className="p-2 font-semibold border text-center">Cost</th>
            <th className="p-2 font-semibold border text-center">Stock</th>
            <th className="p-2 font-semibold border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-2 border">{product.name}</td>
              <td className="p-2 border">{product.code}</td>
              <td className="p-2 border">{product.category.name}</td>
              <td className="p-2 border">{product.price}</td>
              <td className="p-2 border">{product.cost}</td>
              <td className="p-2 border">{product.stock}</td>
              <td className="p-2 border">
                <div className="flex items-center justify-center">
                  <button className="py-2 px-4 rounded-md bg-gray-300/50 text-stone-800 hover:cursor-pointer active:bg-gray-300">
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="text-stone-600">Page {page}</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={!meta.hasPrev}
            className="py-1 px-3 rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={!meta.hasNext}
            className="py-1 px-3 rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
