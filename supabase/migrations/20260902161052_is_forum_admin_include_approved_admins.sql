/*
  # Treat approved admins as forum admins

  1. Problem
     The function `is_forum_admin()` only checks the `forum_admins` table.
     Site administrators approved in `admin_users` are NOT automatically
     forum admins, so they cannot delete, pin, close, feature, or hide
     forum threads/posts — the RLS policies reject the operation because
     `is_forum_admin()` returns false for them.

  2. Fix
     Redefine `is_forum_admin()` to also return true when the current user
     is an approved admin in `admin_users`. This aligns forum moderation
     permissions with the site-wide admin approval workflow.

  3. Security
     No new tables or columns. The function gains an additional check
     against `admin_users` (status = 'approved'). All existing forum
     policies that call `is_forum_admin()` now also accept approved site
     admins, which is the intended behavior.
*/

CREATE OR REPLACE FUNCTION is_forum_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM forum_admins WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND status = 'approved'
  );
$$;
