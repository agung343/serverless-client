import { formatRupiah } from "~/lib/rupiah_currency";
import { formatUnit } from "~/lib/unit";

interface Props {
  title: string;
  head: string; // "stock" or "sold" or "revenue"
  valueKey: string | number;
  items: Record<string, any>[];
}

export default function InventoryDashboardTable({
  title,
  head,
  valueKey,
  items,
}: Props) {
  return (
    <>
      <h1 className="text-xl lg:text-2xl font-semibold">{title}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border rounded-md text-sm text-left text-gray-500">
          <thead className="text-sm lg:text-base text-gray-700 uppercase bg-sky-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                {head}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="bg-white border-b">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {item.name}
                </th>
                <th
                  scope="row"
                  className={`px-6 py-4 font-medium text-gray-900 whitespace-nowrap ${
                    valueKey === "total" ? "text-right" : "text-center"
                  }`}
                >
                  {valueKey === "total"
                    ? formatRupiah(item[valueKey])
                    : formatUnit(item[valueKey])}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
