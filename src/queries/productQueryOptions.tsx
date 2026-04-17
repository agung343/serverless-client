import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getAllProducts, getProductDetail, getProductsCashier } from "../api/product";
import { getStockMovement } from "../api/stock";
import type { ProductQuery, ProductCashierQuery } from "../schema/product.schema";
import { StockQuery } from "../schema/stock.schema";


export const productKeys = {
    all: ["products"] as const,
    list: (query: ProductQuery) => [...productKeys.all, "list", query] as const,
    cashier: (query: ProductCashierQuery) => [...productKeys.all, "cashier", query.search] as const,
    detail: (productId: string) => [...productKeys.all, "detail", productId] as const,
    stock: (query: StockQuery) => [...productKeys.all, "stock", query] as const
}

export const productQueryOptions = (query: ProductQuery) => queryOptions({
    queryKey: productKeys.list(query),
    queryFn: () => getAllProducts(query)
})


export const productDetailsQueryOptions = (productId: string) => queryOptions({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductDetail(productId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5
})

export const productCashierQueryOptions = (query: ProductCashierQuery) => queryOptions({
    queryKey: productKeys.cashier(query),
    queryFn: () => getProductsCashier(query)
})

export const stockQueryOptions = (query: StockQuery) => queryOptions({
    queryKey: productKeys.stock(query),
    queryFn: () => getStockMovement(query),
    placeholderData: keepPreviousData
})