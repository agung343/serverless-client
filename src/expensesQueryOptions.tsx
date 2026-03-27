import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getOperationalExpenses } from "./api/expenses";
import type { OperationalQuery } from "./schema/expenses.schema";

export const operationalExpensesQueryOptions = (query: OperationalQuery) => queryOptions({
    queryKey: ["operational-expenses", query.page, query.limit, query.search, query.startDate, query.endDate],
    queryFn: () => getOperationalExpenses(query),
    placeholderData: keepPreviousData
})