/*
  Warnings:

  - You are about to drop the column `clientType` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `employee_commissions` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `service_items` table. All the data in the column will be lost.
  - You are about to drop the `client_employee_assignments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dossierId` to the `employee_commissions` table without a default value. This is not possible if the table is not empty.
  - Made the column `dossierId` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dossierId` on table `service_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."client_employee_assignments" DROP CONSTRAINT "client_employee_assignments_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."client_employee_assignments" DROP CONSTRAINT "client_employee_assignments_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employee_commissions" DROP CONSTRAINT "employee_commissions_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_items" DROP CONSTRAINT "service_items_clientId_fkey";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "clientType",
ADD COLUMN     "type" "public"."ClientType" NOT NULL DEFAULT 'INDIVIDUAL';

-- AlterTable
ALTER TABLE "public"."employee_commissions" DROP COLUMN "clientId",
ADD COLUMN     "dossierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "clientId",
ALTER COLUMN "dossierId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."service_items" DROP COLUMN "clientId",
ALTER COLUMN "dossierId" SET NOT NULL;

-- DropTable
DROP TABLE "public"."client_employee_assignments";

-- CreateTable
CREATE TABLE "public"."dossier_employee_assignments" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT,

    CONSTRAINT "dossier_employee_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dossier_employee_assignments_dossierId_employeeId_key" ON "public"."dossier_employee_assignments"("dossierId", "employeeId");

-- AddForeignKey
ALTER TABLE "public"."employee_commissions" ADD CONSTRAINT "employee_commissions_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "public"."dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dossier_employee_assignments" ADD CONSTRAINT "dossier_employee_assignments_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "public"."dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dossier_employee_assignments" ADD CONSTRAINT "dossier_employee_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
