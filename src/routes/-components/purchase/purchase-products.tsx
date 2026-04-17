import { useState, useRef } from "react";
import type { Product } from "~/api/product";
import type { PurchaseItems } from "~/lib/purchase";
import { UNITS } from "../forms/select-unit";

type ProductPurchaseList = Pick<Product, "id" | "name" | "cost">;

interface Props {
  products: ProductPurchaseList[];
  onAddItem: (item: PurchaseItems) => void;
}

export default function PurchaseProducts({ products, onAddItem }: Props) {
  const [draft, setDraft] = useState({
    name: "",
    productId: undefined as string | undefined,
    quantity: "1",
    unitId: undefined as number | undefined,
    cost: "",
  });

  const [highlightIndex, setHighlightIndex] = useState(0);
  const [showDrop, setShowDrop] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLSelectElement>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(draft.name.toLowerCase())
  );

  function resetDraft() {
    setDraft({
      name: "",
      productId: undefined,
      quantity: "1",
      unitId: undefined,
      cost: "",
    });
    setHighlightIndex(0);
  }

  function handleSubmit() {
    if (!draft.name) return;

    const newItem: PurchaseItems = {
      id: crypto.randomUUID(),
      productId: draft.productId,
      name: draft.name,
      quantity: Number(draft.quantity) || 1,
      unitId: draft.unitId,
      cost: Number(draft.cost) || 0,
    };

    onAddItem(newItem);
    resetDraft();
    searchRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-sky-800/50 rounded-md">
      <h1 className="text-xl lg:text-2xl dark:text-neutral-800 text-neutral-100 font-bold">
        Select Product:
      </h1>
      <div className="flex flex-col lg:flex-row lg:items-center gap-1.5">
        <label className="font-semibold w-20 lg:w-28 text-sm lg:text-base">
          Product:
        </label>
        <div className="relative w-75 lg:w-lg">
          <input
            ref={searchRef}
            autoFocus
            value={draft.name}
            placeholder="Type product..."
            onChange={(e) => {
              setDraft((prev) => ({
                ...prev,
                name: e.target.value,
                productId: undefined,
              }));
              setShowDrop(true);
              setHighlightIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightIndex((i) => Math.min(i + 1, filtered.length));
              }

              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex((i) => Math.max(i - 1, 0));
              }

              if (e.key === "Enter") {
                e.preventDefault();

                const selected = filtered[highlightIndex];

                if (selected) {
                  setDraft({
                    name: selected.name,
                    productId: selected.id,
                    quantity: "1",
                    unitId: undefined,
                    cost: String(selected.cost),
                  });
                }

                setShowDrop(false);
                qtyRef.current?.focus();
              }
            }}
            className="w-full p-2 rounded-md bg-white text-xs md:text-sm"
          />

          {/* Dropdown */}
          {showDrop && draft.name && (
            <ul className="absolute w-full bg-white border mt-1 max-h-48 overflow-y-auto z-50">
              {filtered.map((item, index) => (
                <li
                  key={item.id}
                  className={`p-2 cursor-pointer text-xs lg:text-sm ${
                    index === highlightIndex ? "bg-blue-500 text-white" : ""
                  }`}
                  onMouseDown={() => {
                    setDraft({
                      name: item.name,
                      productId: item.id,
                      quantity: "1",
                      unitId: undefined,
                      cost: String(item.cost),
                    });
                    setShowDrop(false);
                    qtyRef.current?.focus();
                  }}
                >
                  {item.name}
                </li>
              ))}

              {/* manual fallback */}
              <li
                className={`p-2 text-green-600 cursor-pointer text-xs lg:text-sm ${
                  highlightIndex === filtered.length ? "bg-green-100" : ""
                }`}
                onMouseDown={() => {
                  setShowDrop(false);
                  qtyRef.current?.focus();
                }}
              >
                ➕ Add "{draft.name}"
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* QTY */}
      <div className="flex items-center">
        <label className="font-semibold w-20 md:w-28 text-sm lg:text-base">
          Quantity
        </label>
        <input
          ref={qtyRef}
          type="text"
          value={draft.quantity}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, quantity: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              costRef.current?.focus();
            }
          }}
          className="w-16 p-2 rounded-md bg-neutral-100 dark:text-neutral-800"
          placeholder="Qty"
        />
      </div>

      <div className="flex items-center">
        <label className="font-semibold w-20 md:w-28 text-sm lg:text-base">
          Cost per unit
        </label>
        <input
          ref={costRef}
          type="number"
          value={draft.cost}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, cost: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              unitRef.current?.focus();
            }
          }}
          className="w-36 p-2 rounded-md bg-neutral-100 dark:text-neutral-800"
          placeholder="Cost"
        />
      </div>
      <div className="flex items-center">
        <label className="font-semibold w-20 md:w-28 text-sm lg:text-base">
          Unit
        </label>
        <select
          ref={unitRef}
          name="unit"
          value={draft.unitId}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, unitId: +e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-48 p-2 rounded-md bg-neutral-100 text-sm lg:text-base"
        >
          <option value={""}>Select Unit</option>
          {UNITS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.symbol} - {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-neutral-100 font-semibold rounded-md px-4 py-2"
        >
          Add
        </button>
      </div>
    </div>
  );
}
