-- CreateEnum
CREATE TYPE "public"."DossierStatus" AS ENUM ('EN_COURS', 'TERMINE', 'ANNULE');

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "dossierId" TEXT,
ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."service_items" ADD COLUMN     "dossierId" TEXT,
ALTER COLUMN "clientId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."dossiers" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "public"."DossierStatus" NOT NULL DEFAULT 'EN_COURS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."dossiers" ADD CONSTRAINT "dossiers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_items" ADD CONSTRAINT "service_items_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "public"."dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "public"."dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
