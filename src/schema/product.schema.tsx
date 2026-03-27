import { z } from "zod"

export const CreateNewCategorySchema = z.object({
    name: z.string().min(1, "At least 1 character")
})

export const CreateProductSchema = z.object({
    name: z.string().min(2, "At least 2 characters"),
    code: z.string().min(2, "At least 2 characters"),
    categoryId: z.string().min(1, "Category is required"),
    unitId: z.coerce.number().int().positive().optional(),
    price: z.coerce.number("Must be a number").int().min(0, "Must be 0 or greater"),
    cost: z.coerce.number("Must be a number").int().min(0, "Must be 0 or greater"),
    description: z.string().optional()
})

export const UpdateProductSchema = z.object({
    name: z.string().min(2, "At least has 2 characters").optional(),
    code: z
      .string()
      .min(2, "At least has 2 characters")
      .optional(),
    price: z.coerce.number("Must be a number").positive("Must be positive number").optional(),
    cost: z.coerce.number("Must be a number").positive("Must be positive number").optional(),
    description: z.string().optional(),
    categoryId: z.string().min(1, "category is required"),
    unitId: z.coerce.number().int().positive().optional()
});

export const PaginationProductSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(25)
})

export const ProductCashierSchema = z.object({
    search: z.string().optional()
})

export type CreateCategoryPayload = z.infer<typeof CreateNewCategorySchema>
export type CreateProductPayload = z.infer<typeof CreateProductSchema>
export type UpdateProductPayload = z.infer<typeof UpdateProductSchema>
export type ProductQuery = z.infer<typeof PaginationProductSchema>
export type ProductCashierQuery = z.infer<typeof ProductCashierSchema>