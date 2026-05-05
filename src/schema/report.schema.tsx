import { z } from "zod"

export const ReportQuerySchema = z.object({
    range: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

export const TransactionQuerySchema = z.object({
    range: z.string().optional(),
    product: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().max(100).default(25),
    startDate: z.string().optional(),
    endDate: z.string().optional()
})

export type ReportQuery = z.infer<typeof ReportQuerySchema>
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>