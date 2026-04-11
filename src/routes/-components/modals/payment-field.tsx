import type { PaymentMethods } from "../ui/cashier-payment";
import { formatRupiah } from "~/lib/rupiah_currency";

interface PaymentFieldProps {
  payment: PaymentMethods;
  paid: number;
  onPaidAmount: (amount: string) => void;
  totalAmount: number;
  changes: number;
  fieldErrors: Record<string, string[]>;
  onSubmit: (e: React.SubmitEvent) => void;
  onCancel: () => void;
  isEdit: boolean;
}

export default function PaymentField({
  payment,
  paid,
  onPaidAmount,
  totalAmount,
  changes,
  fieldErrors,
  onSubmit,
  onCancel,
  isEdit,
}: PaymentFieldProps) {
  return (
    <main className="md:min-w-md">
      <div className="flex justify-center">
        <h2 className="text-xl lg:text-2xl font-bold mb-2.5 lg:mb-4">
          {payment?.toUpperCase()} Payment
        </h2>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="paid" className="w-3/10">
            Paid Amount
          </label>
          <input
            type="text"
            name="paid"
            value={payment === "cash" ? paid : totalAmount}
            onChange={(e) => onPaidAmount(e.target.value)}
            disabled={payment !== "cash"}
            className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300 font-semibold text-lg lg:text-xl"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="totalAmount" className="w-3/10">
            Total Amount
          </label>
          <input
            type="text"
            name="totalAmount"
            defaultValue={formatRupiah(totalAmount)}
            readOnly
            className="w-3/4 py-1.5 px-2.5 rounded-md bg-transparent font-semibold text-lg: lg:text-xl"
          />
        </div>
        {payment === "cash" && (
          <div className="flex items-center justify-between">
            <label htmlFor="changes" className="w-3/10">
              Changes
            </label>
            <input
              type="text"
              name="changes"
              value={formatRupiah(Math.max(changes, 0))}
              disabled
              className="w-3/4 py-1.5 px-2.5 rounded-md bg-transparent font-semibold text-lg: lg:text-xl"
            />
          </div>
        )}
        {payment === "card" && <CardField errors={fieldErrors} />}
        {payment === "e-money" && <EMoneyField />}
        {isEdit && (
          <div className="flex items-center justify-between">
            <label htmlFor="notes" className="w-3/10">
              Note{" "}
              {fieldErrors.notes ? (
                <span className="text-sm font-light text-red-500">
                  {fieldErrors.notes[0]}
                </span>
              ) : (
                <span className="text-sm font-light text-red-500/50">
                  *required
                </span>
              )}
            </label>
            <input type="text" name="notes" className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300 font-semibold text-lg lg:text-xl" />
          </div>
        )}
        <Buttons onCancel={onCancel} />
      </form>
    </main>
  );
}

function Buttons({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2.5 lg:gap-4">
      <button
        onClick={onCancel}
        type="button"
        className="py-1.5 lg:py-2 px-4 lg:px-2.5 rounded-2xl border border-stone-800/50 bg-transparent text-lg lg:text-xl font-semibold"
      >
        Back
      </button>
      <button
        type="submit"
        className="bg-green-500/70 py-2 px-4 rounded-2xl text-lg lg:text-xl hover:cursor-pointer active:bg-green-500"
      >
        Print order
      </button>
    </div>
  );
}

function CardField({ errors }: { errors: Record<string, string[]> }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <label htmlFor="digits" className="w-3/10">
          Last 4 digits{" "}
          {errors.cardLastFour && (
            <span className="text-sm font-light text-red-500/50">
              {errors.cardLastFour}
            </span>
          )}
        </label>
        <input
          type="text"
          name="card-digits"
          placeholder="XXXX"
          className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300/50 placeholder:italic"
        />
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor="approval" className="w-3/10">
          Reference No{" "}
          {errors.cardReference && (
            <span className="text-sm font-light text-red-500/50">
              {errors.cardReference}
            </span>
          )}
        </label>
        <input
          type="text"
          name="card-reference"
          placeholder="APV-XXXX"
          className="w-3/4 py-1.5 px-2.5 rounded-md bg-stone-300/50 placeholder:italic"
        />
      </div>
    </>
  );
}

function EMoneyField() {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor="platform" className="w-3/10">
        Select Platform
      </label>
      <select
        name="platform"
        className="w-3/4 py-1.5 px-2.5 rounded-md border border-stone-300/50"
      >
        <option value={"Flazz"}>Flazz BCA</option>
        <option value={"E-Money Mandiri"}>E-Money Mandiri</option>
        <option value={"Brizzi"}>Brizzi BRI</option>
        <option value={"Tapcash"}>Tapcash BNI</option>
      </select>
    </div>
  );
}
