/*
# Mejora de moderación del foro: lineamientos, reportes categorizados, moderación directa y cola de revisión

## Propósito (en español)
Moderniza el sistema de moderación del foro del IGF Guatemala con cuatro
capacidades nuevas:
  1. Aceptación obligatoria de Lineamientos de Respeto y Convivencia al
     registrarse, con registro de quién aceptó, qué versión y cuándo.
  2. Reportes con motivo categorizado (discriminación, acoso, discurso de
     odio, spam, ataques personales, desinformación, otro) además del
     texto libre existente.
  3. Moderación directa desde la página pública del hilo: ocultar/fijar/
     cerrar/destacar/eliminar, ya que ahora los hilos también pueden
     ocultarse (is_hidden) como ya ocurría con las respuestas.
  4. Cola de moderación del primer aporte: la primera publicación (hilo o
     respuesta) de cada usuaria/usuario nuevo queda "pendiente" hasta que
     un moderador la aprueba. Las siguientes se auto-aprueban.

## Tablas nuevas
- `forum_code_of_conduct` — secciones del código de conducta (título,
  cuerpo, orden, activo). Editable por administradores del foro; lectura
  pública. Se siembra con un código completo en español.
- `forum_conduct_meta` — una sola fila (id=1) con `current_version` para
  forzar re-aceptación cuando se actualiza el código. Sembrada en 1.
- `forum_conduct_acceptances` — registro de aceptación por usuaria/
  usuario: user_id (único), versión aceptada, fecha. Solo el propio
  usuario lee/inserta; los admin del foro pueden leer todas.

## Columnas nuevas
- `forum_threads.is_hidden` (boolean, default false) — ocultar hilo.
- `forum_threads.moderation_status` (text, 'approved'|'pending',
  default 'approved') — estado de moderación.
- `forum_threads.moderation_note` (text, default '') — nota interna del
  moderador.
- `forum_posts.moderation_status` (text, 'approved'|'pending',
  default 'approved').
- `forum_posts.moderation_note` (text, default '').
- `forum_reports.reason_category` (text, categoría CHECK, default 'otro')
  — motivo categorizado del reporte.

## Cambios de seguridad (RLS)
- SELECT de `forum_threads` y `forum_posts` ahora filtra: contenido
  aprobado Y no oculto para el público; el autor siempre ve lo suyo;
  los admin del foro ven todo. Antes era USING (true).
- Políticas CRUD nuevas para las tres tablas nuevas siguiendo el patrón
  del foro (público-lectura / admin-escritura; aceptaciones con
  propiedad por auth.uid()).

## Triggers
- `forum_thread_moderation_check` (BEFORE INSERT en forum_threads):
  si el autor no tiene contenido aprobado previo y no es admin del
  foro, marca el hilo como 'pending'.
- `forum_post_moderation_check` (BEFORE INSERT en forum_posts): igual
  para respuestas.
- `forum_thread_moderation_trigger` (AFTER UPDATE OF moderation_status):
  ajusta thread_count de la categoría al aprobar/desaprobar.
- `forum_post_moderation_trigger` (AFTER UPDATE OF moderation_status):
  ajusta reply_count y last_activity_at del hilo al aprobar/desaprobar.
- Se reemplazan `forum_post_insert_handler` y
  `forum_thread_insert_handler` para que solo muevan contadores cuando
  el contenido queda 'approved' (así los pendientes no inflan cifras
  visibles).

## Idempotencia
- Todas las CREATE TABLE IF NOT EXISTS; columnas con ADD COLUMN IF NOT
  EXISTS; políticas DROP IF EXISTS antes de CREATE; seeds con ON
  CONFLICT DO NOTHING. Segura de re-ejecutar.
*/

-- ═══════════════════════════════════════════════════════════════════
-- 1. forum_code_of_conduct
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS forum_code_of_conduct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE forum_code_of_conduct ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_conduct_select" ON forum_code_of_conduct;
CREATE POLICY "forum_conduct_select" ON forum_code_of_conduct
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_conduct_insert" ON forum_code_of_conduct;
CREATE POLICY "forum_conduct_insert" ON forum_code_of_conduct
  FOR INSERT TO authenticated WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_conduct_update" ON forum_code_of_conduct;
CREATE POLICY "forum_conduct_update" ON forum_code_of_conduct
  FOR UPDATE TO authenticated USING (is_forum_admin()) WITH CHECK (is_forum_admin());

DROP POLICY IF EXISTS "forum_conduct_delete" ON forum_code_of_conduct;
CREATE POLICY "forum_conduct_delete" ON forum_code_of_conduct
  FOR DELETE TO authenticated USING (is_forum_admin());

DROP TRIGGER IF EXISTS forum_conduct_updated ON forum_code_of_conduct;
CREATE TRIGGER forum_conduct_updated
  BEFORE UPDATE ON forum_code_of_conduct
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 2. forum_conduct_meta (una sola fila, id=1)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS forum_conduct_meta (
  id int PRIMARY KEY DEFAULT 1,
  current_version int NOT NULL DEFAULT 1,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT forum_conduct_meta_single_row CHECK (id = 1)
);
INSERT INTO forum_conduct_meta (id, current_version) VALUES (1, 1)
  ON CONFLICT (id) DO NOTHING;
ALTER TABLE forum_conduct_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_conduct_meta_select" ON forum_conduct_meta;
CREATE POLICY "forum_conduct_meta_select" ON forum_conduct_meta
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "forum_conduct_meta_update" ON forum_conduct_meta;
CREATE POLICY "forum_conduct_meta_update" ON forum_conduct_meta
  FOR UPDATE TO authenticated USING (is_forum_admin()) WITH CHECK (is_forum_admin());

-- ═══════════════════════════════════════════════════════════════════
-- 3. forum_conduct_acceptances
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS forum_conduct_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  accepted_at timestamptz DEFAULT now()
);
ALTER TABLE forum_conduct_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forum_acceptance_select" ON forum_conduct_acceptances;
CREATE POLICY "forum_acceptance_select" ON forum_conduct_acceptances
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_forum_admin());

DROP POLICY IF EXISTS "forum_acceptance_upsert" ON forum_conduct_acceptances;
CREATE POLICY "forum_acceptance_upsert" ON forum_conduct_acceptances
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "forum_acceptance_update" ON forum_conduct_acceptances;
CREATE POLICY "forum_acceptance_update" ON forum_conduct_acceptances
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 4. Columnas nuevas en forum_threads, forum_posts, forum_reports
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE forum_threads
  ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('approved','pending')),
  ADD COLUMN IF NOT EXISTS moderation_note text DEFAULT '';

ALTER TABLE forum_posts
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('approved','pending')),
  ADD COLUMN IF NOT EXISTS moderation_note text DEFAULT '';

ALTER TABLE forum_reports
  ADD COLUMN IF NOT EXISTS reason_category text NOT NULL DEFAULT 'otro'
    CHECK (reason_category IN ('discriminacion','acoso','discurso_odio','spam','ataques_personales','desinformacion','otro'));

-- ═══════════════════════════════════════════════════════════════════
-- 5. Políticas SELECT actualizadas (filtran pendientes/ocultos)
-- ═══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "forum_thread_select" ON forum_threads;
CREATE POLICY "forum_thread_select" ON forum_threads
  FOR SELECT TO anon, authenticated
  USING (
    (moderation_status = 'approved' AND NOT is_hidden)
    OR auth.uid() = author_id
    OR is_forum_admin()
  );

DROP POLICY IF EXISTS "forum_post_select" ON forum_posts;
CREATE POLICY "forum_post_select" ON forum_posts
  FOR SELECT TO anon, authenticated
  USING (
    (moderation_status = 'approved' AND NOT is_hidden)
    OR auth.uid() = author_id
    OR is_forum_admin()
  );

-- ═══════════════════════════════════════════════════════════════════
-- 6. Triggers de moderación: marcar pendiente al primer aporte
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION forum_thread_moderation_check()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  has_prior boolean;
BEGIN
  IF NEW.author_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF is_forum_admin() THEN
    RETURN NEW;
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM forum_threads
      WHERE author_id = NEW.author_id AND moderation_status = 'approved'
    UNION
    SELECT 1 FROM forum_posts
      WHERE author_id = NEW.author_id AND moderation_status = 'approved'
  ) INTO has_prior;
  IF NOT has_prior THEN
    NEW.moderation_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_thread_moderation_check_trigger ON forum_threads;
CREATE TRIGGER forum_thread_moderation_check_trigger
  BEFORE INSERT ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION forum_thread_moderation_check();

CREATE OR REPLACE FUNCTION forum_post_moderation_check()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  has_prior boolean;
BEGIN
  IF NEW.author_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF is_forum_admin() THEN
    RETURN NEW;
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM forum_threads
      WHERE author_id = NEW.author_id AND moderation_status = 'approved'
    UNION
    SELECT 1 FROM forum_posts
      WHERE author_id = NEW.author_id AND moderation_status = 'approved'
  ) INTO has_prior;
  IF NOT has_prior THEN
    NEW.moderation_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_post_moderation_check_trigger ON forum_posts;
CREATE TRIGGER forum_post_moderation_check_trigger
  BEFORE INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION forum_post_moderation_check();

-- ═══════════════════════════════════════════════════════════════════
-- 7. Reemplazar contadores para respetar moderation_status
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION forum_post_insert_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.moderation_status = 'approved' THEN
    UPDATE forum_threads
    SET reply_count = reply_count + 1, last_activity_at = now()
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION forum_post_delete_handler()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.moderation_status = 'approved' THEN
    UPDATE forum_threads
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.thread_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION forum_thread_insert_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.moderation_status = 'approved' THEN
    UPDATE forum_categories SET thread_count = thread_count + 1 WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION forum_thread_delete_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.moderation_status = 'approved' THEN
    UPDATE forum_categories SET thread_count = GREATEST(thread_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN OLD;
END;
$$;

-- Ajuste de contadores al cambiar estado de moderación
CREATE OR REPLACE FUNCTION forum_thread_moderation_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.moderation_status = 'pending' AND NEW.moderation_status = 'approved' THEN
    UPDATE forum_categories SET thread_count = thread_count + 1 WHERE id = NEW.category_id;
  ELSIF OLD.moderation_status = 'approved' AND NEW.moderation_status = 'pending' THEN
    UPDATE forum_categories SET thread_count = GREATEST(thread_count - 1, 0) WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_thread_moderation_trigger ON forum_threads;
CREATE TRIGGER forum_thread_moderation_trigger
  AFTER UPDATE OF moderation_status ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION forum_thread_moderation_handler();

CREATE OR REPLACE FUNCTION forum_post_moderation_handler()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.moderation_status = 'pending' AND NEW.moderation_status = 'approved' THEN
    UPDATE forum_threads
    SET reply_count = reply_count + 1, last_activity_at = now()
    WHERE id = NEW.thread_id;
  ELSIF OLD.moderation_status = 'approved' AND NEW.moderation_status = 'pending' THEN
    UPDATE forum_threads
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_post_moderation_trigger ON forum_posts;
CREATE TRIGGER forum_post_moderation_trigger
  AFTER UPDATE OF moderation_status ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION forum_post_moderation_handler();

-- ═══════════════════════════════════════════════════════════════════
-- 8. Sembrar el código de conducta (español)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO forum_code_of_conduct (title, body, sort_order) VALUES
('Respeto a las personas', 'Tratarás a todas las personas con respeto, sin importar su sector, opinión, género, etnia, religión, orientación sexual, discapacidad, edad u otra condición. No se permiten insultos, burlas ni lenguaje denigrante hacia otras participantes.', 1),
('No discriminación ni exclusiones', 'No publicarás contenido que discrimine, excluya o promueva el rechazo hacia personas o grupos por razones de género, etnia, religión, orientación sexual, discapacidad, origen, clase social u otra condición.', 2),
('Cero acoso y cero violencia', 'No se permiten el acoso, el hostigamiento, las amenazas, la intimidación ni la incitación a la violencia. Tampoco contenido que sexualice o degrade a otras personas. El acoso hacia cualquier participante es motivo de expulsión inmediata.', 3),
('Sin discurso de odio', 'No se permite el discurso de odio: mensajes que ataquen, deshumanicen o inciten al odio contra grupos por su identidad o condición. La crítica a ideas es válida; el ataque a personas por lo que son, no.', 4),
('Diálogo constructivo y multiactor', 'Aportarás argumentos, evidencia y propuestas. El foro es un espacio multiactor: valora la diversidad de sectores (academia, sociedad civil, sector privado, juventudes, instituciones públicas, comunidad técnica). El objetivo es construir puentes, no imponer posiciones.', 5),
('Sin desinformación intencional', 'No publicarás información falsa con intención de engañar. Cuando afirme algo relevante, cita fuentes en la medida de lo posible. La alfabetización informacional es parte de la gobernanza de Internet.', 6),
('Privacidad y confidencialidad', 'No compartirás datos personales de terceros sin su consentimiento, ni información confidencial. Respeta la privacidad de las demás participantes.', 7),
('Uso responsable, sin spam', 'No harás spam, publicación repetitiva, ni usarás múltiples cuentas para manipular discusiones. El foro no es espacio para publicidad, promoción comercial ni proselitismo político o partidario.', 8),
('Reporta, no tomes la justicia por tu mano', 'Si ves contenido que infringe estos lineamientos, usa el botón de reporte. No respondas con agresión. El equipo de moderación revisará cada reporte.', 9),
('Consecuencias de las infracciones', 'El equipo de moderación puede ocultar, eliminar o dejar pendiente contenido que infrinja estos lineamientos. Las infracciones reiteradas o graves (acoso, discurso de odio, amenazas) pueden derivar en suspensión o expulsión del foro. La moderación no busca limitar la diversidad de opiniones, sino garantizar un espacio seguro, respetuoso y útil para la construcción colectiva.', 10)
ON CONFLICT DO NOTHING;
