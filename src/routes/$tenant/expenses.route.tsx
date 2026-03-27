import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/expenses')({
  component: RouteComponent,
})

function RouteComponent() {
  const { tenant } = Route.useParams();
    return (
      <>
        <nav className="flex gap-4 items-center py-2 px-4 bg-zinc-500/50">
          <Link
            to="/$tenant/expenses/purchase"
            params={{ tenant }}
            className="font-light"
            activeProps={{ className: "!font-bold text-blue-500 underline" }}
            activeOptions={{ exact: true }}
          >
            Purchase
          </Link>
          <Link
            to="/$tenant/expenses/operational"
            params={{ tenant }}
            className="font-light"
            activeProps={{ className: "!font-bold text-blue-500 underline" }}
            activeOptions={{ exact: true }}
          >
            Operational
          </Link>
        </nav>
        <Outlet />
      </>
    );
}
