import { createFileRoute } from '@tanstack/react-router'
import { Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/cashier')({
  component: CashierRoute,
})

function CashierRoute() {
  const { tenant } = Route.useParams();
    return (
      <>
        <nav className="flex gap-4 items-center py-2 px-4 bg-zinc-500/50">
          <Link
            to="/$tenant/cashier"
            params={{ tenant }}
            className="font-light"
            activeProps={{ className: "!font-bold text-blue-500 underline" }}
            activeOptions={{exact: true}}
          >
            Cashier
          </Link>
          <Link
            to="/$tenant/cashier/today"
            params={{ tenant }}
            className="font-light"
            activeProps={{ className: "!font-bold text-blue-500 underline" }}
            activeOptions={{exact: true}}
          >
            Today Sales
          </Link>
        </nav>
        <Outlet />
      </>
    );
}
