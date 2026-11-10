-- Enable Row-Level Security on every table in the public schema.
--
-- Supabase exposes the public schema through its REST API (PostgREST) to anyone
-- holding the project URL and the anon key. Without RLS, that key can read,
-- edit and delete every row. Supabase flagged this as `rls_disabled_in_public`.
--
-- This app never uses the Supabase REST API. All data access goes through
-- Prisma over a direct Postgres connection as the `postgres` role, which
-- bypasses RLS. So we enable RLS and add NO policies: the `anon` and
-- `authenticated` API roles get default-deny, and the app is unaffected.
--
-- Done dynamically so it also covers Prisma's own `_prisma_migrations` table.
-- NOTE: tables created by future migrations need `ALTER TABLE ... ENABLE ROW
-- LEVEL SECURITY` too (or turn on "Automatically enable RLS" in the Supabase
-- dashboard under Database > Settings).

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END
$$;

-- Defense in depth: also withdraw the API roles' table privileges. These roles
-- exist on Supabase but not on a plain local Postgres, hence the guards.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated';
  END IF;
END
$$;
