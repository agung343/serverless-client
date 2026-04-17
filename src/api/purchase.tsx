import { api } from "./client";
import { ApiError } from "~/lib/error";
import { Meta } from "~/lib/meta";
import { type CreatePurchaseQuery, CreatePurchasePayload } from "~/schema/purchase.schema";

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

const toApiError = (error: any): ApiError => {
  const message = error.data?.message || "Something went wrong";
  const status = error.status;
  const details = error.data?.details;
  return new ApiError(message, status, details);
};

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
    return res.data
  } catch (error) {
    throw toApiError(error)
  }
}
