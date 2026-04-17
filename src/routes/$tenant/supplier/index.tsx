import { useState } from "react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { suppliersQueryOption, supplierKeys } from "~/queries/supplierQueryOptions";
import { SupplierQuerySchema } from "~/schema/supplier.schema";
import { getSuppliers } from "~/api/supplier";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { usePrefetch } from "~/hooks/usePrefetch";
import SearchInput from "~/routes/-components/ui/search-input";
import LimitSelect from "~/routes/-components/ui/limit-select";
import SuppliersTable from "~/routes/-components/supplier/supplier-table";
import Pagination from "~/routes/-components/ui/pagination";
import Modal from "~/routes/-components/modals";
import SupplierForm from "~/routes/-components/forms/supplier.form";

type ModalType = "new" | "edit" | "delete";

export const Route = createFileRoute("/$tenant/supplier/")({
  validateSearch: SupplierQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(suppliersQueryOption(deps));
  },
  component: SuppliersPage,
});

function SuppliersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const { name, page, limit } = useSearch({ from: "/$tenant/supplier/" });
  const { setPage, setSearch, setLimit } = useTableNavigation(Route.fullPath);
  const prefetch = usePrefetch();

  const { data } = useSuspenseQuery(
    suppliersQueryOption({ name, page, limit })
  );
  const suppliers = data.suppliers || [];
  const meta = data.meta;

  function closeModal() {
    setIsOpen(false);
    setModalType(null);
    setSelectedSupplierId(null);
  }

  function openNew() {
    setIsOpen(true);
    setModalType("new");
    setSelectedSupplierId(null);
  }

  function openEdit(id: string) {
    setIsOpen(true);
    setModalType("edit");
    setSelectedSupplierId(id);
  }

  function openDelete(id: string) {
    setIsOpen(true);
    setModalType("delete");
    setSelectedSupplierId(id);
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="flex justify-center my-4">
        <h1 className="text-2xl lg:text-4xl font-bold text-red-500/50">
          Suppliers.
        </h1>
      </div>
      <div className="flex items-center justify-between text-sm lg:text-base mb-4 md:mt-6">
        <SearchInput
          label="Name"
          defaultValue={name}
          onChange={(name) => setSearch("name", name)}
        />
        <button onClick={openNew} className="py-2 px-4 rounded-md bg-green-500/70 hover:bg-green-500 hover:cursor-pointer active:bg-grenn-500">
          + Supplier
        </button>
        <LimitSelect value={limit} onChange={(limit) => setLimit(limit)} />
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6 flex justify-center">
        <SuppliersTable
          suppliers={suppliers}
          onEdit={(id) => openEdit(id)}
          onDelete={(id) => openDelete(id)}
        />
      </div>
      <Pagination
        page={page}
        hasNextPage={meta.hasNextPage}
        onNextPage={() => setPage(page + 1)}
        hasPrevPage={meta.hasPrevPage}
        onPrevPage={() => setPage(page - 1)}
        onNextPrefetch={() => {
          prefetch([
            {
              queryKey: supplierKeys.list({ name, page: page + 1, limit }),
              queryFn: () => getSuppliers({ name, page: page + 1, limit }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
        onPrevPrefetch={() => {
          prefetch([
            {
              queryKey: supplierKeys.list({ name, page: page - 1, limit }),
              queryFn: () => getSuppliers({ name, page: page - 1, limit }),
              staleTime: 1000 * 60 * 5,
            },
          ]);
        }}
      />

      {isOpen && modalType === "new" && (
        <Modal open={isOpen} onClose={closeModal}>
          <SupplierForm mode="new" onSuccess={closeModal} />
        </Modal>
      )}

      {isOpen && selectedSupplierId && modalType === "edit" && (
        <Modal open={isOpen} onClose={closeModal}>
          <SupplierForm mode="edit" onSuccess={closeModal} suppId={selectedSupplierId} />
        </Modal>
      )}
      
    </main>
  );
}
