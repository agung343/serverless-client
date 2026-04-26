import { api } from "./client";
import { toApiError } from "~/lib/error";
import type { StockQuery, AdjustStockPayload } from "~/schema/stock.schema";

export type StockReturn = {
    products: {
        id: string
        date: Date
        name: string
        type: string
        note?: string
        quantity: string
        referenceId: string
        checked: string
    }[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}

export const getStockMovement = async (params: StockQuery) => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set("search", params.search)
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.startDate) searchParams.set("startDate", params.startDate)
    if (params.endDate) searchParams.set("endDate", params.endDate)

    try {
        const res = await api.get<StockReturn>(`/inventory/stock?${searchParams.toString()}`)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const adjustStock = async (productId: string, payload: AdjustStockPayload) => {
    try {
        const res = await api.post(`/inventory/stock/${productId}`, payload)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}