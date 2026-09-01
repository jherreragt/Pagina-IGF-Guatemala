/*
  # Prevent forum authors from writing moderation columns on their own content

  1. Problem
     The UPDATE policies on `forum_threads` and `forum_posts` allow an author to
     update their own row. Row level security is row-level, not column-level, so
     that grant also covered `moderation_status`, `moderation_note`, `is_hidden`,
     `is_pinned`, `is_featured` and `is_closed`. An author could therefore
     approve their own pending content, pin and feature their own thread,
     un-hide content a moderator hid, and reopen a thread a moderator closed.
     The moderation trigger only ran BEFORE INSERT, so nothing re-checked these
     columns on update.

  2. Changes
     - Adds `forum_guard_thread_columns()` and `forum_guard_post_columns()`,
       BEFORE UPDATE trigger functions that restore the previous value of every
       moderation and ownership column unless the caller is a forum moderator
       (`is_forum_admin()`) or an approved site administrator
       (`is_admin_approved()`).
     - Attaches them to `forum_threads` and `forum_posts`.

  3. Security
     - Ordinary members can still edit the title and body of their own content.
     - Moderation state, pinning, featuring, closing, hiding and authorship can
       only be changed by a moderator or an approved administrator.

  4. Notes
     - Counters (`view_count`, `reply_count`, `reaction_count`) are deliberately
       left alone so the existing counter triggers and the view-count function
       keep working.
*/

CREATE OR REPLACE FUNCTION public.forum_guard_thread_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT (public.is_forum_admin() OR public.is_admin_approved()) THEN
    NEW.moderation_status := OLD.moderation_status;
    NEW.moderation_note   := OLD.moderation_note;
    NEW.is_hidden         := OLD.is_hidden;
    NEW.is_pinned         := OLD.is_pinned;
    NEW.is_featured       := OLD.is_featured;
    NEW.is_closed         := OLD.is_closed;
    NEW.author_id         := OLD.author_id;
    NEW.author_name       := OLD.author_name;
    NEW.category_id       := OLD.category_id;
    NEW.created_at        := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.forum_guard_post_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT (public.is_forum_admin() OR public.is_admin_approved()) THEN
    NEW.moderation_status := OLD.moderation_status;
    NEW.moderation_note   := OLD.moderation_note;
    NEW.is_hidden         := OLD.is_hidden;
    NEW.author_id         := OLD.author_id;
    NEW.author_name       := OLD.author_name;
    NEW.thread_id         := OLD.thread_id;
    NEW.created_at        := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_threads_guard_columns ON public.forum_threads;
CREATE TRIGGER forum_threads_guard_columns
  BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW EXECUTE FUNCTION public.forum_guard_thread_columns();

DROP TRIGGER IF EXISTS forum_posts_guard_columns ON public.forum_posts;
CREATE TRIGGER forum_posts_guard_columns
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_guard_post_columns();
