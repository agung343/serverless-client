interface Props {
    suppliers: {
        id: string
        name: string
    }[]
}

export default function SupplierSelect({suppliers}: Props) {
    return (<>
        <select name="supplier" className="text-sm lg:text-base py-1.5 px-2.5 rounded-md border border-neutral-300/50">
            {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
            ))}
        </select>
    </>)
}