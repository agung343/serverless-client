import { api } from "./client";

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
    categoryId: string
    price: number
    cost: number
    description?: string
}

export const getAllProducts = async () => {
    try {
        const res = await api.get<ProductsReturn>("/inventory/products")
        return res.data
    } catch (error:any) {
        const message = error?.data.message || "Something went wrong"
        const status = error.status || 500;
        throw new Error(message, {cause: status}) 
    }
}

