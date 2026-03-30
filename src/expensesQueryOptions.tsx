import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getOperationals, createOperational } from "./api/expenses";
import type { ExpenseQuery } from "./schema/expense.schema";

export const operationalOptions = (params: ExpenseQuery) => queryOptions({
    queryKey:["operationals", params.search, params.page, params.limit, params.startDate, params.endDate],
    queryFn: () => getOperationals(params),
    placeholderData: keepPreviousData
})