-- AlterTable
ALTER TABLE "AgentProfile" ADD COLUMN     "publicListed" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: agents already shown on the public site (those with a bio) stay
-- listed, so deploying this doesn't empty the Agents page. Everyone created
-- from now on starts hidden until an administrator lists them.
UPDATE "AgentProfile" SET "publicListed" = true WHERE cardinality("bio") > 0;
