/*
  # Derive the forum display name from the session instead of the request body

  1. Problem
     `author_name` was sent by the browser on every thread and post insert, and
     the INSERT policy only checked `auth.uid() = author_id`. A caller could
     post under any name, including the name of an institution, while the row
     still belonged to their own account.

  2. Changes
     - Adds `forum_set_author_name()`, a BEFORE INSERT trigger function that
       overwrites `author_name` with the display name stored on the caller's own
       account (falling back to the local part of their email address, then to
       'Participante'). Whatever the client sent is ignored.
     - Attaches it to `forum_threads` and `forum_posts`.
     - Moderators and approved administrators are subject to the same rule, so
       the displayed name always matches the account that wrote the row.

  3. Security
     - The displayed author name can no longer be chosen per request; it is
       derived server-side from the authenticated session.
*/

CREATE OR REPLACE FUNCTION public.forum_set_author_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  resolved text;
BEGIN
  IF NEW.author_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(
           NULLIF(TRIM(u.raw_user_meta_data->>'display_name'), ''),
           NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
           NULLIF(SPLIT_PART(u.email, '@', 1), ''),
           'Participante')
    INTO resolved
  FROM auth.users u
  WHERE u.id = NEW.author_id;

  NEW.author_name := COALESCE(resolved, 'Participante');
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.forum_set_author_name() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS forum_threads_set_author_name ON public.forum_threads;
CREATE TRIGGER forum_threads_set_author_name
  BEFORE INSERT ON public.forum_threads
  FOR EACH ROW EXECUTE FUNCTION public.forum_set_author_name();

DROP TRIGGER IF EXISTS forum_posts_set_author_name ON public.forum_posts;
CREATE TRIGGER forum_posts_set_author_name
  BEFORE INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_set_author_name();
