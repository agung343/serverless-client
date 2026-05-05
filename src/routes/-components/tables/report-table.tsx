import type { SalesReportItem, PurchaseReportItem } from "~/api/report";
import { formatRupiah } from "~/lib/rupiah_currency";
import { formatUnit } from "~/lib/unit";
import { dateSummary } from "~/lib/date";

type ReportSalesTable = SalesReportItem[];
type ReportPurchaseTable = PurchaseReportItem[];

interface Props {
  mode: "sales" | "purchases";
  sales?: ReportSalesTable;
  purchases?: ReportPurchaseTable;
}

export default function ReportTable({ mode, sales, purchases }: Props) {
  return (
    <table className="w-full border border-collapse p-4">
      <thead className="bg-sky-300">
        <tr>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
            No
          </th>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
            Product
          </th>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
            Invoice
          </th>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
            Date
          </th>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center w-28">
            Quantity
          </th>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
            {mode === "sales" ? "Unit Price" : "Unit Cost"}
          </th>
          <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
            Total
          </th>
          {mode === "purchases" && (
            <th className="p-1.5 lg:p-2 border dark:border-neutral-100 font-semibold text-center">
              Status
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {mode === "sales" &&
          sales!.length > 0 &&
          sales!.map((item, index) => (
            <tr
              key={item.id}
              className="odd:bg-neutral-200 even:bg-neutral-100"
            >
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {index + 1}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-left">
                {item.product}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {item.invoice}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {dateSummary(new Date(item.date))}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {formatUnit(item.quantity)}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-right">
                {formatRupiah(item.unitPrice)}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-right">
                {formatRupiah(item.total)}
              </td>
            </tr>
          ))}
        {mode === "purchases" &&
          purchases!.length > 0 &&
          purchases!.map((item, index) => (
            <tr key={item.id}>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {index + 1}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-left">
                {item.product}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {item.invoice}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {dateSummary(new Date(item.date))}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center w-28">
                {formatUnit(item.quantity)}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-right">
                {formatRupiah(item.unitCost)}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-right">
                {formatRupiah(item.total)}
              </td>
              <td className="p-1.5 lg:p-2 text-sm border dark:border-neutral-100 text-center">
                {item.status}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
