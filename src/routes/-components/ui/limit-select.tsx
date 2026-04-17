interface Props {
    value: number
    options?: number[]
    onChange: (limit: number) => void
}

export default function LimitSelect({value, options=[25, 50, 100], onChange}: Props) {
    return (
        <div className="flex items-center gap-2">
          <label htmlFor="limit" className="font-medium">
            Items per page:
          </label>
          <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
    )
}