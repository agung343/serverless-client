import { useState } from "react";
import { createFileRoute, ErrorComponentProps } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { usersQueryOptions } from "../../queries/usersQueryOptions";
import { deleteUser, type User } from "../../api/users";
import Modal from "../-components/modals";
import AddStaffForm from "../-components/staff/add-staff.form";
import EditStaffForm from "../-components/staff/edit-staff.form";

type ModalType = "edit" | "delete" | "add" | null;

export const Route = createFileRoute("/$tenant/admin")({
  loader: async ({ context: { queryClient }, params: { tenant } }) => {
    return queryClient.ensureQueryData(usersQueryOptions());
  },
  component: AdminComponents,
});

export function UsersErrorComponents({ error }: ErrorComponentProps) {
  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <div className="mx-auto flex flex-col items-center justify-center">
        <h1 className="text-xl lg:text-2xl font-semibold text-stone-700">
          {error.cause === 500
            ? "Internal Server Error"
            : "Something went wrong"}
        </h1>
        <p className="text-sm lg:text-base mt-2 text-stone-700/50">
          Please refresh again later.
        </p>
      </div>
    </main>
  );
}

function AdminComponents() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const queryClient = useQueryClient();

  function closeModal() {
    setIsOpen(false);
    setSelectedUser(null);
    setModal(null);
    setDeleteError(null)
  }

  function openAddModal() {
    setIsOpen(true);
    setSelectedUser(null);
    setModal("add");
  }

  function openDeleteModal(user: User) {
    setIsOpen(true);
    setSelectedUser(user);
    setModal("delete");
  }

  function openEditModal(user: User) {
    setIsOpen(true);
    setSelectedUser(user);
    setModal("edit");
  }

  const { data } = useSuspenseQuery(usersQueryOptions());

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (err:any) => {
      setDeleteError(err.message)
    }
  });

  const users = data.users || [];

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-xl lg:text-3xl my-3">Staff: </h1>
      <button
        onClick={() => openAddModal()}
        className="bg-blue-500/50 py-2 px-4 rounded-md text-stone-800/70"
      >
        + New Staff
      </button>
      <table className="border border-collapse min-w-full border-gray-200 mt-4 lg:mt-6">
        <thead className="bg-gray-300 ">
          <tr>
            <th className="p-2.5 font-semibold text-left">Username</th>
            <th className="p-2.5 px-4 font-semibold text-left">Role</th>
            <th className="p-2.5 px-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-200">
              <td className="p-2.5 font-light text-left">{u.username}</td>
              <td className="p-2.5 font-light text-left">{u.role}</td>
              <td className="p-2.5">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEditModal(u)}
                    className="py-2 px-4 rounded-md hover:cursor-pointer bg-gray-300/50 text-stone-800 active:bg-gray-300"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => openDeleteModal(u)}
                    className="py-2 px-4 rounded-md hover:cursor-pointer bg-red-500/50 text-stone-100 active:bg-red-500"
                  >
                    DELETE
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={isOpen} onClose={closeModal}>
        {modal === "delete" && selectedUser && (
          <>
            <h2 className="lg:text-lg font-semibold">DELETE STAFF</h2>
            <p className="font-semibold text-sm lg:text-base text-gray-500/50">
              Are you sure deleting {selectedUser.username}?
            </p>
            {deleteError && (
              <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500  text-red-700 text-sm">
                {deleteError}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-4">
              <button
                className="rounded-md border py-2 px-4"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedUser.id)}
                className="py-2 px-4 bg-red-500/50 rounded-md text-zinc-50/50 hover:bg-red-500 hover:text-zinc-100 hover:cursor-pointer active:bg-red-500 active:text-zinc-50"
                disabled={deleteMutation.isPending || typeof deleteError === "string"}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        )}
        {modal === "add" && <AddStaffForm onSuccess={closeModal} />}
        {modal === "edit" && selectedUser && (
          <EditStaffForm onSuccess={closeModal} user={selectedUser} />
        )}
      </Modal>
    </main>
  );
}
