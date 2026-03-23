import { queryOptions } from "@tanstack/react-query";
import { getAllProducts } from "./product";
import { ProductQuery } from "./product";

export const productQueryOptions = (query: ProductQuery) => queryOptions({
    queryKey: ["products", query.page, query.limit, query.search],
    queryFn: () => getAllProducts(query)
})