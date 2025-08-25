-- CreateTable
CREATE TABLE "public"."employee_commissions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "commissionPercentage" DECIMAL(5,2) NOT NULL,
    "paymentAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_commissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."employee_commissions" ADD CONSTRAINT "employee_commissions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_commissions" ADD CONSTRAINT "employee_commissions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_commissions" ADD CONSTRAINT "employee_commissions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
