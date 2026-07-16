/*
# Home Content Tables & Settings

## Overview
Makes all hardcoded content on the Home page and Footer administrable via the
admin panel. Currently many texts, lists, stats and links are written directly
in React source. This migration introduces four lightweight content tables and
a batch of new site_settings rows so the admin can edit everything without
touching code.

## New Tables (all single-tenant, public read/write via anon+authenticated)
1. `home_stats` — numeric stats shown in the hero (e.g. "8+ Ediciones").
   Columns: id, number, label, icon_name, sort_order, published, created_at.
2. `home_why_matters` — "Por qué importa" cards (e.g. "Brecha digital").
   Columns: id, label, icon_name, sort_order, published, created_at.
3. `home_principles` — principle chips shown in the principles section.
   Columns: id, label, sort_order, published, created_at.
4. `home_stakeholders` — community multi-actor cards (e.g. "Gobierno").
   Columns: id, label, description, icon_name, sort_order, published, created_at.

## New site_settings rows (section = "inicio")
- home_badge_text          — hero badge ("Capítulo Nacional · IGF Global")
- about_extra_1            — first extra paragraph in "¿Qué es?"
- about_extra_2            — second extra paragraph in "¿Qué es?"
- why_matters_title        — "¿Por qué importa la gobernanza de Internet?"
- why_matters_intro        — intro paragraph under the title
- principles_title         — "Principios del IGF Guatemala"
- principles_intro         — intro text under principles title
- community_title          — "Comunidad Multiactor"
- community_intro          — intro text under community title
- past_editions_title      — "Ediciones Anteriores"
- past_editions_intro      — "La memoria histórica..."
- resources_title          — "Recursos y Materiales"
- resources_intro          — "Documentos, guías, relatorías..."
- resources_list           — newline-separated list of bullet items
- event_cta_title          — "Evento Anual" (line 1 of heading)
- event_cta_badge          — "Próximo evento"
- hero_btn_1_text          — "Conoce el evento anual"
- hero_btn_2_text          — "Súmate a la comunidad"
- hero_btn_3_text          — "Ver recursos"

## New site_settings rows (section = "footer")
- footer_description       — brand paragraph in footer
- footer_cta_text          — "Súmate a la comunidad" link text

## Security
- RLS enabled on all 4 new tables.
- CRUD policies for anon + authenticated (single-tenant, public content).

## Notes
1. Seed data is inserted for all new tables and settings so the site looks
   identical before and after the change.
2. All tables use gen_random_uuid() for primary keys and now() for timestamps.
3. icon_name stores a lucide-react icon name string; the frontend maps it to
   the component.
*/

-- ═══════════════════════════════════════════════════════════════════════
-- 1. home_stats
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS home_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  label text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Globe',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE home_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_home_stats" ON home_stats;
CREATE POLICY "anon_select_home_stats" ON home_stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_home_stats" ON home_stats;
CREATE POLICY "anon_insert_home_stats" ON home_stats FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_home_stats" ON home_stats;
CREATE POLICY "anon_update_home_stats" ON home_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_home_stats" ON home_stats;
CREATE POLICY "anon_delete_home_stats" ON home_stats FOR DELETE TO anon, authenticated USING (true);

INSERT INTO home_stats (number, label, icon_name, sort_order) VALUES
  ('8+', 'Ediciones', 'Calendar', 1),
  ('500+', 'Participantes', 'Users', 2),
  ('7', 'Sectores', 'Building2', 3),
  ('8', 'Ejes temáticos', 'Lightbulb', 4)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 2. home_why_matters
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS home_why_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  icon_name text NOT NULL DEFAULT 'ShieldCheck',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE home_why_matters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_home_why_matters" ON home_why_matters;
CREATE POLICY "anon_select_home_why_matters" ON home_why_matters FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_home_why_matters" ON home_why_matters;
CREATE POLICY "anon_insert_home_why_matters" ON home_why_matters FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_home_why_matters" ON home_why_matters;
CREATE POLICY "anon_update_home_why_matters" ON home_why_matters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_home_why_matters" ON home_why_matters;
CREATE POLICY "anon_delete_home_why_matters" ON home_why_matters FOR DELETE TO anon, authenticated USING (true);

INSERT INTO home_why_matters (label, icon_name, sort_order) VALUES
  ('Brecha digital', 'Wifi', 1),
  ('Derechos digitales', 'ShieldCheck', 2),
  ('Protección de datos', 'Lock', 3),
  ('IA responsable', 'Lightbulb', 4),
  ('Ciberseguridad', 'Scale', 5),
  ('Libertad de expresión', 'MessageSquare', 6),
  ('Desinformación', 'Radio', 7),
  ('Servicios digitales', 'Database', 8),
  ('Inclusión digital', 'Heart', 9)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 3. home_principles
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS home_principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE home_principles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_home_principles" ON home_principles;
CREATE POLICY "anon_select_home_principles" ON home_principles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_home_principles" ON home_principles;
CREATE POLICY "anon_insert_home_principles" ON home_principles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_home_principles" ON home_principles;
CREATE POLICY "anon_update_home_principles" ON home_principles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_home_principles" ON home_principles;
CREATE POLICY "anon_delete_home_principles" ON home_principles FOR DELETE TO anon, authenticated USING (true);

INSERT INTO home_principles (label, sort_order) VALUES
  ('Apertura', 1),
  ('Inclusión', 2),
  ('Participación multiactor', 3),
  ('Transparencia', 4),
  ('Neutralidad política', 5),
  ('Respeto y no discriminación', 6),
  ('Construcción de consensos', 7),
  ('Enfoque de derechos humanos', 8),
  ('Perspectiva de género', 9),
  ('Participación juvenil', 10),
  ('Carácter no comercial', 11),
  ('Diálogo basado en evidencia', 12)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 4. home_stakeholders
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS home_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'Users',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE home_stakeholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_home_stakeholders" ON home_stakeholders;
CREATE POLICY "anon_select_home_stakeholders" ON home_stakeholders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_home_stakeholders" ON home_stakeholders;
CREATE POLICY "anon_insert_home_stakeholders" ON home_stakeholders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_home_stakeholders" ON home_stakeholders;
CREATE POLICY "anon_update_home_stakeholders" ON home_stakeholders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_home_stakeholders" ON home_stakeholders;
CREATE POLICY "anon_delete_home_stakeholders" ON home_stakeholders FOR DELETE TO anon, authenticated USING (true);

INSERT INTO home_stakeholders (label, description, icon_name, sort_order) VALUES
  ('Gobierno', 'Instituciones públicas', 'Building2', 1),
  ('Sociedad Civil', 'Organizaciones y activistas', 'Heart', 2),
  ('Sector Privado', 'Industria tecnológica', 'TrendingUp', 3),
  ('Com. Técnica', 'Expertos en infraestructura', 'Laptop', 4),
  ('Academia', 'Universidades e investigación', 'GraduationCap', 5),
  ('Juventudes', 'Líderes digitales jóvenes', 'Zap', 6),
  ('Org. Internacionales', 'Cooperación global', 'Globe', 7),
  ('Medios', 'Comunicadores digitales', 'Radio', 8)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- 5. New site_settings rows
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO site_settings (key, value, label, section, type, sort_order) VALUES
  -- inicio section
  ('home_badge_text', 'Capítulo Nacional · IGF Global', 'Texto del badge del hero', 'inicio', 'text', 1),
  ('about_extra_1', 'Funciona como un espacio de diálogo abierto, sin fines de lucro, donde múltiples sectores se reúnen en igualdad de condiciones para discutir los desafíos y oportunidades del ecosistema digital del país.', 'Párrafo extra 1 (¿Qué es?)', 'inicio', 'textarea', 2),
  ('about_extra_2', 'No toma decisiones vinculantes, sino que genera recomendaciones, construye puentes y fortalece la participación de Guatemala en las discusiones globales.', 'Párrafo extra 2 (¿Qué es?)', 'inicio', 'textarea', 3),
  ('why_matters_title', '¿Por qué importa la gobernanza de Internet?', 'Título de sección "Por qué importa"', 'inicio', 'text', 4),
  ('why_matters_intro', 'Las decisiones sobre Internet afectan derechos, desarrollo y democracia. Estos son los temas concretos que importan para Guatemala.', 'Intro de "Por qué importa"', 'inicio', 'textarea', 5),
  ('principles_title', 'Principios del IGF Guatemala', 'Título de sección principios', 'inicio', 'text', 6),
  ('principles_intro', 'Los valores fundamentales que guían cada acción, conversación y decisión del capítulo.', 'Intro de principios', 'inicio', 'textarea', 7),
  ('community_title', 'Comunidad Multiactor', 'Título de sección comunidad', 'inicio', 'text', 8),
  ('community_intro', 'Una plataforma compartida donde todos los sectores participan en igualdad de condiciones.', 'Intro de comunidad', 'inicio', 'textarea', 9),
  ('past_editions_title', 'Ediciones Anteriores', 'Título de ediciones anteriores', 'inicio', 'text', 10),
  ('past_editions_intro', 'La memoria histórica del diálogo sobre gobernanza de Internet en Guatemala.', 'Intro de ediciones anteriores', 'inicio', 'textarea', 11),
  ('resources_title', 'Recursos y Materiales', 'Título de sección recursos', 'inicio', 'text', 12),
  ('resources_intro', 'Documentos, guías, relatorías, publicaciones y materiales para entender y participar en el debate sobre gobernanza de Internet.', 'Intro de recursos', 'inicio', 'textarea', 13),
  ('resources_list', 'Documentos del IGF Global
Guías sobre gobernanza de Internet
Publicaciones sobre derechos digitales
Relatorías y memorias de eventos
Glosario de gobernanza de Internet
Materiales para docentes y funcionarios', 'Lista de recursos (una línea por ítem)', 'inicio', 'textarea', 14),
  ('event_cta_title', 'Evento Anual', 'Título del CTA del evento', 'inicio', 'text', 15),
  ('event_cta_badge', 'Próximo evento', 'Badge del CTA del evento', 'inicio', 'text', 16),
  ('hero_btn_1_text', 'Conoce el evento anual', 'Texto botón 1 del hero', 'inicio', 'text', 17),
  ('hero_btn_2_text', 'Súmate a la comunidad', 'Texto botón 2 del hero', 'inicio', 'text', 18),
  ('hero_btn_3_text', 'Ver recursos', 'Texto botón 3 del hero', 'inicio', 'text', 19),
  -- footer section
  ('footer_description', 'Un espacio abierto, inclusivo y multiactor para dialogar sobre el futuro de Internet en Guatemala.', 'Descripción del footer', 'footer', 'text', 1),
  ('footer_cta_text', 'Súmate a la comunidad', 'Texto del CTA del footer', 'footer', 'text', 2)
ON CONFLICT (key) DO NOTHING;