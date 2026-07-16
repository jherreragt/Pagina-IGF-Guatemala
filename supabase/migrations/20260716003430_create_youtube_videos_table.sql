/*
# Create youtube_videos table

1. New Tables
- `youtube_videos`: stores YouTube video entries shown in the home page webinars section.
  - `id` (uuid, primary key)
  - `youtube_id` (text, not null) — the YouTube video ID (e.g. from watch?v=XXXX)
  - `title` (text, not null) — display title
  - `description` (text, nullable) — optional description
  - `thumbnail_url` (text, nullable) — custom thumbnail URL; if null, YouTube default is used
  - `category` (text, default 'Webinar') — category label (Webinar, Foro, Conversatorio, etc.)
  - `sort_order` (int, default 0) — display ordering
  - `published` (boolean, default true) — whether it's visible on the public site
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `youtube_videos`.
- SELECT: allow anon + authenticated (public content, no sign-in needed to view).
- INSERT/UPDATE/DELETE: authenticated only (admin management).
*/

CREATE TABLE IF NOT EXISTS youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'Webinar',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_youtube_videos" ON youtube_videos;
CREATE POLICY "anon_select_youtube_videos"
ON youtube_videos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_youtube_videos" ON youtube_videos;
CREATE POLICY "auth_insert_youtube_videos"
ON youtube_videos FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_youtube_videos" ON youtube_videos;
CREATE POLICY "auth_update_youtube_videos"
ON youtube_videos FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_youtube_videos" ON youtube_videos;
CREATE POLICY "auth_delete_youtube_videos"
ON youtube_videos FOR DELETE
TO authenticated USING (true);
