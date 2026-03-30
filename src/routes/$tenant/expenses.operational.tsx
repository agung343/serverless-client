import { useState } from "react";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { operationalOptions } from "~/expensesQueryOptions";
import { PaginationExpenseQuery } from "~/schema/expense.schema";
import { useDebounceCallback } from "~/hooks/debounce";
import { dateSummary } from "~/lib/date";
import { formatRupiah } from "~/lib/rupiah_currency";
import Modal from "../-components/modals";
import AddOperationalForm from "../-components/forms/add-operational";

export const Route = createFileRoute("/$tenant/expenses/operational")({
  validateSearch: PaginationExpenseQuery,
  loaderDeps: ({ search }) => ({
    search: search.search,
    page: search.page,
    limit: search.limit,
    startDate: search.startDate,
    endDate: search.endDate,
  }),
  loader: async ({
    context: { queryClient },
    deps: { search, page, limit, startDate, endDate },
  }) => {
    return queryClient.ensureQueryData(
      operationalOptions({ search, page, limit, startDate, endDate })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { search, page, limit, startDate, endDate } = useSearch({
    from: "/$tenant/expenses/operational",
  });
  const navigate = useNavigate({ from: "/$tenant/expenses/operational" });

  const { data } = useSuspenseQuery(
    operationalOptions({ search, page, limit, startDate, endDate })
  );

  const operationals = data.operationals;
  const meta = data.meta;

  const debounceSearch = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }),
    });
  }, 500);

  function handleChangePage(newPage: number) {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    });
  }

  function handleChangeLimit(newLimit: number) {
    navigate({
      search: (prev) => ({
        ...prev,
        limit: newLimit,
        page: 1,
      }),
    });
  }

  function handleChangeStartDate(startDate: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        startDate,
        page: 1,
      }),
    });
  }

  function handleChangeEndDate(endDate: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        endDate,
        page: 1,
      }),
    });
  }

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-center text-lg lg:text-3xl font-bold my-3">
        Operationals
      </h1>

      <div className="flex items-center justify-between text-sm lg:text-base">
        <div className="flex items-center gap-2">
          <label>Search</label>
          <input
            type="text"
            className="py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800 text-stone-800"
            defaultValue={search}
            onChange={(e) => debounceSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Date:</label>
          <input
            type="date"
            className="py-1 px-2.5 rounded-md bg-stone-300/50"
            value={startDate}
            onChange={(e) => handleChangeStartDate(e.target.value)}
          />
          <span> - </span>
          <input
            type="date"
            className="py-1 px-2.5 rounded-md bg-stone-300/50"
            value={endDate}
            onChange={(e) => handleChangeEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Rows:</label>
          <select
            value={limit}
            onChange={(e) => handleChangeLimit(+e.target.value)}
            className="py-1 px-2.5 rounded-md bg-stone-300/50 border-stone-800"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="flex justify-center my-2.5">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-green-500/50 font-semibold py-2 px-4 rounded-md hover:cursor-pointer active:bg-green-500 my-4 lg:my-5.5"
        >
          + Operational
        </button>
      </div>
      <div className="overflow-auto max-h-150 mt-4 md:mt-6">
        <table className="border border-collapse w-3/4 border-blue-200 mx-auto">
          <thead className="bg-gray-300 dark:bg-blue-300 font-semibold lg:text-lg stick top-0 z-10">
            <tr>
              <th className="p-2 border font-semibold dark-border-stone-100 text-center w-12">
                No
              </th>
              <th className="p-2 border font-semibold dark-border-stone-100 text">
                Name
              </th>
              <th className="p-2 border font-semibold dark-border-stone-100 text-center w-64">
                Date
              </th>
              <th className="p-2 border font-semibold dark-border-stone-100 text-center w-48">
                Amount
              </th>
              <th className="p-2 border font-semibold dark-border-stone-100 text">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {operationals.map((op, i) => (
              <tr key={op.id} className="font-light">
                <td className="p-2 border text-center">
                  {i + 1 + (page - 1) * limit}
                </td>
                <td className="p-2 border">{op.name}</td>
                <td className="p-2 border text-center">
                  {dateSummary(new Date(op.date))}
                </td>
                <td className="p-2 border text-right">
                  {formatRupiah(op.amount)}
                </td>
                <td className="p-2 border text-center">
                  {op.description || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <Modal open={isOpen} onClose={() => setIsOpen(false)}>
          <AddOperationalForm onSuccess={() => setIsOpen(false)} />
        </Modal>
      )}
    </main>
  );
}
