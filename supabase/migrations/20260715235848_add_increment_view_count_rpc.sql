/*
# Add increment_view_count RPC function

Adds a SECURITY DEFINER function to atomically increment a thread's
view_count. Called from the frontend when a thread page is loaded.
Safe to call as anon (public read access to threads is already granted).
*/

CREATE OR REPLACE FUNCTION increment_view_count(thread_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_threads SET view_count = view_count + 1 WHERE id = thread_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_view_count(uuid) TO anon, authenticated;
