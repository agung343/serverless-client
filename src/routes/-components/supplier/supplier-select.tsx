import { useSuspenseQuery } from "@tanstack/react-query";
import { supplierSelectQueryOption } from "~/queries/supplierQueryOptions";

export default function SupplierSelect() {
    const {data} = useSuspenseQuery(supplierSelectQueryOption())
    const suppliers = data.suppliers || []

    return (<>
        <select name="supplier" className="text-sm lg:text-base py-1.5 px-2.5 rounded-md border border-neutral-300/50">
            {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
        </select>
    </>)
}