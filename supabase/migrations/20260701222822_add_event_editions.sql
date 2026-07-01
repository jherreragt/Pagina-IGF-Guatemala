
-- event_editions: year-over-year event management
CREATE TABLE IF NOT EXISTS event_editions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year              text NOT NULL,
  title             text NOT NULL,
  lema              text,
  event_date        text,
  event_location    text NOT NULL DEFAULT 'Ciudad de Guatemala',
  event_modality    text NOT NULL DEFAULT 'Presencial con transmisión en línea',
  datetime_iso      text,
  registration_open boolean NOT NULL DEFAULT true,
  sessions_open     boolean NOT NULL DEFAULT true,
  is_active         boolean NOT NULL DEFAULT false,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE event_editions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_event_editions" ON event_editions;
DROP POLICY IF EXISTS "admin_insert_event_editions"  ON event_editions;
DROP POLICY IF EXISTS "admin_update_event_editions"  ON event_editions;
DROP POLICY IF EXISTS "admin_delete_event_editions"  ON event_editions;

CREATE POLICY "public_select_event_editions" ON event_editions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_insert_event_editions"  ON event_editions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_event_editions"  ON event_editions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_event_editions"  ON event_editions FOR DELETE TO authenticated USING (true);

-- Add edition_id FK to all event content tables
ALTER TABLE event_sessions      ADD COLUMN IF NOT EXISTS edition_id uuid REFERENCES event_editions(id);
ALTER TABLE event_speakers      ADD COLUMN IF NOT EXISTS edition_id uuid REFERENCES event_editions(id);
ALTER TABLE event_allies        ADD COLUMN IF NOT EXISTS edition_id uuid REFERENCES event_editions(id);
ALTER TABLE event_resources     ADD COLUMN IF NOT EXISTS edition_id uuid REFERENCES event_editions(id);
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS edition_id uuid REFERENCES event_editions(id);

CREATE INDEX IF NOT EXISTS idx_event_editions_active       ON event_editions (is_active);
CREATE INDEX IF NOT EXISTS idx_event_editions_year         ON event_editions (year DESC);
CREATE INDEX IF NOT EXISTS idx_event_sessions_edition      ON event_sessions (edition_id);
CREATE INDEX IF NOT EXISTS idx_event_speakers_edition      ON event_speakers (edition_id);
CREATE INDEX IF NOT EXISTS idx_event_allies_edition        ON event_allies (edition_id);
CREATE INDEX IF NOT EXISTS idx_event_resources_edition     ON event_resources (edition_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_edition ON event_registrations (edition_id);

-- Seed initial active edition from site_settings (only if no editions exist yet)
DO $$
DECLARE
  v_year      text;
  v_lema      text;
  v_date      text;
  v_location  text;
  v_modality  text;
  v_datetime  text;
  v_reg_open  boolean;
  v_sess_open boolean;
  v_id        uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM event_editions) THEN
    SELECT COALESCE(value, '2026')                              INTO v_year     FROM site_settings WHERE key = 'event_year';
    SELECT value                                                INTO v_lema     FROM site_settings WHERE key = 'event_lema';
    SELECT value                                                INTO v_date     FROM site_settings WHERE key = 'event_date';
    SELECT COALESCE(value, 'Ciudad de Guatemala')               INTO v_location FROM site_settings WHERE key = 'event_location';
    SELECT COALESCE(value, 'Presencial con transmisión en línea') INTO v_modality FROM site_settings WHERE key = 'event_modality';
    SELECT value                                                INTO v_datetime FROM site_settings WHERE key = 'event_datetime_iso';
    SELECT COALESCE(value, 'true') = 'true'                     INTO v_reg_open  FROM site_settings WHERE key = 'event_registration_open';
    SELECT COALESCE(value, 'true') = 'true'                     INTO v_sess_open FROM site_settings WHERE key = 'event_sessions_open';

    INSERT INTO event_editions (year, title, lema, event_date, event_location, event_modality, datetime_iso, registration_open, sessions_open, is_active)
    VALUES (
      COALESCE(v_year, '2026'),
      'IGF Guatemala ' || COALESCE(v_year, '2026'),
      v_lema,
      v_date,
      COALESCE(v_location, 'Ciudad de Guatemala'),
      COALESCE(v_modality, 'Presencial con transmisión en línea'),
      v_datetime,
      COALESCE(v_reg_open, true),
      COALESCE(v_sess_open, true),
      true
    )
    RETURNING id INTO v_id;

    UPDATE event_sessions      SET edition_id = v_id WHERE edition_id IS NULL;
    UPDATE event_speakers      SET edition_id = v_id WHERE edition_id IS NULL;
    UPDATE event_allies        SET edition_id = v_id WHERE edition_id IS NULL;
    UPDATE event_resources     SET edition_id = v_id WHERE edition_id IS NULL;
    UPDATE event_registrations SET edition_id = v_id WHERE edition_id IS NULL;
  END IF;
END $$;
