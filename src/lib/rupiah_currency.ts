export function formatRupiah(text: string | number): string {
    const amount = typeof text === "string" ? Number(text.replace(/, /g, "").trim()) : text
    if (isNaN(amount)) {
        return "Rp. 0"
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount)
}