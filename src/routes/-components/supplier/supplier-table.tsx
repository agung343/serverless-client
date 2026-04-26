import { type Supplier, getSupplierDetail } from "~/api/supplier";
import { supplierKeys } from "~/queries/supplierQueryOptions";
import { usePrefetch } from "~/hooks/usePrefetch";
import { Link } from "@tanstack/react-router";

interface TableProps {
  suppliers: Supplier[];
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  tenant: string
}

export default function SuppliersTable({ suppliers, onEdit, onDelete, tenant }: TableProps) {
  const prefetch = usePrefetch();
  const tableHeadClasses =
    "p-2 border dark:border-stone-100 font-semibold text-center";
  const tableRowsClasses = "p-2 border dark:border-stone-100";
  return (
    <table className="border min-w-3/5 border-blue-200 dark:text-stone-800">
      <thead className="bg-gray dark:bg-blue-400 font-semibold lg:text-lg sticky top-0 z-10">
        <tr>
          <th className={`${tableHeadClasses} w-64`}>Name</th>
          <th className={`${tableHeadClasses} w-32`}>Phone</th>
          <th className={`${tableHeadClasses} w-64`}>Address</th>
          <th className={`${tableHeadClasses} w-64`}>Note</th>
          <th className={`${tableHeadClasses}`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supp) => (
          <tr
            key={supp.id}
            className="font-light text-sm lg:text-base odd:bg-gray-100 even:bg-gray-200"
          >
            <td className={`${tableRowsClasses}`}>{supp.name}</td>
            <td className={`${tableRowsClasses}`}>
              {supp.phone ?? <span className="italic">Nothing yet</span>}
            </td>
            <td className={`${tableRowsClasses}`}>
              {supp.address ?? <span className="italic">Nothing yet</span>}
            </td>
            <td className={`${tableRowsClasses}`}>
              {supp.notes ?? <span className="italic">Nothing yet</span>}
            </td>
            <td className={`${tableRowsClasses}`}>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  onClick={() => onEdit(supp.id)}
                  onMouseEnter={() => {
                    prefetch([
                      {
                        queryKey: supplierKeys.detail(supp.id),
                        queryFn: () => getSupplierDetail(supp.id),
                        staleTime: 1000 * 60 * 5,
                      },
                    ]);
                  }}
                  className="bg-gray-300/50 py-1.5 px-2.5 rounded-md text-sm active:bg-gray-300 hover:bg-gray-300 hover:cursor-pointer"
                >
                  View/Edit
                </button>
                <button
                  onClick={() => onDelete(supp.id)}
                  className="bg-red-500/50 text-gray-100 py-1.5 px-2.5 rounded-md text-sm active:bg-red-500 hover:bg-red-500 hover:cursor-pointer"
                >
                  Delete
                </button>
                <Link
                  to={`/$tenant/supplier/history/$id`}
                  params={{ tenant, id: supp.id }}
                  search={{
                    page: 1,
                    limit: 25
                  }}
                  preload="intent"
                  className="bg-green-300 py-1.5 px-2.5 rounded-md text-sm active:bg-green-500 hover:bg-gren-400 hover:cursor-pointer"
                >
                  History
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
