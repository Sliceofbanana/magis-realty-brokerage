-- CreateEnum
CREATE TYPE "AttendanceCheckInMode" AS ENUM ('QR', 'BUTTON');

-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "dhsudRegistration" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "prcLicense" TEXT;

-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "checkedInAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "checkInMode" "AttendanceCheckInMode" NOT NULL DEFAULT 'BUTTON',
ADD COLUMN     "checkInToken" TEXT,
ADD COLUMN     "createdById" TEXT;

-- Backfill checkInToken with a unique value per existing row before making
-- it required (derived from the row's own already-unique id).
UPDATE "Meeting" SET "checkInToken" = md5(random()::text || "id") WHERE "checkInToken" IS NULL;

ALTER TABLE "Meeting" ALTER COLUMN "checkInToken" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "primaryOffice" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_checkInToken_key" ON "Meeting"("checkInToken");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
