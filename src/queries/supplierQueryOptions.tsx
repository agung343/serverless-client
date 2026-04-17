import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { getSuppliers, getSupplierDetail, getSupplierHistory, getSupplierSelect } from "../api/supplier";
import type { SupplierQuery, SupplierHistoryQuery } from "../schema/supplier.schema";
import type { CreatePurchaseQuery } from "../schema/purchase.schema";

export const supplierKeys = {
    all: ["supplier"] as const,
    list: (query: SupplierQuery) => [...supplierKeys.all, "list", query] as const,
    history: (suppId: string, query: SupplierHistoryQuery) => [...supplierKeys.all, "history", suppId, query] as const,
    detail: (suppId: string) => [...supplierKeys.all, "detail", suppId] as const,
    purchase: (query: CreatePurchaseQuery) => [...supplierKeys.all, "purchase", query] as const,
}

export const suppliersQueryOption = (query: SupplierQuery) => queryOptions({
    queryKey: supplierKeys.list(query),
    queryFn: () => getSuppliers(query),
    staleTime: 1000 * 60 * 5
})

export const supplierHistoryQueryOption = (suppId: string, query: SupplierHistoryQuery) => queryOptions({
    queryKey: supplierKeys.history(suppId, query),
    queryFn: () => getSupplierHistory(suppId, query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})

export const supplierDetailOption = (suppId: string) => queryOptions({
    queryKey: supplierKeys.detail(suppId),
    queryFn: () => getSupplierDetail(suppId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})

export const supplierSelectQueryOption = () => queryOptions({
    queryKey: ["supplier", "select"],
    queryFn: () => getSupplierSelect()
})