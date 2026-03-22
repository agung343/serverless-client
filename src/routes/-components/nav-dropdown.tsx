import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

interface Item {
  label: string;
  to: string;
}

export default function NavDropDown({
  label,
  items,
}: {
  label: string;
  items: Item[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 z-50 font-light text-sm lg:text-base"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="absolute left-0 max-w-32 rounded-md bg-stone-300 z-50 shadow-white">
          <ul className="py-1">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeProps={{
                    className: "font-bold",
                  }}
                  activeOptions={{exact: true}}
                  className="block px-4 py-2 hover:bg-gray-200 font-light text-sm lg:text-base"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
