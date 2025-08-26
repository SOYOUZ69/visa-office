import { z } from "zod";

export const PaymentInstallmentSchema = z.object({
  description: z.string().min(1, "Description is required"),
  percentage: z
    .number()
    .min(0.01, "Percentage must be greater than 0")
    .max(100, "Percentage cannot exceed 100"),
  amount: z.number().min(0, "Amount must be at least 0"),
  dueDate: z.string().min(1, "Due date is required"),
  paymentOption: z
    .enum(["BANK_TRANSFER", "CHEQUE", "POST", "CASH"] as const)
    .optional(),
  transferCode: z.string().optional(),
  status: z.enum(["PENDING", "PAID"] as const).optional(),
});

// 👇 Derived TypeScript type (handy for forms, APIs, etc.)
export type PaymentInstallmentFormData = z.infer<
  typeof PaymentInstallmentSchema
>;
