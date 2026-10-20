-- Adding listings is now reserved for management: Administrators always, plus
-- anyone an Administrator grants it to individually (Permissions page).
-- Brokers and Agents previously had it by default; switch those defaults off.
-- Per-user overrides in "UserPermission" are left untouched.
UPDATE "RolePermission"
SET "granted" = false
WHERE "permission" = 'MANAGE_OWN_LISTINGS'
  AND "role" IN ('BROKER', 'AGENT');
