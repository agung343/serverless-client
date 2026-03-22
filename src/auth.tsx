import { api } from "./client";
import { ApiError } from "./lib/error";

export class AuthError extends Error {}

export type Payload = {
  username: string;
  password: string;
  tenant: string;
};

export type UserReturn = {
  user: {
    tenantId: string;
    userId: string;
    username: string;
    role: "OWNER" | "ADMIN" | "STAFF";
  };
};

const toApiError = (error:any): ApiError => {
  const message = error.data?.message || "Something went wrong";
  const status = error.status || 500;
  const details = error.data?.details;
  return new ApiError(message, status, details)
}

export const getTenant = async (tenant: string) => {
  try {
    const res = await api.get(`/auth/${tenant}`);
    return res.data;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;
    throw new Error(message, {cause: status})
  }
};

export const login = async (payload: Payload) => {
  try {
    const res = await api.post(`/auth/login/${payload.tenant}`, payload);
    return res.data;
  } catch (error: any) {
    throw toApiError(error)
  }
};

export const getMe = async () => {
  try {
    const res = await api.get<UserReturn>("/auth/me");
    return res.data;
  } catch (error: any) {
    if (error.status === 401) return null
    throw toApiError(error)
  }
};

export const logout = async () => {
  try {
    const res = await api.post("/auth/logout", {});
    return res.data;
  } catch (error: any) {
    throw toApiError(error)
  }
};
