/*
  # Restrict homepage content writes to approved administrators

  1. Problem
     The four homepage content tables (`home_stats`, `home_why_matters`,
     `home_principles`, `home_stakeholders`) had INSERT/UPDATE/DELETE policies
     granted to BOTH `anon` and `authenticated` with a `true` predicate. Any
     visitor holding the public anon key could rewrite or erase homepage content.

  2. Changes
     - Drops every existing policy on the four tables.
     - Re-creates a public SELECT policy (`anon`, `authenticated`) because the
       homepage must remain readable by visitors.
     - Re-creates INSERT/UPDATE/DELETE policies scoped `TO authenticated` and
       predicated on `is_admin_approved()`.

  3. Security
     - Anonymous write access to homepage content is removed entirely.
     - Only users with an approved row in `admin_users` may modify content.

  4. Notes
     - No data is deleted or altered; only access rules change.
*/

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['home_stats','home_why_matters','home_principles','home_stakeholders'] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
      END LOOP;

      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
        t || '_public_select', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (is_admin_approved())',
        t || '_admin_insert', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved())',
        t || '_admin_update', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (is_admin_approved())',
        t || '_admin_delete', t);
    END IF;
  END LOOP;
END $$;
