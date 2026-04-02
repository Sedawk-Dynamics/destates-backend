-- DropForeignKey
ALTER TABLE "InsurancePlan" DROP CONSTRAINT "InsurancePlan_propertyId_fkey";

-- AlterColumn - make propertyId nullable
ALTER TABLE "InsurancePlan" ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey with SET NULL on delete
ALTER TABLE "InsurancePlan" ADD CONSTRAINT "InsurancePlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
