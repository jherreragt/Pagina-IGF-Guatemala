/*
  # Restrict blog article writes and draft reads to approved administrators

  1. Problem
     `blog_posts` allowed INSERT, UPDATE and DELETE to every authenticated user
     with a `true` predicate, so any visitor who signed up on the forum could
     rewrite, publish or delete any article. A SELECT policy also exposed
     unpublished drafts to every authenticated user.

  2. Changes
     - Drops every existing policy on `blog_posts`.
     - Public read of published articles for `anon` and `authenticated`.
     - Full read of drafts restricted to approved administrators.
     - INSERT/UPDATE/DELETE predicated on `is_admin_approved()`.

  3. Security
     - Only approved administrators can author or modify articles or read drafts.
*/

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_posts', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_published_posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "select_all_posts_admin" ON public.blog_posts
  FOR SELECT TO authenticated USING (is_admin_approved());

CREATE POLICY "insert_posts_admin" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (is_admin_approved());

CREATE POLICY "update_posts_admin" ON public.blog_posts
  FOR UPDATE TO authenticated USING (is_admin_approved()) WITH CHECK (is_admin_approved());

CREATE POLICY "delete_posts_admin" ON public.blog_posts
  FOR DELETE TO authenticated USING (is_admin_approved());
