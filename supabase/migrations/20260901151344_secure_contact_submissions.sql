/*
  # Restrict contact form submissions to approved administrators

  1. Problem
     `contact_submissions` allowed SELECT, UPDATE and DELETE to every
     authenticated user with a `true` predicate. Because the forum has open
     public sign-up, any visitor could create an account and read or delete
     every contact message, including sender names, emails and message bodies.

  2. Changes
     - Drops every existing policy on `contact_submissions`.
     - Keeps a public INSERT policy so the contact form keeps working for
       anonymous visitors.
     - Re-creates SELECT/UPDATE/DELETE scoped `TO authenticated` and predicated
       on `is_admin_approved()`.

  3. Security
     - Personal data submitted through the contact form is now readable only by
       approved administrators.

  4. Notes
     - No data is deleted; only access rules change.
*/

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_submissions' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contact_submissions', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_public_insert" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "contact_admin_select" ON public.contact_submissions
  FOR SELECT TO authenticated USING (is_admin_approved());

CREATE POLICY "contact_admin_update" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved());

CREATE POLICY "contact_admin_delete" ON public.contact_submissions
  FOR DELETE TO authenticated USING (is_admin_approved());
