/*
  Warnings:

  - You are about to drop the column `type` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "type",
ADD COLUMN     "clientType" "public"."ClientType" NOT NULL DEFAULT 'INDIVIDUAL';
