import { createFileRoute } from "@tanstack/react-router";
import { Outlet, Navigate } from "@tanstack/react-router";
import UserNavigation from "../-components/user-navigation";
import { authQueryOptions } from "~/authQueryOption";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/$tenant")({
  loader: async ({ context: { queryClient }, params: { tenant } }) => {
    return queryClient.ensureQueryData(authQueryOptions());
  },
  component: TenantLayout,
});

function TenantLayout() {
  const tenant = Route.useParams().tenant;
  const { data: session, isLoading } = useQuery(authQueryOptions());

  if (isLoading) return null

  if (!session || !session.user) {
    return <Navigate to={`/login/$tenant`} params={{ tenant }} replace />;
  }

  const username = session.user!.username;
  const isAdmin = session.user!.role !== "STAFF";

  return (
    <>
      <UserNavigation username={username} isAdmin={isAdmin} />
      <Outlet />
    </>
  );
}
