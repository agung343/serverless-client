import { z } from "zod"

export const PaginationExpenseQuery = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25),
    startDate: z.string().optional(),
    endDate: z.string().optional()
})

export const CreateNewExpenseOperationalSchema = z.object({
    name: z.string().min(1, "name is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    description: z.string().optional()
})


export type ExpenseQuery = z.infer<typeof PaginationExpenseQuery>
export type CreateNewExpenseOperationalPayload = z.infer<typeof CreateNewExpenseOperationalSchema>