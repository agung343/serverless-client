import { queryOptions } from "@tanstack/react-query";
import { getAllProducts, getProductDetail, getProductsCashier } from "./api/product";
import type { ProductQuery, ProductCashierQuery } from "./schema/product.schema";

export const productQueryOptions = (query: ProductQuery) => queryOptions({
    queryKey: ["products", query.page, query.limit, query.search],
    queryFn: () => getAllProducts(query)
})


export const productDetailsQueryOptions = (productId: string) => queryOptions({
    queryKey: ["product-detail", productId],
    queryFn: () => getProductDetail(productId)
})

export const productCashierQueryOptions = (query: ProductCashierQuery) => queryOptions({
    queryKey: ["products-cashier", query.search],
    queryFn: () => getProductsCashier(query)
})