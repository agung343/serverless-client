import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { supplierKeys } from "~/queries/supplierQueryOptions";
import {
  getSupplierDetail,
  CreateSupplier,
  updateSupplier,
  type Supplier
} from "~/api/supplier";
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
  type UpdateSupplierPayload,
} from "~/schema/supplier.schema";

interface SupplierFormProps {
  mode: "new" | "edit";
  suppId?: string;
  onSuccess: () => void;
}

export default function SupplierForm({
  mode,
  suppId,
  onSuccess,
}: SupplierFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();

  const { data, isSuccess, isLoading } = useQuery<Supplier>({
    queryKey: supplierKeys.detail(suppId!),
    queryFn: () => getSupplierDetail(suppId!),
    enabled: mode === "edit" && !!suppId,
  });

  function InvalidateAndClose() {
    queryClient.invalidateQueries({ queryKey: [supplierKeys.all] });
    onSuccess();
  }

  const createMutation = useMutation({
    mutationFn: CreateSupplier,
    onSuccess: () => {
      InvalidateAndClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSupplierPayload) =>
      updateSupplier(suppId!, payload),
    onSuccess: () => {
      InvalidateAndClose();
    },
  });

  if (mode === "edit" && isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>
  }

  if (mode === "edit" && !isSuccess) {
    return (
      <p className="text-sm text-red-500">Failed to fetch supplier data.</p>
    );
  }

  const supplier = mode === "edit" && isSuccess ? data : undefined;
  console.log(data)
  const isEdit = mode === "edit";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const InputCss =
    "py-1.5 px-2.5 rounded-md bg-stone-300/50 text-sm lg:text-base";

  function submitHandler(e: React.SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const raw = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      notes: formData.get("notes"),
    };
    if (mode === "new") {
      const result = CreateSupplierSchema.safeParse(raw);
      if (!result.success) {
        const flatten = z.flattenError(result.error);
        setFieldErrors(flatten.fieldErrors);
        return;
      }
      setFieldErrors({});
      createMutation.mutate(result.data);
    }
    if (mode === "edit") {
      const result = UpdateSupplierSchema.safeParse(raw);
      if (!result.success) {
        const flatten = z.flattenError(result.error);
        setFieldErrors(flatten.fieldErrors);
        return;
      }
      setFieldErrors({});
      updateMutation.mutate(result.data);
    }
  }

  return (
    <form className="flex flex-col gap-4 p-2.5 lg:p-4" onSubmit={submitHandler}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name">
          Supplier Name{" "}
          {fieldErrors.name ? (
            <span className="text-sm font-light text-red-500">
              {fieldErrors.name[0]}
            </span>
          ) : (
            <span className="text-sm font-light text-red-500/50">
              *required
            </span>
          )}
        </label>
        <input
          type="text"
          name="name"
          className={InputCss}
          defaultValue={supplier?.name ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="phone">
          Phone / WhatsApp{" "}
          {fieldErrors.phone ? (
            <span className="text-sm font-light text-red-500">
              {fieldErrors.phone[0]}
            </span>
          ) : (
            <span className="text-sm font-light text-red-500/50">
              *Must be a number
            </span>
          )}
        </label>
        <input
          type="text"
          name="phone"
          className={InputCss}
          defaultValue={supplier?.phone ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="address">Address</label>
        <textarea
          rows={2}
          name="address"
          className={InputCss}
          defaultValue={supplier?.address ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="notes">Notes</label>
        <input
          type="text"
          name="notes"
          className={InputCss}
          defaultValue={supplier?.notes ?? ""}
        />
      </div>
      <div className="flex items-center justify-center gap-2.5 md:gap-4">
        <button
          type="button"
          onClick={onSuccess}
          className="bg-gray-300 py-2 px-4 rounded-md"
        >
          Back
        </button>
        <button
          type="submit"
          className={`py-2 px-4 rounded-md ${
            isEdit
              ? "bg-yellow-500/70 hover:bg-yellow-500 active:bg-yellow-500"
              : "bg-green-500/70 hover:bg-green-500 active:bg-green-500"
          } hover:cursor-pointer disabled:bg-gray-400`}
          disabled={isPending}
        >
          {isPending
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
            ? "Update"
            : "+ Supplier"}
        </button>
      </div>
    </form>
  );
}
