import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNewCategory } from "~/category";
import { ApiError } from "~/lib/error";

export default function AddCategoryForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNewCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
    },
  });

  const fieldError = mutation.error instanceof ApiError ? mutation.error : null;

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    mutation.mutate({
        name: formData.get("name") as string
    })
  }

  return (
    <>
      <h2 className="mt-4 text-lg lg:text-xl font-semibold">Add Category:</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="name">
            Name{" "}
            {fieldError?.getFieldErrors("name") ? (
              <span className="text-sm font-light text-red-500/50">
                {fieldError.getFieldErrors("name")}
              </span>
            ) : (
              <span className="text-sm font-light text-red-500/50">
                *required
              </span>
            )}{" "}
          </label>
          <input
            type="text"
            name="name"
            className="py-2 px-4 rounded-md bg-stone-300/50"
          />
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            type="button"
            className="bg-transparent"
            onClick={() => onSuccess()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-green-500/50 py-2 px-4 rounded-md hover:cursor-pointer active:bg-green-500"
          >
            {mutation.isPending ?  "Creating..." : "+ Create"}
          </button>
        </div>
      </form>
    </>
  );
}
