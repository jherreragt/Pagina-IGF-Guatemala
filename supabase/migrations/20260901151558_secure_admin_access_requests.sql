/*
  # Prevent self-service admin access requests from claiming super admin

  1. Problem
     The `admin_users_insert_self` policy constrained only `user_id` and
     `status`. A caller could insert their own pending request with
     `role = 'super_admin'`, and approving it would hand them the highest
     privilege level.

  2. Changes
     - Recreates `admin_users_insert_self` with `AND role = 'admin'` in the
       WITH CHECK, so a self-service request can only ever ask for the ordinary
       admin role.
     - Downgrades any existing non-approved row that claims `super_admin` to
       `admin`.

  3. Security
     - Only an existing super admin can grant the super admin role, via the
       `admin_users_update` policy which already requires `is_super_admin()`.
*/

DROP POLICY IF EXISTS "admin_users_insert_self" ON public.admin_users;

CREATE POLICY "admin_users_insert_self" ON public.admin_users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND role = 'admin');

UPDATE public.admin_users
SET role = 'admin'
WHERE role = 'super_admin' AND status <> 'approved';
