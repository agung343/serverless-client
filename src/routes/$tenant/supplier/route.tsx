import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/$tenant/supplier')({
  component: RouteComponent,
})

function RouteComponent() {
  const { tenant } = Route.useParams();
    return (
      <>
        <nav className="flex gap-4 items-center py-2 px-4 bg-zinc-500/50">
          <Link
            to="/$tenant/supplier"
            params={{ tenant }}
            className="font-light"
            activeProps={{ className: "!font-bold text-blue-500 underline" }}
            activeOptions={{exact: true}}
          >
            Supplier
          </Link>
          <Link
            to="/$tenant/supplier/history"
            params={{ tenant }}
            className="font-light"
            activeProps={{ className: "!font-bold text-blue-500 underline" }}
          >
            History
          </Link>
        </nav>
        <Outlet />
      </>
    );
}
