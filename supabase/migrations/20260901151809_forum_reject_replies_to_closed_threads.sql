/*
  # Reject replies to closed or hidden threads in the database

  1. Problem
     The only check preventing a reply to a closed thread lived in the browser
     (`if (thread?.is_closed) return;`). The INSERT policy on `forum_posts`
     checks only `auth.uid() = author_id` and never consults the parent thread,
     so a direct API call could keep posting into a thread a moderator closed.

  2. Changes
     - Adds `forum_post_parent_state_check()`, a BEFORE INSERT trigger function
       on `forum_posts` that raises an error when the parent thread is closed or
       hidden, unless the caller is a moderator or an approved administrator.

  3. Security
     - The closed and hidden thread states are now enforced server-side at the
       moment of the write.
*/

CREATE OR REPLACE FUNCTION public.forum_post_parent_state_check()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  parent record;
BEGIN
  IF public.is_forum_admin() OR public.is_admin_approved() THEN
    RETURN NEW;
  END IF;

  SELECT is_closed, is_hidden INTO parent
  FROM public.forum_threads
  WHERE id = NEW.thread_id;

  IF parent IS NULL THEN
    RAISE EXCEPTION 'La conversación no existe.';
  END IF;

  IF parent.is_closed THEN
    RAISE EXCEPTION 'Esta conversación está cerrada.';
  END IF;

  IF parent.is_hidden THEN
    RAISE EXCEPTION 'Esta conversación no está disponible.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_posts_parent_state_check ON public.forum_posts;
CREATE TRIGGER forum_posts_parent_state_check
  BEFORE INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_post_parent_state_check();
