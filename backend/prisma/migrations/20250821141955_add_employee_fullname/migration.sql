/*
  Warnings:

  - Added the required column `fullName` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add the column as nullable
ALTER TABLE "public"."Employee" ADD COLUMN "fullName" TEXT;

-- Update existing records with a default value
UPDATE "public"."Employee" SET "fullName" = 'Employee ' || id WHERE "fullName" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "public"."Employee" ALTER COLUMN "fullName" SET NOT NULL;
