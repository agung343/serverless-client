import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, type User } from "~/api/users";
import { UpdateUserSchema } from "~/schema/user.schema";

interface Props {
  onSuccess: () => void;
  user: User;
}

export default function EditStaffForm({ onSuccess, user }: Props) {
  const [fieldError, setFieldError] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const result = UpdateUserSchema.safeParse({
      userId: user.id,
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role")
    });
    if (!result.success) {
      const flatten = z.flattenError(result.error);
      setFieldError(flatten.fieldErrors);
      return;
    }
    setFieldError({});

    mutation.mutate(result.data);
  }

  return (
    <>
      <h2 className="mt-4 text-lg lg:text-xl font-semibold">Add Staff:</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center">
          <label htmlFor="username">
            Username{" "}
            {fieldError?.username ? (
              <span className="text-red-500/50 text-sm font-light">
                {fieldError.username[0]}
              </span>
            ) : (
              <span className="text-red-500/50 text-sm font-light">
                * required
              </span>
            )}
          </label>
          <input
            type="text"
            id="username"
            name="username"
            defaultValue={user.username}
            className="py-2 px-4 rounded-md border border-gray-100 bg-gray-100/50"
          />
        </div>
        <div className="flex flex-col justify-center">
          <label htmlFor="password">
            Password{" "}
            {fieldError?.pasword ? (
              <span className="text-red-500/50 text-sm font-light">
                {fieldError.password[0]}
              </span>
            ) : (
              <span className="text-red-500/50 text-sm font-light">
                * required
              </span>
            )}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="py-2 px-4 rounded-md border border-gray-500 bg-gray-300/50"
          />
        </div>
        <div className="flex flex-col justify-center">
          <label htmlFor="role">Role</label>
          <select
            name="role"
            id="role"
            defaultValue={"STAFF"}
            className="py-2 px-4 rounded-md border-gray-300 bg-stone-100 focus:ring-2 outline-none"
          >
            <option value={"STAFF"}>STAFF</option>
            <option value={"ADMIN"}>ADMIN</option>
          </select>
        </div>
        {mutation.isError && !Object.keys(fieldError).length && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {mutation.error.message}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="py-2 px-4 rounded-md bg-slate-900/50 text-zinc-50 hover:bg-slate-900 disabled:bg-gray-500/50 active:bg-slate-800 active:scale-[0.98] transition-all"
          >
            {mutation.isPending ? "Creating username..." : "Add Username"}
          </button>
        </div>
      </form>
    </>
  );
}
