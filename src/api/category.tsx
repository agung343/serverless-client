import { api } from "./client";
import { ApiError } from "../lib/error";

export type CategoryReturn = {
  categories: {
    id: string;
    name: string;
  }[];
};

export type CreateCategoryPayload = {
  name: string;
};

const toApiError = (error: any): ApiError => {
  const message = error.data?.message || "Something went wrong";
  const status = error.status || 500;
  const details = error.data?.details;
  return new ApiError(message, status, details);
};

export const getCategories = async () => {
  try {
    const res = await api.get<CategoryReturn>("/inventory/category");
    return res.data;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;
    throw new Error(message, { cause: status });
  }
};

export const createNewCategory = async (payload: CreateCategoryPayload) => {
  try {
    const res = await api.post("/inventory/category", payload);
    return res.data;
  } catch (error: any) {
    throw toApiError(error);
  }
};
