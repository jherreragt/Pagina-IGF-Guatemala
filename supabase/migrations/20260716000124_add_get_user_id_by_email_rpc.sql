/*
# Add get_user_id_by_email RPC function

Adds a SECURITY DEFINER function to look up a Supabase auth user's UUID
by their email. Used by the forum admin UI to promote existing forum
users to moderators. Only callable by authenticated users (the admin panel
already requires auth + is_forum_admin() for the forum_admins insert).
*/

CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result uuid;
BEGIN
  SELECT id INTO result FROM auth.users WHERE lower(email) = lower(user_email) LIMIT 1;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;
