import { api } from "./client";
import { ApiError } from "./lib/error";

export type CreateUserPayload = {
  username: string;
  password: string;
  role: "ADMIN" | "STAFF";
};

export type UpdateUserPayload = {
  userId: string;
  username?: string;
  password?: string;
  role?: "ADMIN" | "STAFF";
};

export type User = {
  id: string;
    username: string;
    role: "OWNER" | "ADMIN" | "STAFF"; 
}

export type Users = {
  users: User[]
};

const toApiError = (error:any): ApiError => {
  const message = error.data?.message || "Something went wrong";
  const status = error.status || 500;
  const details = error.data?.details;
  return new ApiError(message, status, details)
}

export const getUsers = async () => {
  try {
    const res = await api.get<Users>("/users");
    return res.data;
  } catch (error: any) {
    throw toApiError(error)
  }
};

export const createNewUser = async (payload: CreateUserPayload) => {
  try {
    const res = await api.post("/users/create-new", payload);
    return res.data;
  } catch (error: any) {
    throw toApiError(error)
  }
};

export const updateUser = async (payload: UpdateUserPayload) => {
  try {
    const res = await api.put(`/users/${payload.userId}`, payload);
    return res.data;
  } catch (error: any) {
    throw toApiError(error)
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const res = await api.delete(`/users/${userId}`);
    return res.data || null;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;

    throw new Error(message, {cause: status})
  }
};
