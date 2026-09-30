-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "photo" TEXT,
ADD COLUMN     "sourceLabel" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
