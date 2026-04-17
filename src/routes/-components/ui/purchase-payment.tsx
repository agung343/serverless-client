import { useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatRupiah } from "~/lib/rupiah_currency";
import { createPurchase } from "~/api/purchase";
import { CreatePurchaseSchema } from "~/schema/purchase.schema";
import { purchaseKeys } from "~/queries/purchaseQueryOptions";
import type { PurchaseItems } from "~/lib/purchase";
import SupplierSelect from "./supplier-select";

interface PaymentProps {
    items: PurchaseItems[]
    onSuccess: () => void
}

export default function PurchasePayment({items, onSuccess}: PaymentProps) {
    const queryClient = useQueryClient()
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
    const [stocked, setStocked] = useState(false)
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.cost, 0)
    
    const paymentMutation = useMutation({
        mutationFn: createPurchase,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: purchaseKeys.all})
            onSuccess()
        }
    })

    function handleSubmot(e: React.SubmitEvent) {
        e.preventDefault()
        
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const result = CreatePurchaseSchema.safeParse({
            invoiceNumber: formData.get("invoiceNumber"),
            date: formData.get("date"),
            notes: formData.get("notes"),
            supplierId: formData.get("supplier"),
            addToStock: formData.get("addToStock"),
            items: formData.get("items"),
            paid: formData.get("paid"),
            totalAmount
        })
        if (!result.success) {
            const flatten = z.flattenError(result.error)
            setFieldErrors(flatten.fieldErrors)
            return;
        }
        setFieldErrors({})
        const payload = result.data
        paymentMutation.mutate(payload)
    }
    return (
        <div className="flex flex-col p-4">
            <h2 className="text-xl lg:text-2xl font-bold mb-2.5">Purchase Payment</h2>
            <form className="flex flex-col gap-2.5 lg:gap-4" onSubmit={handleSubmot}>
                <input type="hidden" name="items" value={JSON.stringify(items)} />
                <div className="flex flex-col gap-2">
                    <label htmlFor="invoice" className="text-sm lg:text-base font-semibold text-neutral-800/70">Invoice Number</label>
                    <input type="text" name="invoiceNumber" className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light" />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="date" className="text-sm lg:text-base font-semibold text-neutral-800/70">Purchase Date</label>
                    <input type="date" name="date" className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light" />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="supplier" className="text-sm lg:text-base font-semibold text-neutral-800/70">Supplier</label>
                    <SupplierSelect />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="addToStock" className="text-sm lg:text-base font-semibold text-neutral-800/70">Add to Stock</label>
                    <div className="flex gap-4">
                        <button type="button" className={`${!stocked ? "bg-red-500" : "bg-neutral-100"} py-1.5 px-2.5 rounded-xl text-sm font-semibold`} onClick={() => setStocked(false)}>No</button>
                        <button type="button" className={`${stocked ? "bg-green-500" : "bg-neutral-100"} py-1.5 px-2.5 rounded-xl text-sm font-semibold`} onClick={() => setStocked(true)}>Yes</button>
                    </div>
                    <input type="hidden" name="addToStock" value={stocked.toString()} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="notes" className="text-sm lg:text-base font-semibold text-neutral-800/70">Note</label>
                    <input type="text" name="notes" className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light" />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="paid" className="text-sm lg:text-base font-semibold text-neutral-800/70">Paid</label>
                    <input type="text" name="paid" className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light" />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="total" className="text-sm lg:text-base font-semibold text-neutral-800/70">Total</label>
                    <input type="text" readOnly className="py-1.5 px-2.5 rounded-md border bg-neutral-100 text-sm lg:text-base font-light" defaultValue={formatRupiah(totalAmount)} />
                </div>       
                <div className="flex justify-center">
                    <button className="py-2 px-4 font-semibold rounded-md bg-green-600">Save Purchase</button>
                </div>
            </form>
        </div>
    )
}