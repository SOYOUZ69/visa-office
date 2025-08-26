-- CreateEnum
CREATE TYPE "public"."SalaryType" AS ENUM ('MONTHLY', 'CLIENTCOMMISSION', 'PERIODCOMMISSION');

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" TEXT NOT NULL,
    "salaryType" "public"."SalaryType" NOT NULL,
    "salaryAmount" DECIMAL(65,30) NOT NULL,
    "commissionPercentage" TEXT NOT NULL,
    "soldeCoungiee" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);
