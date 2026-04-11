import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getOperationalExpenses } from "./api/expenses";
import { ExpenseQuery } from "./schema/expense.schema";

export const operationalExpensesQueryOptions = (query: ExpenseQuery) => queryOptions({
    queryKey: ["operational-expenses", query.page, query.limit, query.search, query.startDate, query.endDate],
    queryFn: () => getOperationalExpenses(query),
    placeholderData: keepPreviousData
})