import z from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(2, "At least 2 characters"),
    password: z.string().min(6, "At least 6 characters"),
    role: z.enum(["ADMIN", "STAFF"])
})

export const UpdateUserSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    username: z.string().min(2, "At least 2 characters"),
    password: z.string().min(6, "At least 6 characters"),
    role: z.enum(["ADMIN", "STAFF"])
})

export type CreateUserPayload = z.infer<typeof CreateUserSchema>
export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>