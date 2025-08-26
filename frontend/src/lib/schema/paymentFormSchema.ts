import z from "zod";
import { PaymentInstallmentSchema } from "./paymentInstallmentSchema";

export const PaymentFormSchema = z
  .object({
    paymentOption: z
      .enum(["BANK_TRANSFER", "CHEQUE", "POST", "CASH"] as const)
      .optional(),
    paymentModality: z.enum([
      "FULL_PAYMENT",
      "SIXTY_FORTY",
      "MILESTONE_PAYMENTS",
    ] as const),
    transferCode: z.string().optional(),
    installments: z
      .array(PaymentInstallmentSchema)
      .min(1, "At least one installment is required"),
  })
  .refine(
    (data) => {
      // Validate that percentages sum to 100%
      const totalPercentage = data.installments.reduce(
        (sum, installment) => sum + installment.percentage,
        0
      );
      return Math.abs(totalPercentage - 100) < 0.01;
    },
    {
      message: "Installment percentages must sum to exactly 100%",
      path: ["installments"],
    }
  )
  .refine(
    (data) => {
      // For FULL_PAYMENT, global paymentOption is required
      if (data.paymentModality === "FULL_PAYMENT") {
        return !!data.paymentOption;
      }
      // For other modalities, each installment must have a paymentOption
      if (
        data.paymentModality === "SIXTY_FORTY" ||
        data.paymentModality === "MILESTONE_PAYMENTS"
      ) {
        return data.installments.every(
          (installment) => !!installment.paymentOption
        );
      }
      return true;
    },
    {
      message: "Payment option is required",
      path: ["paymentOption"],
    }
  );

export type PaymentFormData = z.infer<typeof PaymentFormSchema>;
