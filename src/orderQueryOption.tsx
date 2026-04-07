import { queryOptions } from "@tanstack/react-query";
import { getOrdersTodays, getOrderDetails, Order } from "./api/order";
import type { OrderQuery } from "./schema/order.schema";

export const orderKeys = {
    all: ["orders"] as const,
    cashier: (query: OrderQuery) => [...orderKeys.all, "cashier", query] as const,
    detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
}

export const orderCashierTodayOptions = (query: OrderQuery) => queryOptions({
    queryKey: orderKeys.cashier(query),
    queryFn: () => getOrdersTodays(query)
})

export const orderDetailOptions = (orderId: string) => queryOptions({
    queryKey: ["orders", "details", orderId],
    queryFn: () => getOrderDetails(orderId)
})