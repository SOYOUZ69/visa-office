-- AlterTable
ALTER TABLE "public"."payment_installments" ADD COLUMN     "paymentOption" "public"."PaymentOption",
ADD COLUMN     "transferCode" TEXT;
