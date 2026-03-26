import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import NavDropDown from "./nav-dropdown";
import { logout } from "~/api/auth";

export default function UserNavigation({
  username,
  isAdmin,
}: {
  username: string;
  isAdmin: boolean;
}) {
  const navigate = useNavigate();
  const tenant = useParams({
    from: "/$tenant",
    select: (params) => params.tenant,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth"] });
      navigate({ to: `/login/${tenant}`, replace: true });
    },
  });

  return (
    <header className="p-4 lg:p-6 h-12 lg:h-16 sticky left-0 top-0 z-50 bg-zinc-100 lg:text-lg flex items-center justify-between">
      <div className="flex items-center gap-2 lg:gap-4 dark:text-stone-800">
        <h1 className="lg:text-xl text-stone-800">POS & INVENTORY</h1>
        <nav className="flex items-center gap-2">
          <Link
            to={`/$tenant/kasir`}
            params={{ tenant }}
            className="font-light text-sm lg:text-base"
            activeProps={{ className: "!font-bold underline text-blue-500/50" }}
            activeOptions={{ exact: true }}
          >
            Kasir
          </Link>
          <NavDropDown
            label="Inventory"
            items={[
              { label: "Products", to: `/${tenant}/inventory/products` },
              { label: "Create Product", to: `/${tenant}/inventory/create-product`},
              { label: "Category", to: `/${tenant}/inventory/category`},
              { label: "Return", to: `/${tenant}/inventory/return` },
            ]}
          />
          {isAdmin && (
            <Link
              to={`/$tenant/admin`}
              params={{ tenant }}
              className="font-light text-sm lg:text-base"
              activeProps={{ className: "!font-bold underline text-blue-500/50" }}
              activeOptions={{ exact: true }}
            >
              Staff
            </Link>
          )}
          <NavDropDown label="Expenses" items={[
            {label: "Purchase" , to: `/${tenant}/expenses/purchase`}
          ]} />
        </nav>
      </div>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm lg:text-base font-medium text-stone-800">
          {username}
        </span>
        <button
          className="py-1.5 px-3 text-sm lg:text-base border rounded-md border-red-500 bg-transparent text-red-500 hover:cursor-pointer"
          onClick={() => mutation.mutate()}
        >
          logout
        </button>
      </div>
    </header>
  );
}
