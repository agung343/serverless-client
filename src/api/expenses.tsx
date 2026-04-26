import { api } from "./client";
import { toApiError } from "~/lib/error";
import type { CreateNewExpenseOperationalPayload, ExpenseQuery } from "~/schema/expense.schema";

export type OperationalExpense = {
  id: number;
  name: string;
  amount: number;
  date: Date;
  description?: string;
};

export type OperationalExpenses = {
  operationals: OperationalExpense[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const getOperationalExpenses = async (params: ExpenseQuery) => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  try {
    const res = await api.get<OperationalExpenses>(`/expenses/operational?${searchParams.toString()}`);
    return res.data 
  } catch (error:any) {
    throw toApiError(error);
  }
}

export const createOperationalExpense = async (payload: CreateNewExpenseOperationalPayload) => {
  try {
    const res = await api.post("/expenses/operational", payload);
    return res.data;
  } catch (error:any) {
    throw toApiError(error);
  }
}