import { formatRupiah } from "~/lib/rupiah_currency";
import type { Product } from "~/api/product";

type ProductCashierList = Pick<Product, "id" | "name" | "price" | "code">;

interface ProductCashierProps {
  products: ProductCashierList[];
  searchQuery: string | undefined;
  onSearch: (value: string) => void;
  selectedProduct: ProductCashierList | null;
  onSelectProduct: (product: ProductCashierList) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  onAddProduct: () => void;
}

export default function CashierProducts(props: ProductCashierProps) {
  return (
    <div className="flex flex-col gap-4 bg-sky-800/50 h-full p-4">
      <h2 className="text-xl lg:text-2xl font-bold">Product Catalog</h2>
      <input
        type="text"
        placeholder="Search products..."
        defaultValue={props.searchQuery}
        onChange={(e) => props.onSearch(e.target.value)}
        className="w-full p-2 rounded-md mb-4 bg-stone-300/50 border border-gray-500"
      />
      <div className="flex items-center justify-between text-sm lg:text-base">
        <div className="flex items-center gap-2 w-4/5">
          <p className="font-semibold w-3/4 truncate">
            {props.selectedProduct ? (
              <span>{props.selectedProduct.name}</span>
            ) : (
              <span className="text-stone-800/50">
                "Please select a product."
              </span>
            )}
          </p>
          <input
            type="text"
            value={props.quantity}
            onChange={(e) => props.onQuantityChange(e.target.value)}
            className="w-16 py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800 text-stone-800"
          />
        </div>
        <button
          onClick={props.onAddProduct}
          disabled={!props.selectedProduct}
          className="py-1 px-3 rounded-md bg-green-500/50 border border-white hover:cursor-pointer hover:bg-green-500 active:bg-green-500 text-white font-semibold"
        >
          Add
        </button>
      </div>
      <div className="flex flex-col overflow-auto h-120">
        {props.products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products found.</p>
        ) : (
          props.products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-2 bg-gray-300 mb-2 rounded-md cursor-pointer hover:bg-gray-400"
              onClick={() => props.onSelectProduct(product)}
            >
              <h3 className="font-semibold">{product.name}</h3>
              <h3 className="font-semibold">{formatRupiah(product.price)}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
