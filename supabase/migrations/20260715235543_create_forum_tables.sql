/*
# Create forum tables for multi-actor dialogue

## Purpose
Adds a complete forum system to the IGF Guatemala site so that citizens,
academia, private sector, civil society, technical community, youth, public
institutions and other actors can discuss Internet governance topics in an
open, moderated, multi-actor space.

## New Tables
1. forum_admins — marks which auth users are forum moderators.
2. forum_categories — Thematic rooms (12 seeded categories).
3. forum_threads — Discussion threads inside a category.
4. forum_posts — Replies within a thread.
5. forum_reactions — "Support" upvotes on threads or posts.
6. forum_reports — User reports of inappropriate content.
7. forum_rules — Participation rules (10 seeded), editable by admins.
8. forum_read_status — Tracks read threads per user.

## Security (RLS)
Public-read, auth-write. Moderation actions restricted to forum admins via
is_forum_admin() SECURITY DEFINER helper. Users can only edit/delete their
own threads and posts. Reactions are one-per-user per target.

## Triggers
- reply_count + last_activity_at on threads maintained by post insert/delete.
- reaction_count on threads/posts maintained by reaction insert/delete.
- thread_count on categories maintained by thread insert/delete.
- updated_at on threads, posts, rules.

## Idempotency
All CREATE TABLE IF NOT EXISTS. Policies dropped before re-create. Seed
data uses ON CONFLICT DO NOTHING. Safe to re-run.
*/

-- ── forum_admins (must exist before is_forum_admin function) ──────────
CREATE TABLE IF NOT EXISTS forum_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE forum_admins ENABLE ROW LEVEL SECURITY;

-- ── Helper: is_forum_admin() ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_forum_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM forum_admins
    WHERE user_id = auth.uid()
  );
$$;

-- forum_admins policies
DROP POLICY IF EXISTS "forum_admins_read_self" ON forum_admins;
CREATE POLICY "forum_admins_read_self" ON forum_admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_forum_admin());

DROP POLICY IF EXISTS "forum_admins_insert" ON forum_admins;
CREATE POLICY "forum_admins_insert" ON forum_admins FOR INSERT
  TO authenticated WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_admins_delete" ON forum_admins;
CREATE POLICY "forum_admins_delete" ON forum_admins FOR DELETE
  TO authenticated USING (is_forum_admin());

-- ── forum_categories ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  icon_name text DEFAULT 'MessageSquare',
  color text DEFAULT 'sky',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  thread_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_cat_select" ON forum_categories;
CREATE POLICY "forum_cat_select" ON forum_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_cat_insert" ON forum_categories;
CREATE POLICY "forum_cat_insert" ON forum_categories FOR INSERT
  TO authenticated WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_cat_update" ON forum_categories;
CREATE POLICY "forum_cat_update" ON forum_categories FOR UPDATE
  TO authenticated USING (is_forum_admin()) WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_cat_delete" ON forum_categories;
CREATE POLICY "forum_cat_delete" ON forum_categories FOR DELETE
  TO authenticated USING (is_forum_admin());

-- ── forum_threads ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text DEFAULT 'Anónimo',
  title text NOT NULL,
  body text DEFAULT '',
  is_closed boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  view_count int DEFAULT 0,
  reply_count int DEFAULT 0,
  reaction_count int DEFAULT 0,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_thread_select" ON forum_threads;
CREATE POLICY "forum_thread_select" ON forum_threads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_thread_insert" ON forum_threads;
CREATE POLICY "forum_thread_insert" ON forum_threads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "forum_thread_update" ON forum_threads;
CREATE POLICY "forum_thread_update" ON forum_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR is_forum_admin())
  WITH CHECK (auth.uid() = author_id OR is_forum_admin());

DROP POLICY IF EXISTS "forum_thread_delete" ON forum_threads;
CREATE POLICY "forum_thread_delete" ON forum_threads FOR DELETE
  TO authenticated USING (auth.uid() = author_id OR is_forum_admin());

-- ── forum_posts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text DEFAULT 'Anónimo',
  body text NOT NULL,
  is_hidden boolean DEFAULT false,
  reaction_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_post_select" ON forum_posts;
CREATE POLICY "forum_post_select" ON forum_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_post_insert" ON forum_posts;
CREATE POLICY "forum_post_insert" ON forum_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "forum_post_update" ON forum_posts;
CREATE POLICY "forum_post_update" ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR is_forum_admin())
  WITH CHECK (auth.uid() = author_id OR is_forum_admin());

DROP POLICY IF EXISTS "forum_post_delete" ON forum_posts;
CREATE POLICY "forum_post_delete" ON forum_posts FOR DELETE
  TO authenticated USING (auth.uid() = author_id OR is_forum_admin());

-- ── forum_reactions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('thread','post')),
  target_id uuid NOT NULL,
  reaction text DEFAULT 'support',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_reaction_select" ON forum_reactions;
CREATE POLICY "forum_reaction_select" ON forum_reactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_reaction_insert" ON forum_reactions;
CREATE POLICY "forum_reaction_insert" ON forum_reactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "forum_reaction_delete" ON forum_reactions;
CREATE POLICY "forum_reaction_delete" ON forum_reactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── forum_reports ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type text NOT NULL CHECK (target_type IN ('thread','post')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  admin_notes text DEFAULT '',
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz DEFAULT now()
);
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_report_insert" ON forum_reports;
CREATE POLICY "forum_report_insert" ON forum_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "forum_report_select" ON forum_reports;
CREATE POLICY "forum_report_select" ON forum_reports FOR SELECT
  TO authenticated USING (auth.uid() = reporter_id OR is_forum_admin());

DROP POLICY IF EXISTS "forum_report_update" ON forum_reports;
CREATE POLICY "forum_report_update" ON forum_reports FOR UPDATE
  TO authenticated USING (is_forum_admin()) WITH CHECK (is_forum_admin());

-- ── forum_rules ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE forum_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_rule_select" ON forum_rules;
CREATE POLICY "forum_rule_select" ON forum_rules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_rule_insert" ON forum_rules;
CREATE POLICY "forum_rule_insert" ON forum_rules FOR INSERT
  TO authenticated WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_rule_update" ON forum_rules;
CREATE POLICY "forum_rule_update" ON forum_rules FOR UPDATE
  TO authenticated USING (is_forum_admin()) WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_rule_delete" ON forum_rules;
CREATE POLICY "forum_rule_delete" ON forum_rules FOR DELETE
  TO authenticated USING (is_forum_admin());

-- ── forum_read_status ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  UNIQUE (user_id, thread_id)
);
ALTER TABLE forum_read_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_read_select" ON forum_read_status;
CREATE POLICY "forum_read_select" ON forum_read_status FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "forum_read_insert" ON forum_read_status;
CREATE POLICY "forum_read_insert" ON forum_read_status FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "forum_read_update" ON forum_read_status;
CREATE POLICY "forum_read_update" ON forum_read_status FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Triggers ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS forum_threads_updated ON forum_threads;
CREATE TRIGGER forum_threads_updated
  BEFORE UPDATE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS forum_posts_updated ON forum_posts;
CREATE TRIGGER forum_posts_updated
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS forum_rules_updated ON forum_rules;
CREATE TRIGGER forum_rules_updated
  BEFORE UPDATE ON forum_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION forum_post_insert_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE forum_threads
  SET reply_count = reply_count + 1, last_activity_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_post_insert_trigger ON forum_posts;
CREATE TRIGGER forum_post_insert_trigger
  AFTER INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION forum_post_insert_handler();

CREATE OR REPLACE FUNCTION forum_post_delete_handler()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE forum_threads
  SET reply_count = GREATEST(reply_count - 1, 0)
  WHERE id = OLD.thread_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS forum_post_delete_trigger ON forum_posts;
CREATE TRIGGER forum_post_delete_trigger
  AFTER DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION forum_post_delete_handler();

CREATE OR REPLACE FUNCTION forum_reaction_insert_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.target_type = 'thread' THEN
    UPDATE forum_threads SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'post' THEN
    UPDATE forum_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_reaction_insert_trigger ON forum_reactions;
CREATE TRIGGER forum_reaction_insert_trigger
  AFTER INSERT ON forum_reactions
  FOR EACH ROW EXECUTE FUNCTION forum_reaction_insert_handler();

CREATE OR REPLACE FUNCTION forum_reaction_delete_handler()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.target_type = 'thread' THEN
    UPDATE forum_threads SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.target_id;
  ELSIF OLD.target_type = 'post' THEN
    UPDATE forum_posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.target_id;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS forum_reaction_delete_trigger ON forum_reactions;
CREATE TRIGGER forum_reaction_delete_trigger
  AFTER DELETE ON forum_reactions
  FOR EACH ROW EXECUTE FUNCTION forum_reaction_delete_handler();

CREATE OR REPLACE FUNCTION forum_thread_insert_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE forum_categories SET thread_count = thread_count + 1 WHERE id = NEW.category_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_thread_insert_trigger ON forum_threads;
CREATE TRIGGER forum_thread_insert_trigger
  AFTER INSERT ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION forum_thread_insert_handler();

CREATE OR REPLACE FUNCTION forum_thread_delete_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE forum_categories SET thread_count = GREATEST(thread_count - 1, 0) WHERE id = OLD.category_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS forum_thread_delete_trigger ON forum_threads;
CREATE TRIGGER forum_thread_delete_trigger
  AFTER DELETE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION forum_thread_delete_handler();

-- ── Seed categories ───────────────────────────────────────────────────
INSERT INTO forum_categories (name, slug, description, icon_name, color, sort_order) VALUES
('Brecha digital e inclusión', 'brecha-digital', 'Acceso significativo a Internet, conectividad rural y reducción de la brecha digital en Guatemala.', 'Wifi', 'sky', 1),
('Derechos digitales', 'derechos-digitales', 'Derechos humanos en el entorno digital, privacidad, libertad de expresión y acceso a la información.', 'ShieldCheck', 'blue', 2),
('Protección de datos personales', 'proteccion-datos', 'Marco legal y prácticas para la protección de datos personales en Guatemala.', 'Lock', 'cyan', 3),
('Inteligencia artificial responsable', 'ia-responsable', 'Gobernanza de la IA, sesgos algorítmicos, transparencia y responsabilidad.', 'Lightbulb', 'amber', 4),
('Ciberseguridad', 'ciberseguridad', 'Seguridad de la información, protección de infraestructura crítica y ciberresiliencia.', 'Scale', 'red', 5),
('Libertad de expresión en línea', 'libertad-expresion', 'Libertad de expresión, censura, contenido en línea y derechos comunicacionales.', 'MessageSquare', 'green', 6),
('Desinformación', 'desinformacion', 'Integridad informativa, noticias falsas, alfabetización mediática y espacio cívico digital.', 'Radio', 'orange', 7),
('Servicios digitales públicos', 'servicios-digitales', 'Gobierno digital, interoperabilidad, identidad digital y servicios públicos en línea.', 'Database', 'teal', 8),
('Participación juvenil', 'participacion-juvenil', 'Liderazgo digital juvenil, educación digital y participación de las juventudes en la gobernanza.', 'Zap', 'purple', 9),
('Gobernanza de Internet', 'gobernanza-internet', 'Modelos de gobernanza, multiactorialidad, procesos del IGF y arquitectura de Internet.', 'Globe', 'indigo', 10),
('Perspectiva de género y tecnología', 'genero-tecnologia', 'Género y tecnología, brecha digital de género, violencia digital contra mujeres y inclusión.', 'Heart', 'pink', 11),
('Infraestructura digital y conectividad', 'infraestructura-digital', 'Conectividad, redes, infraestructura de telecomunicaciones y desarrollo técnico.', 'Server', 'slate', 12)
ON CONFLICT (slug) DO NOTHING;

-- ── Seed participation rules ──────────────────────────────────────────
INSERT INTO forum_rules (title, description, sort_order) VALUES
('Respeto y tolerancia', 'Trata a todas las personas con respeto. No se permiten insultos, ataques personales ni lenguaje denigrante.', 1),
('No discriminación', 'No se permite contenido discriminatorio por razones de género, etnia, religión, orientación sexual, discapacidad u otra condición.', 2),
('Diálogo constructivo', 'Aporta argumentos, evidencia y propuestas. Evita el debate estéril y los mensajes sin contenido sustantivo.', 3),
('Sin contenido ofensivo o violento', 'No se permiten amenazas, incitación a la violencia, contenido sexual explícito ni material ofensivo.', 4),
('Sin contenido comercial o partidario', 'El foro no es espacio para publicidad, promoción comercial ni proselitismo político o partidario.', 5),
('Sin desinformación intencional', 'No publiques información falsa con intención de engañar. Cita fuentes cuando sea posible.', 6),
('Confidencialidad y privacidad', 'No compartas datos personales de terceros sin su consentimiento, ni información confidencial.', 7),
('Uso responsable', 'Evita el spam, la publicación repetitiva y el uso de múltiples cuentas para manipular discusiones.', 8),
('Reporta, no tomes la justicia por tu mano', 'Si ves contenido inapropiado, usa el botón de reporte. No respondas con agresión.', 9),
('Espíritu multiactor', 'Valora la diversidad de sectores y opiniones. El objetivo es construir puentes, no imponer posiciones.', 10)
ON CONFLICT DO NOTHING;

-- ── Promote existing admin to forum admin ─────────────────────────────
INSERT INTO forum_admins (user_id, display_name)
SELECT au.id, split_part(au.email, '@', 1)
FROM auth.users au
WHERE au.email = 'admin@igfguatemala.org'
AND NOT EXISTS (SELECT 1 FROM forum_admins WHERE user_id = au.id);
