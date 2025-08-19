-- CreateEnum
CREATE TYPE "public"."InstallmentStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "public"."payment_installments" ADD COLUMN     "status" "public"."InstallmentStatus" NOT NULL DEFAULT 'PENDING';
