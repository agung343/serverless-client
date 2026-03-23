import { z } from "zod";
import { api } from "./client";
import { ApiError } from "./lib/error";

export type Product = {
    id: string
    name: string
    code: string
    category: {
        name: string
    }
    price: number
    cost: number
    stock: number
}

export type ProductsReturn = {
    products: Product[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export type ProductsForCashierReturn = {
    products: {
        id: string
        name: string
        code: string
        price: string
        cost: string
    }[]
}

export type CreateProductPayload = {
    name: string
    code: string
    categoryId: string
    price: number
    cost: number
    description?: string
}

export const PaginationProductSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25)
})

export type ProductQuery = z.infer<typeof PaginationProductSchema>

const toApiError = (error:any): ApiError => {
    const message = error.data?.message || "Something went wrong";
    const status = error.status;
    const details = error.data?.details;
    return new ApiError(message, status, details)
}

export const getAllProducts = async (params: ProductQuery) => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set("search", params.search)
    if (params.page !== undefined) searchParams.set("page", String(params.page))
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit))

    const url = `/inventory/products?${searchParams.toString()}`

    try {
        const res = await api.get<ProductsReturn>(url)
        return res.data
    } catch (error:any) {
        const message = error?.data.message || "Something went wrong"
        const status = error.status || 500;
        throw new Error(message, {cause: status}) 
    }
}

export const createNewProduct = async (payload: CreateProductPayload) => {
    try {
        const res = await api.post("/inventory/new-product", payload);
        console.log(res.data)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}