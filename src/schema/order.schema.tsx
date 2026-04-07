import { z } from "zod";

export const OrderQuerySchema = z.object({
  invoice: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const CreateOrderSchema = z
  .object({
    paid: z.coerce.number().positive(),
    notes: z.string().optional(),
    paymentType: z.enum(["cash", "qris", "card", "e-money"]),
    cardLastFour: z.string().length(4).optional(),
    cardReference: z.string().optional(),
    emoneyPlatform: z
      .enum(["Flazz", "E-Money Mandiri", "Brizzi", "Tapcash"])
      .optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "product need id"),
          quantity: z.coerce.number().positive("Must be positive number"),
          unitPrice: z.coerce.number().min(0, "Must be positive number"),
        })
      )
      .min(1, "At least 1 product"),
  })
  .refine(
    (data) => {
      if (data.paymentType === "card") {
        return !!data.cardLastFour && !!data.cardReference;
      }
      return true;
    },
    { message: "Card details is required", path: ["cardLastFour"] }
  )
  .refine(
    (data) => {
      if (data.paymentType === "e-money") {
        return !!data.emoneyPlatform;
      }
      return true;
    },
    { message: "Please select a platform", path: ["emoneyPlatform"] }
  );

export type OrderQuery = z.infer<typeof OrderQuerySchema>;
export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;
