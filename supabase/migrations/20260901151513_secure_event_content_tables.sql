/*
  # Restrict event programme content writes to approved administrators

  1. Problem
     `event_sessions`, `event_speakers`, `event_allies`, `event_resources` and
     `event_editions` allowed INSERT, UPDATE and DELETE to every authenticated
     user with a `true` predicate. Any forum member could rewrite the agenda,
     the speaker list, or the partner links rendered on the public event page.

  2. Changes
     - Replaces the write policies on all five tables with ones predicated on
       `is_admin_approved()`.
     - Public SELECT policies are preserved unchanged.

  3. Security
     - Only approved administrators can modify event content.
*/

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['event_sessions','event_speakers','event_allies','event_resources','event_editions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'admin_insert_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'admin_update_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'admin_delete_' || t, t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'approved_admin_insert_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'approved_admin_update_' || t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'approved_admin_delete_' || t, t);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (is_admin_approved())',
      'approved_admin_insert_' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved())',
      'approved_admin_update_' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (is_admin_approved())',
      'approved_admin_delete_' || t, t);
  END LOOP;
END $$;
