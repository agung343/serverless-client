import { createFileRoute } from "@tanstack/react-router";
import { Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$tenant/inventory")({
  component: InventoryRoot,
});

function InventoryRoot() {
  const { tenant } = Route.useParams();
  return (
    <>
      <nav className="flex gap-4 items-center py-2 px-4 bg-zinc-500/50">
        <Link
          to="/$tenant/inventory/products"
          params={{ tenant }}
          className="font-light"
          activeProps={{ className: "!font-bold text-blue-500 underline" }}
          activeOptions={{}}
        >
          Products
        </Link>
        <Link
          to="/$tenant/inventory/create-product"
          params={{ tenant }}
          className="font-light"
          activeProps={{ className: "!font-bold text-blue-500 underline" }}
          activeOptions={{ exact: true }}
        >
          Create Product
        </Link>
        <Link
          to="/$tenant/inventory/category"
          params={{ tenant }}
          className="font-light"
          activeProps={{ className: "!font-bold text-blue-500 underline" }}
          activeOptions={{ exact: true }}
        >
          Category
        </Link>
        <Link
          to="/$tenant/inventory/stock"
          params={{ tenant }}
          className="font-light"
          activeProps={{ className: "!font-bold text-blue-500 underline" }}
        >
          Stock
        </Link>
      </nav>
      <Outlet />
    </>
  );
}
