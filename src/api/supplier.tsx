import { api } from "./client";
import { toApiError } from "~/lib/error";
import type { Purchase } from "./purchase";
import type { Meta } from "~/lib/meta";
import type {
  SupplierQuery,
  SupplierHistoryQuery,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "~/schema/supplier.schema";

export type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export type SupplierReturn = {
  suppliers: Supplier[];
  meta: Meta;
};

export type SupplierHistoryReturn = {
  purchases: Purchase[];
  meta: Meta;
}

export const CreateSupplier = async (payload: CreateSupplierPayload) => {
  try {
    const res = await api.post("/supplier", payload);
    return res.data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const getSuppliers = async (params: SupplierQuery) => {
  const searchParams = new URLSearchParams();
  if (params.name) searchParams.set("name", params.name);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  try {
    const res = await api.get<SupplierReturn>(
      `/supplier?${searchParams.toString()}`
    );
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
};

export const getSupplierSelect = async () => {
  try {
    const res = await api.get<{suppliers: {id: string, name: string}[]}>("/supplier/select")
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const getSupplierDetail = async (suppId: string) => {
    try {
        const res = await api.get<Supplier>(`/supplier/${suppId}`)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const getSupplierHistory = async (supplierId: string, params: SupplierHistoryQuery) => {
    const searchParams = new URLSearchParams();
    if (params.invoice) searchParams.set("name", params.invoice);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.startDate) searchParams.set("startDate", params.startDate)
    if (params.endDate) searchParams.set("endDate", params.endDate)
        
    try {
        const res = await api.get<SupplierHistoryReturn>(`supplier/history/${supplierId}?${searchParams.toString()}`)
        console.log(res.data)
        return res.data
    } catch (error) {
        throw toApiError(error)        
    }
}

export const updateSupplier = async (suppId: string, payload: UpdateSupplierPayload) => {
    try {
        const res = await api.put(`/supplier/${suppId}`, payload)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}

export const deleteSupplier = async (suppId: string) => {
    try {
        const res = await api.delete(`/supplier/${suppId}`)
        return res.data
    } catch (error) {
        throw toApiError(error)
    }
}


