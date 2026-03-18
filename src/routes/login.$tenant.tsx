import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ErrorComponentProps } from "@tanstack/react-router";
import { authQueryOptions } from "../authQueryOption";
import { login, getTenant } from "../auth";

export const Route = createFileRoute("/login/$tenant")({
  loader: async ({ context: { queryClient }, params: { tenant } }) => {
    await getTenant(tenant);
    return queryClient.ensureQueryData(authQueryOptions());
  },
  component: LoginComponents,
  errorComponent: AuthErrorComponent,
});

export function AuthErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="my-12 mx-auto w-md text-center">
      <h1 className="text-xl lg:text-3xl font-semibold text-red-500/50">
        {error.cause === 404 ? "Tenant not found" : "Something went wrong"}
      </h1>
      <p className="text-sm lg:text-base mt-2">{error.message}</p>
    </main>
  );
}

function LoginComponents() {
  const tenant = Route.useParams().tenant;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session } = useQuery(authQueryOptions());

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate({ to: `/$tenant/kasir`, params: { tenant }, replace: true });
    },
  });

  if (session) {
    return <Navigate to={`/$tenant/kasir`} params={{ tenant }} replace />;
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    loginMutation.mutate({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      tenant: tenant,
    });
  }

  return (
    <main className="my-12 mx-auto w-md">
      <h1 className="text-xl font-semibold text-center my-4">
        {tenant.toLocaleUpperCase()} login
      </h1>
      <form
        className="flex flex-col justify-center items-center gap-2"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <label htmlFor="username" className="font-light block">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="py-2 px-4 rounded-md bg-stone-200 text-stone-700"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="font-light block">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="py-2 px-4 rounded-md bg-stone-200 text-stone-700"
          />
        </div>
        <button
          className="py-2 px-4 border rounded-md bg-blue-500 hover:cursor-pointer text-white disabled:bg-stone-400 disabled:text-stone-700"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging In" : "Login"}
        </button>
        {loginMutation.error && (
          <span className="text-xs font-light text-red-500">
            {loginMutation.error.message}
          </span>
        )}
      </form>
    </main>
  );
}
