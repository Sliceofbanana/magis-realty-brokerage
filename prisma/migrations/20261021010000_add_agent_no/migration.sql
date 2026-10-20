-- Permanent agent number behind the "AG-014" contact code shown on listings.
-- New users get the next number automatically; existing users are numbered
-- in the order they joined (hand-written rather than a plain SERIAL so the
-- backfill is deterministic).
CREATE SEQUENCE "User_agentNo_seq";

ALTER TABLE "User" ADD COLUMN "agentNo" INTEGER;

UPDATE "User" u
SET "agentNo" = s.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS rn
  FROM "User"
) s
WHERE u."id" = s."id";

SELECT setval('"User_agentNo_seq"', COALESCE((SELECT MAX("agentNo") FROM "User"), 0) + 1, false);

ALTER TABLE "User" ALTER COLUMN "agentNo" SET DEFAULT nextval('"User_agentNo_seq"');
ALTER TABLE "User" ALTER COLUMN "agentNo" SET NOT NULL;
ALTER SEQUENCE "User_agentNo_seq" OWNED BY "User"."agentNo";

-- CreateIndex
CREATE UNIQUE INDEX "User_agentNo_key" ON "User"("agentNo");
