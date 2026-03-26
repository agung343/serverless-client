import { queryOptions } from "@tanstack/react-query";
import { getAllProducts, getProductDetail } from "./api/product";
import type { ProductQuery } from "./schema/product.schema";

export const productQueryOptions = (query: ProductQuery) => queryOptions({
    queryKey: ["products", query.page, query.limit, query.search],
    queryFn: () => getAllProducts(query)
})


export const productDetailsQueryOptions = (productId: string) => queryOptions({
    queryKey: ["product-detail", productId],
    queryFn: () => getProductDetail(productId)
})