-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('TRANSLATION', 'DOSSIER_TREATMENT', 'ASSURANCE', 'VISA_APPLICATION', 'CONSULTATION', 'OTHER');

-- CreateTable
CREATE TABLE "public"."service_items" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."service_items" ADD CONSTRAINT "service_items_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
