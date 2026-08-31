/*
# Create admin_users table for admin registration and approval workflow

## Purpose
Adds an admin user management system so that:
1. New users can request admin access via a registration form on the admin login page.
2. A super admin can approve, reject, or revoke admin access.
3. Only approved admins can access the admin panel.

## New Tables
- `admin_users` — tracks admin access requests and their approval status.

## Columns
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, unique) — the auth user
- `email` (text) — denormalized for display
- `display_name` (text) — name shown in admin panel
- `role` (text: 'super_admin' | 'admin') — super admins can approve/revoke others
- `status` (text: 'pending' | 'approved' | 'rejected' | 'revoked') — approval state
- `requested_at` (timestamptz) — when access was requested
- `approved_at` (timestamptz) — when approved (nullable)
- `approved_by` (uuid, references auth.users) — who approved (nullable)
- `created_at` (timestamptz)

## Security (RLS)
- SELECT: users can read their own row; approved admins and super admins can read all.
- INSERT: any authenticated user can insert their own pending request (self-registration).
- UPDATE: only super admins can change status/role (approve, reject, revoke, promote).
- DELETE: only super admins can delete rows.

## Helper function
- `is_admin_approved()` — returns true if the current user has an approved admin_users row.
- `is_super_admin()` — returns true if the current user is a super_admin with approved status.

## Seeding
Existing auth.users with the first email (admin@igfguatemala.org or the first
registered user) are promoted to super_admin with approved status so there is
always at least one super admin to approve subsequent requests.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  requested_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ── Helper functions ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin_approved()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND status = 'approved'
  );
$$;

-- ── Policies ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
CREATE POLICY "admin_users_select" ON admin_users FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR is_admin_approved()
  );

DROP POLICY IF EXISTS "admin_users_insert_self" ON admin_users;
CREATE POLICY "admin_users_insert_self" ON admin_users FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );

DROP POLICY IF EXISTS "admin_users_update" ON admin_users;
CREATE POLICY "admin_users_update" ON admin_users FOR UPDATE
  TO authenticated USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "admin_users_delete" ON admin_users;
CREATE POLICY "admin_users_delete" ON admin_users FOR DELETE
  TO authenticated USING (is_super_admin());

-- ── Seed: promote the two known admin emails to super_admin ───────────
INSERT INTO admin_users (user_id, email, display_name, role, status, approved_at, approved_by)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  'super_admin',
  'approved',
  now(),
  au.id
FROM auth.users au
WHERE au.email IN ('admin@igf.gt', 'admin@igfguatemala.org', 'jherrera@redciudadana.org.gt', 'info@redciudadana.org.gt')
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  status = 'approved',
  approved_at = COALESCE(admin_users.approved_at, now());
