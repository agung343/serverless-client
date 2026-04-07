import { z } from "zod"

export const StockQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    startDate: z.string().optional(),
    endDate: z.string().optional()
})

export const AdjustStockSchema = z.object({
    quantity: z.coerce.number().min(0, "Must be greater or equal than 0"),
    note: z.string().min(1, "Note is required for adjust")
})

export type StockQuery = z.infer<typeof StockQuerySchema>
export type AdjustStockPayload = z.infer<typeof AdjustStockSchema>