/*
# Create contact_submissions table

1. New Tables
- `contact_submissions`: stores messages submitted via the public contact form.
  - `id` (uuid, primary key)
  - `name` (text, not null) — submitter's full name
  - `email` (text, not null) — submitter's email address
  - `org` (text, nullable) — submitter's organization (optional)
  - `subject` (text, not null) — selected subject/topic
  - `message` (text, not null) — message body
  - `status` (text, default 'new') — processing status: new, read, replied
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `contact_submissions`.
- INSERT: allow anon + authenticated (public form, no sign-in required).
- SELECT/UPDATE/DELETE: authenticated only (admins can view/reply in dashboard).
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  org text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_submissions" ON contact_submissions;
CREATE POLICY "anon_insert_contact_submissions"
ON contact_submissions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_contact_submissions" ON contact_submissions;
CREATE POLICY "auth_select_contact_submissions"
ON contact_submissions FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_contact_submissions" ON contact_submissions;
CREATE POLICY "auth_update_contact_submissions"
ON contact_submissions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact_submissions" ON contact_submissions;
CREATE POLICY "auth_delete_contact_submissions"
ON contact_submissions FOR DELETE
TO authenticated USING (true);
