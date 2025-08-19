/*
  Warnings:

  - Added the required column `passportNumber` to the `family_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `family_members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."family_members" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passportNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "relationship" DROP NOT NULL;
