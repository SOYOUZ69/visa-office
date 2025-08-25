/*
  Warnings:

  - You are about to drop the column `processedPayments` on the `employee_commissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."employee_commissions" DROP COLUMN "processedPayments",
ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;
