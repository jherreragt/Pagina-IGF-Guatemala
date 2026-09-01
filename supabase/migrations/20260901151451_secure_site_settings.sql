/*
  # Restrict site settings writes to approved administrators

  1. Problem
     `site_settings` allowed INSERT, UPDATE and DELETE to every authenticated
     user with a `true` predicate. Any forum member could change public site
     configuration, including the published contact email address.

  2. Changes
     - Replaces the three write policies with ones predicated on
       `is_admin_approved()`.
     - Public SELECT is preserved unchanged: the site reads these values on
       every page.

  3. Security
     - Only approved administrators can change site configuration.
*/

DROP POLICY IF EXISTS "insert_site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "update_site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "delete_site_settings" ON public.site_settings;

CREATE POLICY "insert_site_settings_admin" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (is_admin_approved());

CREATE POLICY "update_site_settings_admin" ON public.site_settings
  FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved());

CREATE POLICY "delete_site_settings_admin" ON public.site_settings
  FOR DELETE TO authenticated USING (is_admin_approved());
