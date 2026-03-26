import { api } from "./client";
import { ApiError } from "./lib/error";
import type { CreateProductPayload, UpdateProductPayload, ProductQuery } from "./schema/product.schema";

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
    unit: string
}

export type ProductsReturn = {
    products: Product[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
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

export type ProductReturn = {
    name: string
    code: string
    category: {
        id: string
        name: string
    }
    price: number
    cost: number
    description?: string    
}

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
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const getProductDetail = async (productId: string) => {
    try {
        const res = await api.get<ProductReturn>(`/inventory/product/${productId}`)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const updateProduct = async (payload: UpdateProductPayload, productId: string) => {
    try {
        const res = await api.patch(`/inventory/edit/${productId}`, payload)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}