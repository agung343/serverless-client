import { api } from "./client";
import { ApiError } from "~/lib/error";
import type { OrderQuery, CreateOrderPayload, EditOrderPayload, DeleteOrderPayload } from "~/schema/order.schema";
import type { Meta } from "~/lib/meta";

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

export type Sale = Omit<Orders, "paid">
export type SalesReturn = {
  sales: Sale[]
  meta: Meta
}

export type OrdersReturn = {
  orders: Orders[];
  meta: Meta
};

export type OrderDetailsReturn = {
  order: {
    id: string;
    invoice: string;
    date: Date;
    status: string;
    totalAmount: string;
    paymentType: string
    paid: string;
    notes?: string;
    items: Order[];
  }
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

export const getAllSales = async (params: OrderQuery) => {
  const searchParams = new URLSearchParams()
  if (params.invoice) searchParams.set("invoice", params.invoice)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.startDate) searchParams.set("startDate", params.startDate)
  if (params.endDate) searchParams.set("endDate", params.endDate)

  try {
    const res = await api.get<SalesReturn>(`/sales?${searchParams.toString()}`)
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const getSalesArchieve = async (params: OrderQuery) => {
  const searchParams = new URLSearchParams()
  if (params.invoice) searchParams.set("invoice", params.invoice)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))

  try {
    const res = await api.get<SalesReturn>(`/sales/archieve?${searchParams.toString()}`)
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

export const archieveSale = async (orderId: string, payload: DeleteOrderPayload) => {
  try {
    const res = await api.patch(`/sales/${orderId}/delete`, payload)
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const editOrder =  async (orderId: string, payload: EditOrderPayload) => {
  try {
    const res = await api.patch(`/sales/${orderId}`, payload)
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}