-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- Add new fractional columns with defaults first (so existing rows get values)
ALTER TABLE "Property" ADD COLUMN "totalFractions" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "Property" ADD COLUMN "availableFractions" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "Property" ADD COLUMN "pricePerFraction" DOUBLE PRECISION NOT NULL DEFAULT 100000;

-- Migrate existing data: set totalFractions = units, availableFractions = availableUnits, pricePerFraction = minInvestment
UPDATE "Property" SET
  "totalFractions" = "units",
  "availableFractions" = "availableUnits",
  "pricePerFraction" = "minInvestment";

-- Drop old columns
ALTER TABLE "Property" DROP COLUMN "units";
ALTER TABLE "Property" DROP COLUMN "availableUnits";
ALTER TABLE "Property" DROP COLUMN "minInvestment";
ALTER TABLE "Property" DROP COLUMN "maxInvestment";
ALTER TABLE "Property" DROP COLUMN "investmentStep";

-- Drop CartItem table and ItemType enum
DROP TABLE "CartItem";
DROP TYPE "ItemType";

-- Remove cartItems relation from User (handled by dropping CartItem table)

-- CreateTable Investment
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fractions" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "pricePerFraction" DOUBLE PRECISION NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Investment_razorpayOrderId_key" ON "Investment"("razorpayOrderId");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
