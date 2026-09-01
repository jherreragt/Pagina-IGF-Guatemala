/*
  # Restrict the event registration list to approved administrators

  1. Problem
     `event_registrations` allowed SELECT to every authenticated user with a
     `true` predicate, exposing every attendee's name, email, phone,
     organisation, role and sector to anyone who signed up on the forum.

  2. Changes
     - Drops every existing policy on `event_registrations`.
     - Keeps a public INSERT policy so the registration form keeps working.
     - Re-creates SELECT/UPDATE/DELETE predicated on `is_admin_approved()`.

  3. Security
     - Attendee personal data is now readable only by approved administrators.
*/

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_registrations' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.event_registrations', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registrations_public_insert" ON public.event_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "registrations_admin_select" ON public.event_registrations
  FOR SELECT TO authenticated USING (is_admin_approved());

CREATE POLICY "registrations_admin_update" ON public.event_registrations
  FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved());

CREATE POLICY "registrations_admin_delete" ON public.event_registrations
  FOR DELETE TO authenticated USING (is_admin_approved());
