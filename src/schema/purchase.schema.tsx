import { z } from "zod";

export const CreatePurchaseQuerySchema = z.object({
  product: z.string().optional(),
  supplier: z.string().optional(),
});

export const CreatePurchaseSchema = z
  .object({
    invoiceNumber: z.string().min(1, "Invoice is required"),
    date: z.string(),
    notes: z.string().optional(),
    supplierId: z.string().min(1, "Supplier is required"),
    totalAmount: z.coerce
      .number("Must be a  number")
      .nonnegative("Total Amount must be positive"),
    paid: z.coerce
      .number("Must be a number")
      .nonnegative("Paid amount must be a non-negative number")
      .default(0),
    addToStock: z
      .preprocess((val) => val === "true" || val === true, z.boolean())
      .default(false),
    items: z.array(
      z.object({
        productId: z.string().optional(),
        name: z.string().min(1, "Item name is required"),
        quantity: z.coerce
          .number("Must be a number")
          .positive("Quantity must be a positive number"),
        unitId: z.coerce
          .number("Must be a number")
          .int()
          .positive("Unit ID must be a positive integer"),
        unitPrice: z.coerce
          .number("Must be a number")
          .nonnegative("Unit price must be a non-negative number"),
      })
    ),
  })
  .refine(
    (data) =>
      data.paid <=
      data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    {
      message: "Paid amount cannot exceed total amount calculated from items",
      path: ["paid"],
    }
  );

export type CreatePurchaseQuery = z.infer<typeof CreatePurchaseQuerySchema>;
export type CreatePurchasePayload = z.infer<typeof CreatePurchaseSchema>;
