/*
  # Restrict homepage video writes to approved administrators

  1. Problem
     `youtube_videos` allowed INSERT, UPDATE and DELETE to every authenticated
     user with a `true` predicate, so any forum member could publish an
     arbitrary video into the webinars section of the homepage.

  2. Changes
     - Replaces the three write policies with ones predicated on
       `is_admin_approved()`.
     - Public SELECT is preserved unchanged.

  3. Security
     - Only approved administrators can manage the video list.
*/

DROP POLICY IF EXISTS "auth_insert_youtube_videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "auth_update_youtube_videos" ON public.youtube_videos;
DROP POLICY IF EXISTS "auth_delete_youtube_videos" ON public.youtube_videos;

CREATE POLICY "admin_insert_youtube_videos" ON public.youtube_videos
  FOR INSERT TO authenticated WITH CHECK (is_admin_approved());

CREATE POLICY "admin_update_youtube_videos" ON public.youtube_videos
  FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved());

CREATE POLICY "admin_delete_youtube_videos" ON public.youtube_videos
  FOR DELETE TO authenticated USING (is_admin_approved());
