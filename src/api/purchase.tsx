import { api } from "./client";
import { toApiError } from "~/lib/error";
import { Meta } from "~/lib/meta";
import { type CreatePurchaseQuery, CreatePurchasePayload, PurchaseQuery, ArchievePurchasePayload } from "~/schema/purchase.schema";

export type FindProductsSupplierReturn = {
  products: {
    id: string;
    name: string;
    cost: number
    code: string
  }[];
  suppliers: {
    id: string;
    name: string;
  }[];
};

export type Purchase = {
  id: string
  invoice: string
  date: string
  totalAmount: string
  paid: string
  status: string
  supplier: string
}

export type PurchaseItems = {
  items: {
    id: string
    name: string
    quantity: string
    unit: string
    unitCost: string
    total: string
  }[]
}

export type PurchasesReturn = {
  purchases: Purchase[]
  meta: Meta
}

export type PurchaseDetailReturn = Purchase & PurchaseItems & {
  notes?: string
}

export const getAllPurchases = async (params: PurchaseQuery = {
  page: 1,
  limit: 25
}) => {
  const searchParams = new URLSearchParams()
  if (params.invoice) searchParams.set("invoice", params.invoice)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.startDate) searchParams.set("startDate", params.startDate)
  if (params.endDate) searchParams.set("endDate", params.endDate)

  try {
    const res = await api.get<PurchasesReturn>(`/purchases?${searchParams.toString()}`)
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
} 

export const getPurchaseDetail = async (purchaseId: string) => {
  try {
    const res = await api.get<PurchaseDetailReturn>(`/purchases/${purchaseId}`)
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const getPurchaseArchieve = async (params: PurchaseQuery = {page: 1, limit: 25}) => {
  const searchParams = new URLSearchParams()
  if (params.invoice) searchParams.set("invoice", params.invoice)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.startDate) searchParams.set("startDate", params.startDate)
  if (params.endDate) searchParams.set("endDate", params.endDate)
  
  try {
    const res = await api.get<PurchasesReturn>(`/purchases/archieve?${searchParams.toString()}`)
    return res.data    
  } catch (error) {
    throw toApiError(error)
  }
}

export const getFindProductsSupplier = async (params: CreatePurchaseQuery = {}) => {
  const searchParams = new URLSearchParams();
  if (params.product) searchParams.set("product", params.product);
  if (params.supplier) searchParams.set("supplier", params.supplier);

  try {
    const res = await api.get<FindProductsSupplierReturn>(
      `/purchases/find?${searchParams.toString()}`
    );
    return res.data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const createPurchase = async (payload: CreatePurchasePayload) => {
  try {
    const res = await api.post(`/purchases`, payload)
    console.log(res)
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const archievePurchase = async (purchaseId:string, payload: ArchievePurchasePayload) => {
  try {
    const res = await api.patch(`/purchases/${purchaseId}`, payload)
    return res.data
  } catch (error:any) {
    throw toApiError(error)
  }
}
