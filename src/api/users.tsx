import { api } from "./client";
import { toApiError } from "~/lib/error";
import { type CreateUserPayload, UpdateUserPayload } from "~/schema/user.schema";

export type User = {
  id: string;
    username: string;
    role: "OWNER" | "ADMIN" | "STAFF"; 
}

export type Users = {
  users: User[]
};

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
    const res = await api.post("/users", payload);
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
