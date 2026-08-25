-- CreateEnum
CREATE TYPE "CebuRegion" AS ENUM ('NORTH', 'CENTRAL', 'SOUTH');

-- AlterTable: nullable first so existing rows can be backfilled
ALTER TABLE "Property" ADD COLUMN     "region" "CebuRegion";

-- Backfill existing demo/seed rows with a default before enforcing NOT NULL
UPDATE "Property" SET "region" = 'CENTRAL' WHERE "region" IS NULL;

ALTER TABLE "Property" ALTER COLUMN "region" SET NOT NULL;
