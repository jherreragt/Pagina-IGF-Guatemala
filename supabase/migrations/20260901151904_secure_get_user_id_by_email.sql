/*
  # Lock down the email-to-account lookup routine

  1. Problem
     `get_user_id_by_email` is SECURITY DEFINER over `auth.users`. Postgres
     grants EXECUTE to PUBLIC by default, so any caller holding the public anon
     key could test whether any email address had an account and retrieve its
     internal identifier.

  2. Changes
     - Adds an authorisation check inside the function body: only a forum
       moderator or an approved administrator gets a result; anyone else raises
       an insufficient-privilege error.
     - Pins the function's search_path.
     - Revokes EXECUTE from PUBLIC and `anon`; only `authenticated` may call it,
       and the body then decides.

  3. Security
     - Account enumeration through this endpoint is closed for anonymous callers
       and for ordinary signed-in members.
*/

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result uuid;
BEGIN
  IF NOT (public.is_forum_admin() OR public.is_admin_approved()) THEN
    RAISE EXCEPTION 'No autorizado.' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO result FROM auth.users WHERE lower(email) = lower(user_email) LIMIT 1;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;
