import { useCallback, useRef, useId, useState } from "react";
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
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listId = useId();

  const focusItem = useCallback((index: number) => {
    itemRefs.current[index]?.focus();
  }, []);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(0);
    }
  }

  function handleItemKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>,
    product: ProductCashierList,
    index: number
  ) {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        focusItem(Math.min(index + 1, props.products.length - 1));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (index === 0) {
          searchRef.current?.focus();
        } else {
          focusItem(index - 1);
        }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        props.onSelectProduct(product);
        qtyRef.current?.focus();
        qtyRef.current?.select();
        break;
      }
      case "Escape": {
        searchRef.current?.focus();
        break;
      }
    }
  }

  function handleQuantityKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && props.selectedProduct) {
      e.preventDefault();
      props.onAddProduct();
      searchRef.current?.focus();
    }
    if (e.key === "Escape") {
      searchRef.current?.focus();
    }
  }

  const selectedIndex = props.products.findIndex(
    (p) => p.id === props.selectedProduct?.id
  );
  itemRefs.current = itemRefs.current.slice(0, props.products.length)

  return (
    <div className="flex flex-col gap-4 bg-sky-800/50 h-full p-4">
      <h2 className="text-xl lg:text-2xl font-bold">Product Catalog</h2>
      <input
        ref={searchRef}
        type="text"
        placeholder="Search products..."
        value={props.searchQuery ?? ""}
        onChange={(e) => props.onSearch(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        aria-label="Search products"
        aria-controls={listId}
        className="w-full p-2 rounded-md mb-4 bg-stone-300/50 border border-gray-500 dark:text-stone-800"
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
            ref={qtyRef}
            type="text"
            value={props.quantity}
            onChange={(e) => props.onQuantityChange(e.target.value)}
            onKeyDown={handleQuantityKeyDown}
            aria-label="Quantity"
            className="w-16 py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800 text-stone-800"
          />
        </div>
        <button
          onClick={() => {
            props.onAddProduct();
            searchRef.current?.focus();
          }}
          disabled={!props.selectedProduct}
          aria-label={
            props.selectedProduct
              ? `Add ${props.selectedProduct.name}`
              : "Select product first"
          }
          className="py-1 px-3 rounded-md bg-green-500/50 border border-white hover:cursor-pointer hover:bg-green-500 active:bg-green-500 text-white font-semibold"
        >
          Add
        </button>
      </div>
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Product list"
        aria-activedescendant={
          selectedIndex >= 0
            ? `product-${props.products[selectedIndex]?.id}`
            : undefined
        }
        className="flex flex-col overflow-auto h-120"
      >
        {props.products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products found.</p>
        ) : (
          props.products.map((product, index) => {
            const isSelected = props.selectedProduct?.id === product.id;
            return (
              <div
                key={product.id}
                id={`product-${product.id}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="option"
                tabIndex={0}
                onClick={() => {
                  props.onSelectProduct(product);
                  qtyRef.current?.focus();
                  qtyRef.current?.select();
                }}
                onKeyDown={(e) => handleItemKeyDown(e, product, index)}
                onFocus={() => setFocusIndex(index)}
                onBlur={() => setFocusIndex(null)}
                className={`flex items-center justify-between p-2 mb-2 rounded-md cursor-pointer outline-none
                  focus:ring-2 focus:ring-blue-400
                  ${
                    isSelected
                      ? "bg-blue-400 text-white"
                      : focusIndex === index
                      ? "bg-blue-300"
                      : "bg-gray-300 hover:bg-blue-300"
                  }`}
              >
                <h3 className="font-semibold dark:text-stone-800">{product.name}</h3>
                <h3 className="font-semibold dark:text-stone-800">{formatRupiah(product.price)}</h3>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
