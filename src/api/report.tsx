import { api } from "./client";
import { toApiError } from "~/lib/error";
import type { Meta } from "~/lib/meta";
import type { ReportQuery, TransactionQuery } from "~/schema/report.schema";
import { Sale } from "./order";

export type DashboardReturn = {
    trends: {
        month: string
        sales: number
        purchases: number
        operasional: number
    }[]
    ordersCard: {
        totalAmount: number
        count: number
    }
    purchaseCard: {
        paid: number
        totalAmount: number
    }
    operasionalCard: {
        totalAmount: number
    }
    limitedStock: {
        id: string
        name: string
        stock: string
    }[]
    mostSold: {
        id: string
        name: string
        quantity: number
    }[]
    topRevenue: {
        id: string
        name: string
        total: number
    }[]
}

export type SalesReportItem = {
    id: string
    invoice: string
    productId: string
    product: string
    quantity: string
    unitPrice: string
    total: string
    date: string
}

export type SalesReportReturn = {
    sales: SalesReportItem[],
    meta: Meta
}

export type PurchaseReportItem = Omit<SalesReportItem, "unitPrice"> & {
    unitCost: string
    status: string
}

export type PurchasesReportReturn =  {
    purchases: PurchaseReportItem[]
    meta: Meta
}

export async function getDashboard(query: ReportQuery = {range: "30d"}) {
    try {
        const searchParams = new URLSearchParams()
        if (query.range) searchParams.set("range", query.range)
        if (query.startDate) searchParams.set("startDate", query.startDate) 
        if (query.endDate) searchParams.set("endDate", query.endDate)

        const { data } = await api.get<DashboardReturn>(`/report/dashboard?${searchParams.toString()}`);
        return data;
    } catch (error) {
        throw toApiError(error);
    }
}

export async function getSalesReport(query: TransactionQuery = {range: "30d", page: 1, limit: 25}) {
    try {
        const searchParams = new URLSearchParams()
        if (query.range) searchParams.set("range", query.range)
        if (query.product) searchParams.set("product", query.product)
        if (query.page) searchParams.set("page", String(query.page))
        if (query.limit) searchParams.set("limit", String(query.limit))
        if (query.startDate !== undefined) searchParams.set("startDate", query.startDate)
        if (query.endDate !== undefined) searchParams.set("endDate", query.endDate)

        const { data } = await api.get<SalesReportReturn>(`/report/sales?${searchParams.toString()}`)
        return data 
    } catch (error) {
        throw toApiError(error)
    }
}

export async function getPurchasesReport(query: TransactionQuery = {range: "30d", page: 1, limit: 25}) {
    try {
        const searchParams = new URLSearchParams()
        if (query.range) searchParams.set("range", query.range)
        if (query.page) searchParams.set("page", String(query.page))
        if (query.limit) searchParams.set("limit", String(query.limit))
        if (query.startDate !== undefined) searchParams.set("startDate", query.startDate)
        if (query.endDate !== undefined) searchParams.set("endDate", query.endDate)

        const { data } = await api.get<PurchasesReportReturn>(`/report/purchases?${searchParams.toString()}`)
        return data 
    } catch (error) {
        throw toApiError(error)
    }
}


