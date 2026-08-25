-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('APPLIED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED');

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "positionInterest" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");
