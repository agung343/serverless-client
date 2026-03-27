import { useState } from "react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { operationalExpensesQueryOptions } from "~/expensesQueryOptions";
import { PaginationOperationalSchema } from "~/schema/expenses.schema";
import { useDebounceCallback } from "~/hooks/debounce";
import { dateSummary } from "~/lib/date";
import Modal from "../-components/modals";
import AddExpenseOperationalForm from "../-components/forms/add-expenseOperational.form";
import { formatRupiah } from "~/lib/rupiah_currency";

export const Route = createFileRoute("/$tenant/expenses/operational")({
  validateSearch: PaginationOperationalSchema,
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
      operationalExpensesQueryOptions({
        search,
        page,
        limit,
        startDate,
        endDate,
      })
    );
  },
  component: ExpenseOperational,
});

function ExpenseOperational() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate({ from: "/$tenant/expenses/operational" });
  const { search, page, limit, startDate, endDate } = useSearch({
    from: "/$tenant/expenses/operational",
  });

  const debounceSearch = useDebounceCallback((value: string) => {
    navigate({
      search: (prev) => ({ ...prev, search: value || undefined, page: 1 }),
    });
  }, 500);

  function handleChangePage(newPage: number) {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  }

  function handleChangeLimit(newLimit: number) {
    navigate({
      search: (prev) => ({ ...prev, limit: newLimit, page: 1 }),
    });
  }

  function handleChangeDateRange(startDate?: string, endDate?: string) {
    navigate({
      search: (prev) => ({ ...prev, startDate, endDate, page: 1 }),
    });
  }

  const { data } = useSuspenseQuery(
    operationalExpensesQueryOptions({ search, page, limit, startDate, endDate })
  );
  const expenses = data.operationals || [];
  const meta = data.meta;

  return (
    <main className="p-4 lg:p-8 min-h-screen">
      <h1 className="text-xl lg:text-3xl font-bold mb-6 text-center text-blue-800/70">Operational Expenses</h1>
      <div className="flex items-center justify-between text-sm lg:text-base">
        <div className="flex items-center gap-2">
          <label htmlFor="search" className="font-medium">
            Search:
          </label>
          <input
            type="text"
            defaultValue={search}
            onChange={(e) => debounceSearch(e.target.value)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dateRange" className="font-medium">
            Date Range:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleChangeDateRange(e.target.value, endDate)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleChangeDateRange(startDate, e.target.value)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="limit" className="font-medium">
            Items per page:
          </label>
          <select
            value={limit}
            onChange={(e) => handleChangeLimit(Number(e.target.value))}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          >
            {[10, 25, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 px-4 py-2 rounded-md bg-green-500/50 hover:bg-green-500 active:bg-green-500 text-white"
        >
          Add Expense
        </button>
      </div>
      <table className="w-3/4 mx-auto mt-4 border-collapse">
        <thead className="bg-blue-300/50">
          <tr>
            <th className="border p-2 text-left w-54">Name</th>
            <th className="border p-2 text-center w-48">Amount</th>
            <th className="border p-2 text-center w-36">Date</th>
            <th className="border p-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="odd:bg-stone-100/50 even:bg-stone-200/50 text-sm lg:text-base">
              <td className="border p-2">{expense.name}</td>
              <td className="border p-2 text-right">
                {formatRupiah(expense.amount)}
              </td>
              <td className="border p-2 text-center">{dateSummary(new Date(expense.date))}</td>
              <td className="border p-2">{expense.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <span>
          Page {meta.page} of {meta.totalPages}
        </span>
        <div className="flex items-center gap-2">
        <button
            onClick={() => handleChangePage(page - 1)}
            disabled={!meta.hasPreviousPage}
            className="py-1 px-3 text-sm rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={!meta.hasNextPage}
            className="py-1 px-3 text-sm rounded-md bg-stone-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} open={isOpen}>
          <AddExpenseOperationalForm
            onSuccess={() => {
              setIsOpen(false);
              navigate({
                search: (prev) => ({ ...prev, page: 1 }),
              });
            }}
          />
        </Modal>
      )}
    </main>
  );
}
