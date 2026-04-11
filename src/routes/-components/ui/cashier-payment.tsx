export type PaymentMethods = "cash" | "qris" | "card" | "e-money" | null

interface PaymentOptions {
    type: PaymentMethods,
    label: string
    colorClass: string
}

const METHODS: PaymentOptions[] = [
    {type: "cash", label: "Cash", colorClass: "bg-green-500"},
    {type: "qris", label: "QRIS", colorClass: "bg-blue-500"},
    {type: "card", label: "Debit/Credit Card", colorClass: "bg-gray-500"},
    {type: "e-money", label: "E-Money", colorClass: "bg-purple-500"}
]

interface PaymentMethodProps {
    onSelect: (type: PaymentMethods) => void
    disabled: boolean
}

export default function CashierPayment({onSelect, disabled} : PaymentMethodProps) {
    return (<>
          <h2 className="text-xl lg:text-2xl font-bold rounded-md px-2">
            Payment Method
          </h2>
          <div className="grid grid-cols-2 gap-2 px-2 pb-2">
            {METHODS.map(method => (
                <button key={method.type} onClick={() => onSelect(method.type)} disabled={disabled} className={`w-full py-2 px-4 rounded-md ${method.colorClass} text-white font-semibold`}>
                    {method.label}
                </button>
            ))}
          </div>
    </>)
}