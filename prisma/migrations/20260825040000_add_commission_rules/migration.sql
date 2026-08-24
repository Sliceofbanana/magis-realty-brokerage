-- CreateTable
CREATE TABLE "CommissionRules" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "brokerageSplitPercent" DECIMAL(5,2) NOT NULL,
    "referralFeePercent" DECIMAL(5,2) NOT NULL,
    "tierThreshold" DECIMAL(14,2) NOT NULL,
    "tierBonusPercent" DECIMAL(5,2) NOT NULL,
    "withholdingTaxPercent" DECIMAL(5,2) NOT NULL,
    "transactionFee" DECIMAL(10,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "autoCalculationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRules_pkey" PRIMARY KEY ("id")
);
