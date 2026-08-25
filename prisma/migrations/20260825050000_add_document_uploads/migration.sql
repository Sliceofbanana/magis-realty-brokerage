-- Existing DocumentFile rows are mock/seed data incompatible with the new
-- required columns (category/type enums, uploadedById, cloudinaryPublicId).
TRUNCATE TABLE "DocumentFile";

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('PERSONAL', 'PROPERTY', 'CONTRACT_TEMPLATE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PDF', 'DOCX', 'XLSX', 'JPG', 'PNG');

-- AlterTable
ALTER TABLE "DocumentFile" DROP COLUMN "size",
ADD COLUMN     "cloudinaryPublicId" TEXT NOT NULL,
ADD COLUMN     "cloudinaryResourceType" TEXT NOT NULL,
ADD COLUMN     "propertyId" TEXT,
ADD COLUMN     "sizeBytes" INTEGER NOT NULL,
ADD COLUMN     "uploadedById" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "DocumentCategory" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "DocumentType" NOT NULL,
ALTER COLUMN "url" SET NOT NULL;

-- CreateIndex
CREATE INDEX "DocumentFile_uploadedById_idx" ON "DocumentFile"("uploadedById");

-- CreateIndex
CREATE INDEX "DocumentFile_propertyId_idx" ON "DocumentFile"("propertyId");

-- CreateIndex
CREATE INDEX "DocumentFile_category_idx" ON "DocumentFile"("category");

-- AddForeignKey
ALTER TABLE "DocumentFile" ADD CONSTRAINT "DocumentFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFile" ADD CONSTRAINT "DocumentFile_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
