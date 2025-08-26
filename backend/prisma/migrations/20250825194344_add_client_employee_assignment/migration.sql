/*
  Warnings:

  - You are about to drop the column `assignedEmployeeId` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `clientType` on the `clients` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."clients" DROP CONSTRAINT "clients_assignedEmployeeId_fkey";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "assignedEmployeeId",
DROP COLUMN "clientType",
ADD COLUMN     "type" "public"."ClientType" NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateTable
CREATE TABLE "public"."client_employee_assignments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT,

    CONSTRAINT "client_employee_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_employee_assignments_clientId_employeeId_key" ON "public"."client_employee_assignments"("clientId", "employeeId");

-- AddForeignKey
ALTER TABLE "public"."client_employee_assignments" ADD CONSTRAINT "client_employee_assignments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_employee_assignments" ADD CONSTRAINT "client_employee_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
