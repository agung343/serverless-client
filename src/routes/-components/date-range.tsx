interface Props {
    startValue?: string
    endValue?: string
    onChange: (startDate?: string, endDate?: string) => void
}

export default function DateRange({startValue, endValue, onChange}: Props) {
    return (
        <div className="flex items-center gap-2">
          <label htmlFor="dateRange" className="font-medium">
            Date Range:
          </label>
          <input
            type="date"
            value={startValue}
            onChange={(e) => onChange(e.target.value, endValue)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
          <span>-</span>
          <input
            type="date"
            value={endValue}
            onChange={(e) => onChange(startValue, e.target.value)}
            className="border rounded-md px-2 py-1 bg-stone-300/50 border-stone-800/50"
          />
        </div>
    )
}