import { api } from "./client";
import { ApiError } from "~/lib/error";
import type { OrderQuery, CreateOrderPayload } from "~/schema/order.schema";

export type Order = {
  id: string;
  productId: string;
  name: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

export type Orders = {
  id: string;
  invoiceNumber: string;
  date: Date;
  status: string;
  totalAmount: string;
  paid: string;
  paymentType: string
  notes?: string;
};

export type OrdersReturn = {
  orders: Orders[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type OrderDetailsReturn = {
  id: string;
  invoice: string;
  date: Date;
  status: string;
  totalAmount: string;
  payment: string
  paid: string;
  notes?: string;
  items: Order[];
};

const toApiError = (error: any): ApiError => {
  const message = error.data?.message || "Something went wrong";
  const status = error.status;
  const details = error.data?.details;
  return new ApiError(message, status, details);
};

export const getOrdersTodays = async (params: OrderQuery) => {
    const searchParams = new URLSearchParams()
    if (params.invoice) searchParams.set("invoice", params.invoice)
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))
    
    try {
        const res = await api.get<OrdersReturn>(`/orders/today?${searchParams.toString()}`)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const getOrderDetails = async (orderId: string) => {
    try {
        const res = await api.get<OrderDetailsReturn>(`/orders/${orderId}`)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const createOrderCashier = async (payload: CreateOrderPayload) => {
    try {
        const res = await api.post("/orders/cashier", payload)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}