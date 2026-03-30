export function formatUnit(stock:string) {
    return parseFloat(parseFloat(stock).toFixed(3)).toString()
}