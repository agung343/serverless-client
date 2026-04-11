export function formatRupiah(text: string | number): string {
    const amount = typeof text === "number" ? text : parseFloat(text.replace(/[0-9.-]+/g, ""))
    if (isNaN(amount)) {
        return "Rp. 0"
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount)
}