/*
# Actualizar categorías del foro con las 11 nuevas temáticas del IGF Guatemala

## Cambios
1. Se insertan 11 nuevas categorías temáticas alineadas con los ejes del IGF Guatemala 2026.
2. Se reasigna el único hilo existente (en "ciberseguridad") a la nueva categoría
   "Gobernanza nacional de la ciberseguridad y marco jurídico institucional".
3. Se desactivan (is_active = false) las 12 categorías antiguas para que ya no
   aparezcan en el foro público, preservando la integridad de los datos.
4. Las nuevas categorías conservan iconos y colores acordes a cada temática.

## Tablas afectadas
- forum_categories: inserción de 11 categorías, desactivación de 12 existentes.
- forum_threads: reasignación de category_id para el hilo existente.

## Seguridad
- No se modifican políticas RLS ni se alteran permisos existentes.
- La migración es idempotente: usa ON CONFLICT (slug) DO NOTHING.
*/

-- ── 1. Insertar las 11 nuevas categorías ──────────────────────────────
INSERT INTO forum_categories (name, slug, description, icon_name, color, sort_order) VALUES
('Seguridad y bienestar digital de la niñez, adolescencia y personas vulnerables',
 'seguridad-bienestar-digital-ninez',
 'Protección de niñas, niños, adolescentes y personas vulnerables en el entorno digital: acceso seguro, riesgos en línea y estrategias de prevención.',
 'ShieldCheck', 'red', 1),
('Privacidad, protección de datos personales e identidad digital',
 'privacidad-datos-identidad-digital',
 'Marco legal y buenas prácticas para la protección de datos personales, el derecho a la privacidad y la construcción de una identidad digital segura.',
 'Lock', 'cyan', 2),
('Ciberdelincuencia, fraude digital y protección de los usuarios',
 'ciberdelincuencia-fraude-digital',
 'Prevención y respuesta frente al fraude digital, estafas en línea y ciberdelincuencia. Mecanismos de protección y denuncia para los usuarios.',
 'ShieldAlert', 'orange', 3),
('Servicios públicos digitales, interoperabilidad y gobernanza de datos',
 'servicios-publicos-digitales-interoperabilidad',
 'Gobierno digital, interoperabilidad de sistemas públicos, gobernanza de datos y calidad de los servicios digitales para la ciudadanía.',
 'Database', 'teal', 4),
('Conectividad significativa e infraestructura digital resiliente',
 'conectividad-significativa-infraestructura',
 'Acceso significativo a Internet, conectividad rural, redes resilientes y desarrollo de infraestructura digital para todo el país.',
 'Wifi', 'sky', 5),
('Inteligencia Artificial, educación y futuro del trabajo',
 'ia-educacion-futuro-trabajo',
 'Impacto de la IA en la educación, el empleo y el desarrollo de capacidades. Oportunidades, desafíos y preparación para el futuro del trabajo.',
 'Lightbulb', 'amber', 6),
('Integridad de la información, desinformación y libertad de expresión',
 'integridad-informacion-desinformacion',
 'Integridad informativa, combate a la desinformación, alfabetización mediática y garantía de la libertad de expresión en el entorno digital.',
 'Radio', 'green', 7),
('Gobernanza, seguridad y uso responsable de la Inteligencia Artificial',
 'gobernanza-seguridad-ia',
 'Gobernanza de la IA, transparencia algorítmica, sesgos, responsabilidad y marcos para un uso seguro y ético de los sistemas de IA.',
 'Brain', 'purple', 8),
('Inclusión, alfabetización y desarrollo de capacidades digitales',
 'inclusion-alfabetizacion-capacidades-digitales',
 'Reducción de la brecha digital, alfabetización digital, inclusión de grupos históricamente marginados y desarrollo de capacidades para la era digital.',
 'Users', 'blue', 9),
('Resiliencia digital, infraestructura crítica y respuesta a incidentes',
 'resiliencia-digital-infraestructura-critica',
 'Ciberresiliencia, protección de infraestructura crítica, respuesta a incidentes de ciberseguridad y continuidad operativa de sistemas estratégicos.',
 'Server', 'slate', 10),
('Gobernanza nacional de la ciberseguridad y marco jurídico institucional',
 'gobernanza-ciberseguridad-marco-juridico',
 'Política nacional de ciberseguridad, marco jurídico e institucional, cooperación multiactor y estrategias para fortalecer la ciberseguridad del país.',
 'Scale', 'indigo', 11)
ON CONFLICT (slug) DO NOTHING;

-- ── 2. Reasignar el hilo existente de "ciberseguridad" a la nueva categoría ─
UPDATE forum_threads
SET category_id = (
  SELECT id FROM forum_categories
  WHERE slug = 'gobernanza-ciberseguridad-marco-juridico'
  LIMIT 1
)
WHERE category_id = (
  SELECT id FROM forum_categories WHERE slug = 'ciberseguridad' LIMIT 1
);

-- ── 3. Desactivar las 12 categorías antiguas ──────────────────────────
UPDATE forum_categories
SET is_active = false,
    thread_count = 0
WHERE slug IN (
  'brecha-digital',
  'derechos-digitales',
  'proteccion-datos',
  'ia-responsable',
  'ciberseguridad',
  'libertad-expresion',
  'desinformacion',
  'servicios-digitales',
  'participacion-juvenil',
  'gobernanza-internet',
  'genero-tecnologia',
  'infraestructura-digital'
);

-- ── 4. Actualizar thread_count de la nueva categoría receptora ────────
UPDATE forum_categories
SET thread_count = (
  SELECT count(*) FROM forum_threads ft
  WHERE ft.category_id = forum_categories.id
)
WHERE slug = 'gobernanza-ciberseguridad-marco-juridico';
