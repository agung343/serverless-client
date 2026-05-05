import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { ReportQuery, TransactionQuery } from "~/schema/report.schema";
import { getDashboard, getSalesReport, getPurchasesReport } from "~/api/report";

export const reportKeys = {
    all: ["report"] as const,
    dashboard: (query: ReportQuery) => [...reportKeys.all, query] as const,
    sales: (query: TransactionQuery) => [...reportKeys.all, "sales", query] as const,
    purchases: (query: TransactionQuery) => [...reportKeys.all, "purchases", query] as const
}

export const dashboardQueryOptions = (query: ReportQuery = {range: "30d"}) => queryOptions({
    queryKey: reportKeys.dashboard(query),
    queryFn: () => getDashboard(query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5
})

export const salesReportQueryOptions = (query: TransactionQuery = {range: "30d", page: 1, limit: 25}) => queryOptions({
    queryKey: reportKeys.sales(query),
    queryFn: () => getSalesReport(query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})

export const purchasesReportQueryOptions = (query: TransactionQuery = {range: "30d", page: 1, limit: 25}) => queryOptions({
    queryKey: reportKeys.purchases(query),
    queryFn: () => getPurchasesReport(query),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
})