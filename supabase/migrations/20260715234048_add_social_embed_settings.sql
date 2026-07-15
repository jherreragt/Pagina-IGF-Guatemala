/*
# Add social embed settings for Facebook and YouTube

1. Purpose
   Adds configurable site settings so the public site can embed:
   - The IGF Guatemala Facebook page posts (Facebook Page Plugin).
   - Previous webinar videos from YouTube (YouTube channel/playlist embeds).
   These power a new "Comunidad Digital" public page that showcases social
   activity alongside the existing multiactor community description.

2. New rows in `site_settings` (existing table, no schema changes)
   - `facebook_page_url` (section: contacto, type: url): Full URL of the
     Facebook Page to embed (e.g. https://www.facebook.com/IGFGuatemala).
   - `facebook_page_name` (section: contacto, type: text): Display name for
     the Facebook Page, shown as a label above the embed.
   - `youtube_channel_id` (section: contacto, type: text): YouTube channel ID
     (UC...) or custom handle used to build the channel/playlist embed URL.
   - `youtube_playlist_id` (section: contacto, type: text): Optional YouTube
     playlist ID (PL...) to embed a specific "Webinars" playlist. Falls back
     to the channel's videos if empty.
   - `youtube_channel_name` (section: contacto, type: text): Display name for
     the YouTube channel, shown as a label above the embed.
   - `show_social_embeds` (section: visibilidad, type: boolean): Toggles
     whether the social embeds section is visible on the public site.

3. Security
   No new tables. Existing `site_settings` RLS already allows anon reads and
   authenticated CRUD. No policy changes needed.

4. Idempotency
   Each insert is guarded with a NOT EXISTS check on the key, so re-running
   this migration is safe.
*/

INSERT INTO site_settings (key, value, label, section, type, sort_order)
SELECT 'facebook_page_url', '', 'URL de página de Facebook', 'contacto', 'url', 5
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'facebook_page_url');

INSERT INTO site_settings (key, value, label, section, type, sort_order)
SELECT 'facebook_page_name', 'IGF Guatemala', 'Nombre de página de Facebook', 'contacto', 'text', 6
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'facebook_page_name');

INSERT INTO site_settings (key, value, label, section, type, sort_order)
SELECT 'youtube_channel_id', '', 'ID de canal de YouTube (UC...)', 'contacto', 'text', 7
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'youtube_channel_id');

INSERT INTO site_settings (key, value, label, section, type, sort_order)
SELECT 'youtube_playlist_id', '', 'ID de playlist de YouTube (PL...)', 'contacto', 'text', 8
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'youtube_playlist_id');

INSERT INTO site_settings (key, value, label, section, type, sort_order)
SELECT 'youtube_channel_name', 'IGF Guatemala', 'Nombre del canal de YouTube', 'contacto', 'text', 9
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'youtube_channel_name');

INSERT INTO site_settings (key, value, label, section, type, sort_order)
SELECT 'show_social_embeds', 'true', 'Mostrar embeds sociales (Facebook y YouTube)', 'visibilidad', 'boolean', 7
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'show_social_embeds');
