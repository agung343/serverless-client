import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/transaction')({
  component: RouteComponent,
})

function RouteComponent() {
  const { tenant } = Route.useParams();
      return (
        <>
          <nav className="flex gap-4 items-center py-2 px-4 bg-zinc-500/50">
            <Link
              to="/$tenant/transaction/sales"
              params={{ tenant }}
              className="font-light"
              activeProps={{ className: "!font-bold text-blue-500 underline" }}
            >
              Sales
            </Link>
            <Link
              to="/$tenant/transaction/purchases"
              params={{ tenant }}
              className="font-light"
              activeProps={{ className: "!font-bold text-blue-500 underline" }}
            >
              Purchases
            </Link>
          </nav>
          <Outlet />
        </>
      );
}
