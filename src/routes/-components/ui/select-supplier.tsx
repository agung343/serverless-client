interface Props {
  suppliers: {
    id: string;
    name: string;
  }[];
}

export default function SupplierSelect({ suppliers }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="supplier">Select Supplier:</label>
      <select name="supplier">
        <option value={""}>Pilih Supplier</option>
        {suppliers.map((supp) => (
          <option key={supp.id} value={supp.id}>
            {supp.name}
          </option>
        ))}
      </select>
    </div>
  );
}
