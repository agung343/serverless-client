import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ReportQuerySchema } from "~/schema/report.schema";
import { dashboardQueryOptions } from "~/queries/reportQueryOption";
import { useTableNavigation } from "~/hooks/useTableNavigation";
import { formatRupiah } from "~/lib/rupiah_currency";
import DateRange from "~/routes/-components/ui/date-range";
import InventoryDashboardTable from "~/routes/-components/tables/inventory-dashboard.table";

export const Route = createFileRoute("/$tenant/report/")({
  validateSearch: ReportQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(dashboardQueryOptions(deps));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({ from: "/$tenant/report/" });
  const query = useSearch({ from: "/$tenant/report/" });
  const { setDateRange } = useTableNavigation(Route.fullPath);

  const { data } = useSuspenseQuery(dashboardQueryOptions(query));
  const trends = data.trends || [];
  const limitedStock = data.limitedStock || [];
  const mostSold = data.mostSold || [];
  const topRevenue = data.topRevenue || [];
  const { ordersCard, purchaseCard, operasionalCard } = data;
  console.log(data);

  function setRange(range: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        range: range,
        startDate: undefined,
        endDate: undefined,
      }),
    });
  }

  return (
    <main className="p-2.5 lg:p-4">
      <h1 className="text-2xl lg:text-4xl font-bold my-2.5 lg:my-5">
        Dashboard
      </h1>
      <div className="flex items-center gap-8">
        <DateRange
          startValue={query.startDate}
          endValue={query.endDate}
          onChange={setDateRange}
        />
        <p className="font-semibold text-sm">OR</p>
        <div className="flex items-center gap-2">
          <label>Range: </label>
          <select
            name="range"
            defaultValue={query.range}
            className="text-sm lg:text-base py-1.5 px-2.5 rounded-md border border-neutral-300/50"
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
      <div className="flex items-start justify-around my-4">
        <div className="bg-yellow-500/70 p-2 rounded-md">
          <h2 className="text-lg lg:text-xl font-semibold">Sales</h2>
          <p className="text-sm lg:text-base mt-2 text-stone-700/50">
            Net Sales: {formatRupiah(ordersCard.totalAmount)}
          </p>
          <p className="text-sm lg:text-base mt-2 text-stone-700/50">
            Sales Count: {ordersCard.count}
          </p>
        </div>
        <div className="bg-sky-500/70 p-2 rounded-md">
          <h2 className="text-lg lg:text-xl font-semibold">Purchases</h2>
          <p className="text-sm lg:text-base mt-2 text-stone-700/50">
            Paid: {formatRupiah(purchaseCard.paid)}
          </p>
          <p className="text-sm lg:text-base mt-2 text-stone-700/50">
            Total Amount: {formatRupiah(purchaseCard.totalAmount)}
          </p>
        </div>
        <div className="bg-red-400/50 p-2 rounded-md">
          <h2 className="text-lg lg:text-xl font-semibold">Operasional</h2>
          <p className="text-sm lg:text-base mt-2 text-stone-700/50">
            Total: {formatRupiah(operasionalCard.totalAmount)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-4 my-4">
        <div className="p-4 mx-auto space-y-4">
          <h1 className="text-2xl lg:text-4xl font-bold mb-5.5">
            Transaction Trends
          </h1>
          <LineChart
            style={{ width: 800, height: 600, aspectRatio: 1 }}
            data={trends}
            responsive
            margin={{ top: 20, right: 50, bottom: 5, left: 0 }}
          >
            <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10c420"
              strokeWidth={2}
              name="Sales"
            />
            <Line
              type="monotone"
              dataKey="purchases"
              stroke="#ff0000"
              strokeWidth={2}
              name="Purchases"
            />
            <XAxis dataKey="month" />
            <YAxis
              width="auto"
              label={{
                value: "Total Amount",
                position: "insideLeft",
                angle: -90,
              }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            />
            <Legend align="right" />
            <Tooltip
              formatter={(value) => {
                if (typeof value !== "number") return value ?? "";
                return formatRupiah(value);
              }}
            />
          </LineChart>
          <h1 className="text-2xl lg:text-4xl font-bold mb-5.5">
            Operational Trends
          </h1>
          <LineChart
            style={{ width: 800, height: 600, aspectRatio: 1 }}
            responsive
            margin={{ top: 20, right: 50, bottom: 5, left: 0 }}
            data={trends}
          >
            <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#2c3abe"
              strokeWidth={2}
              name="Operasional"
            />
            <XAxis dataKey="month" />
            <YAxis
              width="auto"
              label={{
                value: "Total Amount",
                position: "insideLeft",
                angle: -90,
              }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
            />
            <Legend align="right" />
            <Tooltip
              formatter={(value) => {
                if (typeof value !== "number") return value ?? "";
                return formatRupiah(value);
              }}
            />
          </LineChart>
        </div>
        <div className="space-y-2.5 md:space-y-4 overflow-y-auto p-2.5 lg:p-4 max-h-180">
          <InventoryDashboardTable
            title="Limited Stock"
            head="Stock"
            valueKey="stock"
            items={limitedStock}
          />
          <InventoryDashboardTable
            title="Most Sold"
            head="Qty"
            valueKey="quantity"
            items={mostSold}
          />
          <InventoryDashboardTable
            title="Top Revenue"
            head="Total"
            valueKey="total"
            items={topRevenue}
          />
        </div>
      </div>
    </main>
  );
}
