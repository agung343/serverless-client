import { api } from "./client";
import type { CreateNewExpenseOperationalPayload, ExpenseQuery } from "~/schema/expense.schema";
import { ApiError } from "~/lib/error";

export type ExpenseOperational = {
    id: string
    name: string
    amount: number
    description?: string
    date: Date
}

export type ExpensesOperationalReturn = {
    operationals: ExpenseOperational[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}

const toApiError = (error:any): ApiError => {
    const message = error.data?.message || "Something went wrong";
    const status = error.status;
    const details = error.data?.details;
    return new ApiError(message, status, details)
}

export const getOperationals = async (params: ExpenseQuery) => {
    const searchParams = new URLSearchParams()

    if (params.search) searchParams.set("search", params.search)
    if (params.page !== undefined) searchParams.set("page", String(params.page))
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit))
    if (params.startDate) searchParams.set("startDate", params.startDate)
    if (params.endDate) searchParams.set("endDAte", params.endDate)
    
    try {
        const res = await api.get<ExpensesOperationalReturn>(`/expenses/operational?${searchParams.toString()}`)
        console.log(res.data)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const createOperational = async (payload: CreateNewExpenseOperationalPayload) => {
    try {
        const res = await api.post("/expenses/operational", payload)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}