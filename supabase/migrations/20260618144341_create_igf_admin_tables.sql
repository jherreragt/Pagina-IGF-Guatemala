
-- Site settings table for configurable page content
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  label text NOT NULL,
  section text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_site_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

-- Blog posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  cover_url text,
  author text DEFAULT 'IGF Guatemala',
  category text DEFAULT 'General',
  tags text[] DEFAULT '{}',
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_published_posts" ON blog_posts FOR SELECT
  TO anon USING (published = true);

CREATE POLICY "select_all_posts_auth" ON blog_posts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_posts" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "update_posts" ON blog_posts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "delete_posts" ON blog_posts FOR DELETE
  TO authenticated USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed initial site settings
INSERT INTO site_settings (key, value, label, section, type, sort_order) VALUES
-- Hero section
('hero_title', 'IGF Guatemala', 'Título principal', 'hero', 'text', 1),
('hero_subtitle', 'Un espacio abierto, inclusivo y multiactor para dialogar sobre el futuro de Internet en Guatemala.', 'Subtítulo / Lema', 'hero', 'textarea', 2),
('hero_description', 'Reunimos a gobierno, sociedad civil, sector privado, academia, comunidad técnica, juventudes y organismos internacionales para discutir los principales desafíos digitales del país y construir propuestas para una Internet abierta, segura, confiable, inclusiva y centrada en las personas.', 'Descripción principal', 'hero', 'textarea', 3),

-- Evento anual section
('event_year', '2026', 'Año del evento', 'evento', 'text', 1),
('event_date', '15 de octubre de 2026', 'Fecha del evento', 'evento', 'text', 2),
('event_location', 'Ciudad de Guatemala', 'Lugar del evento', 'evento', 'text', 3),
('event_modality', 'Presencial con transmisión en línea', 'Modalidad', 'evento', 'text', 4),
('event_lema', 'Por una Internet abierta, segura, inclusiva y democrática para Guatemala', 'Lema del evento', 'evento', 'textarea', 5),
('event_datetime_iso', '2026-10-15T09:00:00', 'Fecha ISO para cuenta regresiva', 'evento', 'text', 6),
('event_registration_open', 'true', 'Registro abierto', 'evento', 'boolean', 7),
('event_sessions_open', 'true', 'Convocatoria de sesiones abierta', 'evento', 'boolean', 8),

-- Sección sobre IGF
('about_title', '¿Qué es el IGF Guatemala?', 'Título de sección', 'sobre', 'text', 1),
('about_body', 'El IGF Guatemala es el capítulo nacional del Internet Governance Forum (IGF), el principal foro multilateral de las Naciones Unidas para el diálogo sobre políticas de Internet. Fue establecido para trasladar esas conversaciones globales al contexto de Guatemala.', 'Descripción', 'sobre', 'textarea', 2),

-- Visibilidad de secciones
('show_principles', 'true', 'Mostrar sección de principios', 'visibilidad', 'boolean', 1),
('show_community', 'true', 'Mostrar sección de comunidad', 'visibilidad', 'boolean', 2),
('show_themes', 'true', 'Mostrar sección de ejes temáticos', 'visibilidad', 'boolean', 3),
('show_past_editions', 'true', 'Mostrar ediciones anteriores', 'visibilidad', 'boolean', 4),
('show_resources_cta', 'true', 'Mostrar sección de recursos', 'visibilidad', 'boolean', 5),
('show_blog', 'true', 'Mostrar sección de blog', 'visibilidad', 'boolean', 6),

-- Contacto
('contact_email', 'info@igfguatemala.org', 'Correo de contacto', 'contacto', 'text', 1),
('contact_address', 'Ciudad de Guatemala, Guatemala', 'Dirección', 'contacto', 'text', 2),
('contact_twitter', '@IGFGuatemala', 'Twitter/X', 'contacto', 'text', 3),
('contact_youtube', 'IGF Guatemala', 'YouTube', 'contacto', 'text', 4);
