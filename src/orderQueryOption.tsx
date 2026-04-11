import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getAllSales, getOrdersTodays, getOrderDetails, Order, getSalesArchieve } from "./api/order";
import type { OrderQuery } from "./schema/order.schema";

export const orderKeys = {
    all: ["orders"] as const,
    sales: (query: OrderQuery) => [...orderKeys.all, "sales", query] as const,
    cashier: (query: OrderQuery) => [...orderKeys.all, "cashier", query] as const,
    detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
    archieve: (query: OrderQuery) => [...orderKeys.all, "archieve", query] as const
}

export const getAllSalesOptions = (query: OrderQuery) => queryOptions({
    queryKey: orderKeys.sales(query),
    queryFn: () => getAllSales(query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})

export const orderCashierTodayOptions = (query: OrderQuery) => queryOptions({
    queryKey: orderKeys.cashier(query),
    queryFn: () => getOrdersTodays(query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})

export const orderDetailOptions = (orderId: string) => queryOptions({
    queryKey: ["orders", "details", orderId],
    queryFn: () => getOrderDetails(orderId),
    staleTime: 1000 * 60 * 5,
    enabled: !!orderId,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
})

export const getSalesArchieveOptions = (query: OrderQuery) => queryOptions({
    queryKey: orderKeys.archieve(query),
    queryFn: () => getSalesArchieve(query),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})