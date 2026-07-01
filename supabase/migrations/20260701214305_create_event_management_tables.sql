/*
# Create Event Management Tables

## Overview
Adds four new tables to support the IGF Guatemala annual event page with full
admin-managed content: agenda sessions, speakers, allies/sponsors, resources,
and participant registrations.

## New Tables

### event_sessions
Stores individual agenda sessions for the annual event.
- id: UUID primary key
- title: Session title (required)
- description: Optional full description
- session_type: Type label (Panel, Taller, Plenaria, Conversatorio, Descanso, Logística, etc.)
- axis: Thematic axis the session belongs to
- start_time: Start time string e.g. "09:00"
- end_time: End time string e.g. "10:30"
- event_date: Date string e.g. "2026-10-15"
- room: Room or location within venue
- speakers_text: Free-text speaker info
- sort_order: Integer for manual ordering
- published: Toggle visibility on public page
- created_at: Timestamp

### event_speakers
People participating as speakers, moderators, or panelists.
- id: UUID primary key
- name: Full name (required)
- role: Job title or role
- organization: Affiliated org
- sector: Stakeholder sector (Gobierno, Sociedad Civil, Academia, etc.)
- category: Event role (Ponente, Moderador, Relator, Panelista)
- bio: Optional biography
- photo_url: Optional headshot URL
- session_title: Which session they participate in
- sort_order: Manual ordering
- published: Toggle visibility
- created_at: Timestamp

### event_allies
Supporting organizations (allies, sponsors, international backers).
- id: UUID primary key
- name: Organization name (required)
- ally_type: Category (Apoyo Internacional, Apoyo Técnico, Aliado Nacional, Patrocinador)
- logo_url: Optional logo image URL
- website_url: Optional website link
- sort_order: Manual ordering
- published: Toggle visibility
- created_at: Timestamp

### event_resources
Documents, guides, and files specific to the event.
- id: UUID primary key
- title: Resource title (required)
- description: Optional description
- file_url: URL to download/view
- resource_type: File format label (PDF, ZIP, LINK, etc.)
- sort_order: Manual ordering
- published: Toggle visibility
- created_at: Timestamp

### event_registrations
Participant registrations submitted via the public form.
- id: UUID primary key
- name: Full name (required)
- organization: Affiliated organization
- role: Job title
- email: Email address (required)
- phone: Phone number
- sector: Stakeholder sector
- modality: presencial or virtual
- accepted_conduct: Code of conduct acceptance
- accepted_data: Data use consent
- created_at: Submission timestamp

## Security (RLS)
- event_sessions, event_speakers, event_allies, event_resources:
  - Public SELECT (anon + authenticated) — the event page reads these
  - INSERT/UPDATE/DELETE only for authenticated users (admin)
- event_registrations:
  - Public INSERT (anon + authenticated) — anyone can register
  - SELECT/UPDATE/DELETE only for authenticated users (admin can view registrations)

## Notes
1. All tables use `IF NOT EXISTS` for safe re-application.
2. Policies are dropped before creation to ensure idempotency.
3. sort_order defaults to 0 — admin can set explicit ordering.
*/

-- ────────────────────────────────────────────
-- event_sessions
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  session_type  text NOT NULL DEFAULT 'Panel',
  axis          text,
  start_time    text,
  end_time      text,
  event_date    text,
  room          text,
  speakers_text text,
  sort_order    integer NOT NULL DEFAULT 0,
  published     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_event_sessions"  ON event_sessions;
DROP POLICY IF EXISTS "admin_insert_event_sessions"   ON event_sessions;
DROP POLICY IF EXISTS "admin_update_event_sessions"   ON event_sessions;
DROP POLICY IF EXISTS "admin_delete_event_sessions"   ON event_sessions;

CREATE POLICY "public_select_event_sessions"  ON event_sessions FOR SELECT  TO anon, authenticated USING (true);
CREATE POLICY "admin_insert_event_sessions"   ON event_sessions FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_event_sessions"   ON event_sessions FOR UPDATE  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_event_sessions"   ON event_sessions FOR DELETE  TO authenticated USING (true);

-- ────────────────────────────────────────────
-- event_speakers
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_speakers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  role          text,
  organization  text,
  sector        text,
  category      text NOT NULL DEFAULT 'Ponente',
  bio           text,
  photo_url     text,
  session_title text,
  sort_order    integer NOT NULL DEFAULT 0,
  published     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_event_speakers"  ON event_speakers;
DROP POLICY IF EXISTS "admin_insert_event_speakers"   ON event_speakers;
DROP POLICY IF EXISTS "admin_update_event_speakers"   ON event_speakers;
DROP POLICY IF EXISTS "admin_delete_event_speakers"   ON event_speakers;

CREATE POLICY "public_select_event_speakers"  ON event_speakers FOR SELECT  TO anon, authenticated USING (true);
CREATE POLICY "admin_insert_event_speakers"   ON event_speakers FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_event_speakers"   ON event_speakers FOR UPDATE  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_event_speakers"   ON event_speakers FOR DELETE  TO authenticated USING (true);

-- ────────────────────────────────────────────
-- event_allies
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_allies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  ally_type   text NOT NULL DEFAULT 'Aliado Nacional',
  logo_url    text,
  website_url text,
  sort_order  integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE event_allies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_event_allies"  ON event_allies;
DROP POLICY IF EXISTS "admin_insert_event_allies"   ON event_allies;
DROP POLICY IF EXISTS "admin_update_event_allies"   ON event_allies;
DROP POLICY IF EXISTS "admin_delete_event_allies"   ON event_allies;

CREATE POLICY "public_select_event_allies"  ON event_allies FOR SELECT  TO anon, authenticated USING (true);
CREATE POLICY "admin_insert_event_allies"   ON event_allies FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_event_allies"   ON event_allies FOR UPDATE  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_event_allies"   ON event_allies FOR DELETE  TO authenticated USING (true);

-- ────────────────────────────────────────────
-- event_resources
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_resources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  file_url      text,
  resource_type text NOT NULL DEFAULT 'PDF',
  sort_order    integer NOT NULL DEFAULT 0,
  published     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE event_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_event_resources"  ON event_resources;
DROP POLICY IF EXISTS "admin_insert_event_resources"   ON event_resources;
DROP POLICY IF EXISTS "admin_update_event_resources"   ON event_resources;
DROP POLICY IF EXISTS "admin_delete_event_resources"   ON event_resources;

CREATE POLICY "public_select_event_resources"  ON event_resources FOR SELECT  TO anon, authenticated USING (true);
CREATE POLICY "admin_insert_event_resources"   ON event_resources FOR INSERT  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_event_resources"   ON event_resources FOR UPDATE  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_event_resources"   ON event_resources FOR DELETE  TO authenticated USING (true);

-- ────────────────────────────────────────────
-- event_registrations
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  organization     text,
  role             text,
  email            text NOT NULL,
  phone            text,
  sector           text,
  modality         text,
  accepted_conduct boolean NOT NULL DEFAULT false,
  accepted_data    boolean NOT NULL DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_event_registrations"      ON event_registrations;
DROP POLICY IF EXISTS "admin_select_event_registrations"       ON event_registrations;
DROP POLICY IF EXISTS "admin_delete_event_registrations"       ON event_registrations;

CREATE POLICY "public_insert_event_registrations"  ON event_registrations FOR INSERT  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin_select_event_registrations"   ON event_registrations FOR SELECT  TO authenticated USING (true);
CREATE POLICY "admin_delete_event_registrations"   ON event_registrations FOR DELETE  TO authenticated USING (true);

-- indexes for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_event_sessions_sort    ON event_sessions  (sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_event_speakers_sort    ON event_speakers  (sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_event_allies_sort      ON event_allies    (sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_event_resources_sort   ON event_resources (sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_event_registrations_ts ON event_registrations (created_at DESC);
