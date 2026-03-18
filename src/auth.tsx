import { api } from "./client";

export class AuthError extends Error {}

export type Payload = {
  username: string;
  password: string;
  tenant: string;
};

// export type UserReturn = {
//   user: {
//     tenantId: string;
//     userId: string;
//     username: string;
//     role: "OWNER" | "ADMIN" | "STAFF";
//   };
// };

export class AuthNotFound extends Error {}

export const getTenant = async (tenant: string) => {
  try {
    const res = await api.get(`/auth/${tenant}`);
    return res.data;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;
    throw new Error(message, { cause: status });
  }
};

export const login = async (payload: Payload) => {
  try {
    const res = await api.post(`/auth/login/${payload.tenant}`, payload);
    return res.data;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;
    const details = error.data?.details;

    throw { message, status, details };
  }
};

export const getMe = async () => {
  try {
    const res = await api.get("/auth/me");
    console.log(res.data);
    return res.data;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;
    if (error.status === 401) return null
    throw new Error(message, { cause: status });
  }
};

export const logout = async () => {
  try {
    const res = await api.post("/auth/logout", {});
    return res.data;
  } catch (error: any) {
    const message = error.data?.message || "Something went wrong";
    const status = error.status || 500;
    throw new Error(message, { cause: status });
  }
};
