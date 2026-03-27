import {z } from "zod"

export const CreateExpenseOperationalSchema = z.object({
    name: z.string().min(2, "At least 2 characters"),
    amount: z.coerce.number("Must be a number").positive("Must be a positive number"),
    description: z.string().optional()
})

export const PaginationOperationalSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    startDate: z.string().optional(),
    endDate: z.string().optional()
})

export type CreateExpenseOperationalPayload = z.infer<typeof CreateExpenseOperationalSchema>
export type OperationalQuery = z.infer<typeof PaginationOperationalSchema>