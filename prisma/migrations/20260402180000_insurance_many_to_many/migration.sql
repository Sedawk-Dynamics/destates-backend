-- Drop old foreign key and column
ALTER TABLE "InsurancePlan" DROP CONSTRAINT IF EXISTS "InsurancePlan_propertyId_fkey";
ALTER TABLE "InsurancePlan" DROP COLUMN IF EXISTS "propertyId";

-- Create implicit many-to-many join table
CREATE TABLE "_PropertyInsurancePlans" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PropertyInsurancePlans_AB_pkey" PRIMARY KEY ("A","B")
);

-- Create index for B column
CREATE INDEX "_PropertyInsurancePlans_B_index" ON "_PropertyInsurancePlans"("B");

-- Add foreign keys
ALTER TABLE "_PropertyInsurancePlans" ADD CONSTRAINT "_PropertyInsurancePlans_A_fkey" FOREIGN KEY ("A") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PropertyInsurancePlans" ADD CONSTRAINT "_PropertyInsurancePlans_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
