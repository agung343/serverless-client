import { queryOptions } from "@tanstack/react-query";
import { getFindProductsSupplier } from "~/api/purchase";
import type { CreatePurchaseQuery } from "~/schema/purchase.schema";

export const purchaseKeys = {
    all: ["purchase"] as const,
    find: (query: CreatePurchaseQuery) => [...purchaseKeys.all, "find", query] as const,
}

export const FindSupplierAndProductsOption = (query: CreatePurchaseQuery) => queryOptions({
    queryKey: purchaseKeys.find(query),
    queryFn: () => getFindProductsSupplier(query),
    enabled: !!query.product,
    gcTime: 1000 * 60 * 10,
})