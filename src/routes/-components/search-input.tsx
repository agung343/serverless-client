interface Props {
  label: string;
  defaultValue?: string;
  onChange: (value: string) => void;
}

export default function SearchInput({ label, defaultValue, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 lg:gap-2.5">
      <label htmlFor={label.toLowerCase()} className="font-medium">
        {label}
      </label>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className="py-1 px-2.5 rounded-md bg-stone-300/50 border border-stone-800 text-stone-800"
      />
    </div>
  );
}
