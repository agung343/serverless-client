import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getFindProductsSupplier, getAllPurchases } from "~/api/purchase";
import type { CreatePurchaseQuery, PurchaseQuery } from "~/schema/purchase.schema";

export const purchaseKeys = {
    all: ["purchase"] as const,
    find: (query: CreatePurchaseQuery) => [...purchaseKeys.all, "find", query] as const,
    list: (query: PurchaseQuery) => [...purchaseKeys.all, "list", query] as const,
}

export const FindSupplierAndProductsOption = (query: CreatePurchaseQuery) => queryOptions({
    queryKey: purchaseKeys.find(query),
    queryFn: () => getFindProductsSupplier(query),
    enabled: !!query.product,
    gcTime: 1000 * 60 * 10,
})

export const SuppliersQueryOption = (query: PurchaseQuery = {page: 1, limit: 25}) => queryOptions({
    queryKey: purchaseKeys.list(query),
    queryFn: () => getAllPurchases(query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
})