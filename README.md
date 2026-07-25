# IGF Guatemala — Sitio Web Oficial

Sitio web del Foro Nacional de Gobernanza de Internet de Guatemala (Internet Governance Forum). Construido con **React + TypeScript + Vite**, usando **Supabase** como base de datos, autenticación y backend serverless, y **Tailwind CSS** para los estilos.

El sitio incluye una página pública con información del evento, blog, foro de diálogo y recursos, además de un panel de administración completo desde donde se gestiona todo el contenido sin tocar código.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Variables de entorno y claves](#variables-de-entorno-y-claves)
4. [Configuración de la base de datos](#configuración-de-la-base-de-datos)
5. [Creación del usuario administrador](#creación-del-usuario-administrador)
6. [Función serverless de correo](#función-serverless-de-correo)
7. [Cómo funciona](#cómo-funciona)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Comandos disponibles](#comandos-disponibles)
10. [Despliegue en producción](#despliegue-en-producción)
11. [Solución de problemas](#solución-de-problemas)

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| [Node.js](https://nodejs.org) | 18.x o superior | `node -v` |
| [npm](https://www.npmjs.com) | 9.x o superior | `npm -v` |
| Cuenta en [Supabase](https://supabase.com) | Proyecto activo | — |
| [Cuenta en Resend](https://resend.com) (opcional) | Para correo del formulario de contacto | — |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd igf-guatemala

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env
# (o crea el archivo .env manualmente — ver sección siguiente)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

El sitio estará disponible en **http://localhost:5173**.

---

## Variables de entorno y claves

El proyecto usa variables de entorno con el prefijo `VITE_` (requerido por Vite para exponerlas al navegador). Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

### Cómo obtener estos valores

1. Inicia sesión en [supabase.com](https://supabase.com) y abre tu proyecto.
2. Ve a **Project Settings → API**.
3. Copia la **Project URL** y pégala en `VITE_SUPABASE_URL`.
4. Copia la clave **anon / public** y pégala en `VITE_SUPABASE_ANON_KEY`.

> **Seguridad:** El archivo `.env` nunca debe subirse al repositorio. Ya está incluido en `.gitignore`. La clave `anon` es segura para el navegador porque está protegida por las políticas de Row Level Security (RLS) de Supabase.

### Claves del servidor (no van en `.env` del frontend)

Las siguientes claves se configuran como **secretos de las Edge Functions** en el panel de Supabase, no en el archivo `.env` del proyecto:

| Secreto | Descripción | Dónde configurarlo |
|---|---|---|
| `RESEND_API_KEY` | Clave de API de Resend para enviar correos | Supabase → Edge Functions → Secrets |

---

## Configuración de la base de datos

La base de datos se configura ejecutando las migraciones incluidas en `supabase/migrations/`. Estas crean todas las tablas, políticas de seguridad y datos iniciales.

### Migraciones incluidas (en orden)

| Archivo | Descripción |
|---|---|
| `20260618144341_create_igf_admin_tables.sql` | Tablas base de administración, blog y configuración del sitio |
| `20260701214305_create_event_management_tables.sql` | Tablas del evento: sesiones, ponentes, aliados, recursos, registros |
| `20260701222822_add_event_editions.sql` | Tabla de ediciones del evento (gestión multi-edición) |
| `20260715234048_add_social_embed_settings.sql` | Configuración de embeds sociales (Facebook, YouTube) |
| `20260715235543_create_forum_tables.sql` | Tablas del foro: categorías, hilos, posts, reacciones, reportes, reglas |
| `20260715235848_add_increment_view_count_rpc.sql` | Función RPC para contador de vistas |
| `20260716000124_add_get_user_id_by_email_rpc.sql` | Función RPC para buscar usuario por correo |
| `20260716001005_create_contact_submissions_table.sql` | Tabla de mensajes del formulario de contacto |
| `20260716003430_create_youtube_videos_table.sql` | Tabla de videos de YouTube mostrados en la home |
| `20260716004854_add_home_content_tables_and_settings.sql.sql` | Tablas de contenido de la home (estadísticas, temas, principios, comunidad) y textos administrables |
| `20260725143151_forum_moderation_upgrade.sql` | Moderación del foro: código de conducta, aceptaciones, estados de moderación, categorías de reporte, cola de primeros aportes |

### Opción A — Desde el panel de Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor**.
2. Abre y ejecuta, en orden, cada archivo `.sql` de la carpeta `supabase/migrations/`.

### Opción B — Con la CLI de Supabase

```bash
npm install -g supabase
supabase link --project-ref <tu-project-ref>
supabase db push
```

### Tablas principales

| Tabla | Propósito |
|---|---|
| `site_settings` | Textos y configuración global del sitio (hero, footer, evento, visibilidad) |
| `home_stats` | Estadísticas del hero (ej. "8+ Ediciones") |
| `home_why_matters` | Tarjetas de "Por qué importa" |
| `home_principles` | Principios mostrados en la home |
| `home_stakeholders` | Tarjetas de comunidad multiactor |
| `blog_posts` | Artículos del blog |
| `event_editions` | Ediciones del evento anual |
| `event_sessions` | Sesiones del programa del evento |
| `event_speakers` | Ponentes y moderadores |
| `event_allies` | Organizaciones aliadas / patrocinadores |
| `event_resources` | Recursos del evento |
| `event_registrations` | Registros de asistencia al evento |
| `youtube_videos` | Videos de YouTube embebidos en la home |
| `forum_categories` | Categorías del foro de diálogo |
| `forum_threads` | Hilos de discusión (con estado de moderación, fijado, destacado, oculto, cerrado) |
| `forum_posts` | Respuestas dentro de los hilos (con estado de moderación y oculto) |
| `forum_reactions` | Reacciones a hilos y respuestas |
| `forum_reports` | Reportes de contenido inapropiado (con categoría de motivo) |
| `forum_rules` | Reglas del foro |
| `forum_admins` | Administradores y moderadores del foro |
| `forum_code_of_conduct` | Secciones del código de conducta (lineamientos de convivencia) |
| `forum_conduct_meta` | Versión actual del código de conducta |
| `forum_conduct_acceptances` | Registro de aceptaciones del código por cada usuario |
| `contact_submissions` | Mensajes recibidos por el formulario de contacto |

Todas las tablas tienen **Row Level Security (RLS)** activada. Las tablas de contenido público permiten lectura a usuarios anónimos y autenticados; las tablas del foro usan `auth.uid()` para verificar propiedad.

---

## Creación del usuario administrador

El panel de administración requiere autenticación por correo y contraseña mediante Supabase Auth.

1. En el panel de Supabase, ve a **Authentication → Users**.
2. Haz clic en **Add user → Create new user**.
3. Ingresa el correo y contraseña que usarás para acceder al panel.
4. Verifica que la opción **Auto Confirm User** esté activada (para no requerir confirmación por correo).
5. Accede al panel en la ruta **/admin** del sitio (ej. `http://localhost:5173/admin`).

> **Nota:** La confirmación por correo está desactivada por defecto. Los usuarios creados desde el panel de Supabase pueden iniciar sesión inmediatamente.

---

## Función serverless de correo

El formulario de contacto envía un correo al equipo del IGF Guatemala mediante una Edge Function de Supabase (`send-contact-email`) que usa el servicio **Resend**.

### Cómo funciona

1. El visitante completa el formulario en la página **/contacto**.
2. Los datos se guardan en la tabla `contact_submissions` de Supabase.
3. Se llama a la Edge Function `send-contact-email`, que envía un correo HTML con los datos del mensaje a `igf.guatemala.isocgt@gmail.com`.
4. Si la clave `RESEND_API_KEY` no está configurada, el mensaje se guarda igualmente en la base de datos pero no se envía por correo.

### Configurar la clave de Resend

1. Crea una cuenta en [resend.com](https://resend.com) y obtén tu API key.
2. En el panel de Supabase, ve a **Edge Functions → Secrets**.
3. Agrega un secreto con nombre `RESEND_API_KEY` y pega tu API key como valor.

---

## Cómo funciona

### Arquitectura general

```
Navegador (React + Vite)
    │
    ├── Páginas públicas → leen contenido de Supabase
    │
    ├── Panel admin (/admin) → requiere login (Supabase Auth)
    │       ├── Gestiona todo el contenido (blog, evento, foro, home)
    │       └── Modifica textos y visibilidad (site_settings)
    │
    └── Supabase
            ├── PostgreSQL (tablas + RLS)
            ├── Auth (correo/contraseña)
            └── Edge Function (send-contact-email → Resend)
```

### Páginas públicas

| Ruta | Contenido |
|---|---|
| `/` | Página de inicio con hero, estadísticas, principios, comunidad, CTA del evento y blog |
| `/sobre` | ¿Qué es el IGF Guatemala? |
| `/principios` | Declaración de principios |
| `/comunidad` | Comunidad multiactor |
| `/ejes` | Ejes temáticos |
| `/evento` | Información del evento anual, programa, ponentes, registro |
| `/recursos` | Biblioteca de recursos y materiales |
| `/transparencia` | Transparencia y código de conducta |
| `/contacto` | Formulario de contacto |
| `/blog` | Listado de artículos |
| `/blog/:slug` | Artículo individual |
| `/foro` | Foro de diálogo |
| `/foro/:slug` | Categoría del foro |
| `/foro/t/:id` | Hilo de discusión |

### Panel de administración

Acceso en `/admin` (requiere iniciar sesión). Todas las rutas están protegidas.

| Ruta | Función |
|---|---|
| `/admin` | Dashboard con estadísticas generales |
| `/admin/home` | Contenido del home: estadísticas, "por qué importa", principios, comunidad |
| `/admin/settings` | Configuración del sitio: textos del hero, evento, footer, visibilidad de secciones, redes sociales |
| `/admin/blog` | Gestión de artículos del blog |
| `/admin/blog/new` | Crear nuevo artículo |
| `/admin/blog/edit/:id` | Editar artículo existente |
| `/admin/event` | Dashboard del evento |
| `/admin/event/editions` | Gestionar ediciones del evento |
| `/admin/event/sessions` | Sesiones del programa |
| `/admin/event/speakers` | Ponentes y moderadores |
| `/admin/event/allies` | Organizaciones aliadas |
| `/admin/event/resources` | Recursos del evento |
| `/admin/event/registrations` | Registros de asistencia |
| `/admin/videos` | Videos de YouTube de la home |
| `/admin/mensajes` | Mensajes del formulario de contacto |
| `/admin/forum` | Dashboard del foro |
| `/admin/forum/categorias` | Categorías del foro |
| `/admin/forum/discusiones` | Hilos de discusión |
| `/admin/forum/reportes` | Reportes de contenido (con categoría de motivo) |
| `/admin/forum/cola` | Cola de moderación: aprobar o rechazar primeros aportes |
| `/admin/forum/reglas` | Reglas del foro |
| `/admin/forum/lineamientos` | Editar el código de conducta y subir versión |
| `/admin/forum/usuarios` | Usuarios y moderadores del foro |

### Sistema de configuración (site_settings)

Todos los textos editables del sitio se almacenan en la tabla `site_settings`. Cada fila tiene:

- **key**: identificador único (ej. `hero_title`)
- **value**: el valor del texto
- **label**: etiqueta legible para el admin (ej. "Título principal")
- **section**: agrupación en el panel (hero, evento, sobre, inicio, footer, visibilidad, contacto)
- **type**: tipo de campo (text, textarea, boolean, url, image)

El hook `useSiteSettings` carga todas las configuraciones al iniciar la app y las mantiene disponibles en cualquier componente. Si una configuración no existe en la base de datos, se usa un valor por defecto.

### Foro de diálogo

El foro es un espacio de discusión pública organizado por categorías temáticas. Cada persona puede crear discusiones (hilos) y responder dentro de ellas, con reacciones ("me gusta") y reportes de contenido inapropiado. El sistema incluye varias capas de moderación para mantener un espacio seguro y constructivo.

#### Registro y participación

1. **Creación de cuenta:** Para participar hay que registrarse con correo y contraseña. Al hacerlo, se debe marcar una casilla aceptando los **Lineamientos de Respeto y Convivencia** (el código de conducta del foro). La aceptación queda registrada con la versión del código vigente en ese momento.
2. **Re-aceptación al actualizar:** Si los administradores cambian el contenido del código de conducta, pueden subir la versión desde el panel. Al hacerlo, todas las personas con cuentas existentes deberán aceptar de nuevo los lineamientos antes de poder seguir publicando.
3. **Control de propiedad:** Cada persona solo puede editar o eliminar sus propias discusiones y respuestas. Las políticas de RLS verifican la identidad mediante `auth.uid()`.

#### Cola de moderación del primer aporte

La primera vez que alguien publica (una discusión o una respuesta), su aporte queda en estado **pendiente** hasta que un moderador lo apruebe o rechace. Esto ayuda a prevenir spam y trolls sin frenar a quienes ya participan:

- El aporte pendiente **no es visible** para otras personas en el foro.
- Quien lo escribió ve un aviso indicando que está en revisión.
- Los moderadores lo revisan desde **`/admin/forum/cola`**, donde pueden aprobarlo (se publica) o rechazarlo (se elimina).
- Los aportes posteriores de la misma persona se publican automáticamente, sin necesidad de aprobación.

#### Moderación directa

Los moderadores pueden actuar sobre cualquier discusión o respuesta desde la propia página pública del foro, sin ir al panel de administración:

- **Fijar** — mantener una discusión arriba del listado.
- **Destacar** — resaltar una discusión como relevante.
- **Cerrar** — bloquear nuevas respuestas en una discusión.
- **Ocultar** — ocultar un aporte del foro público sin eliminarlo.
- **Eliminar** — borrar permanentemente una discusión o respuesta.

#### Reportes con categoría

Cualquier persona registrada puede reportar contenido inapropiado. El formulario de reporte ofrece categorías predefinidas para clasificar el motivo:

| Categoría | Descripción |
|---|---|
| Discriminación | Contenido que discrimina por identidad, etnia, género, etc. |
| Acoso | Intimidación, amenazas o acoso hacia una persona |
| Discurso de odio | Mensajes que incitan al odio o la violencia |
| Spam | Contenido promocional o repetitivo no relacionado |
| Ataques personales | Insultos o descalificaciones hacia otra persona |
| Desinformación | Información falsa o engañosa deliberada |
| Otro | Cualquier otro motivo (requiere descripción) |

Los reportes llegan al panel de administración (**`/admin/forum/reportes`**) donde se muestra la categoría como etiqueta, facilitando identificar patrones. Un moderador puede marcar cada reporte como resuelto o descartado.

#### Panel de administración del foro

Desde **`/admin/forum`** se accede al dashboard del foro, que enlaza a todas las herramientas de gestión:

- **Categorías** — crear y editar las categorías temáticas del foro.
- **Discusiones** — listado completo de hilos, con búsqueda y filtros.
- **Reportes** — cola de reportes con categoría, estado y acciones.
- **Cola de moderación** — aprobar o rechazar los primeros aportes de personas nuevas.
- **Reglas** — editar las reglas operativas del foro.
- **Lineamientos** — editar el código de conducta y subir la versión cuando cambie.
- **Usuarios** — gestionar moderadores y usuarios del foro.

#### Roles

- **Usuario:** puede crear discusiones, responder, reaccionar y reportar. Su primer aporte pasa por la cola de moderación.
- **Moderador / Administrador:** tiene acceso al panel de administración, puede aprobar o rechazar aportes pendientes, y moderar contenido directamente (fijar, destacar, cerrar, ocultar, eliminar). Los moderadores se asignan desde **`/admin/forum/usuarios`**.

### Autenticación

- El contexto `AuthContext` maneja la sesión de Supabase en toda la app.
- El componente `ProtectedRoute` protege todas las rutas de administración.
- Si un usuario no autenticado intenta acceder a `/admin`, es redirigido a `/admin/login`.

---

## Estructura del proyecto

```
├── public/                     # Archivos estáticos (logos, favicon, imágenes)
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── admin/              # Layout del panel de administración
│   │   └── forum/              # Componentes del foro
│   ├── contexts/               # Contextos de React (AuthContext)
│   ├── hooks/                  # Hooks personalizados
│   │   ├── useActiveEdition.ts # Hook para la edición activa del evento
│   │   └── useSiteSettings.ts  # Hook para la configuración del sitio
│   ├── lib/
│   │   ├── supabase.ts         # Cliente de Supabase + tipos TypeScript
│   │   └── forum-helpers.ts    # Utilidades del foro
│   ├── pages/                  # Páginas del sitio
│   │   ├── admin/              # Panel de administración
│   │   ├── Home.tsx            # Página de inicio
│   │   ├── Event.tsx           # Página del evento
│   │   ├── Blog.tsx            # Listado del blog
│   │   └── ...                 # Otras páginas públicas
│   ├── App.tsx                 # Enrutamiento principal
│   ├── main.tsx                # Punto de entrada
│   └── index.css              # Estilos globales (Tailwind + clases custom)
├── supabase/
│   ├── migrations/             # Migraciones SQL de la base de datos
│   └── functions/
│       └── send-contact-email/ # Edge Function para correo de contacto
├── .env                        # Variables de entorno (no subir al repo)
├── .gitignore
├── index.html                  # HTML base con meta tags para SEO y redes sociales
├── package.json
├── tailwind.config.js          # Configuración de Tailwind (colores, fuentes, animaciones)
├── tsconfig.json               # Configuración de TypeScript
├── vite.config.ts              # Configuración de Vite
├── eslint.config.js            # Configuración de ESLint
└── postcss.config.js           # Configuración de PostCSS
```

### Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 18 | Framework de UI |
| TypeScript 5.5 | Tipado estático |
| Vite 5 | Bundler y servidor de desarrollo |
| Tailwind CSS 3.4 | Estilos |
| React Router 7 | Enrutamiento |
| Supabase | Base de datos, autenticación y Edge Functions |
| lucide-react | Iconos |
| Resend | Envío de correos (vía Edge Function) |

### Fuentes y diseño

- **Inter** — texto del cuerpo (300–900)
- **Plus Jakarta Sans** — títulos y encabezados (600–800)
- Cargadas desde Google Fonts en `index.html`
- Sistema de colores basado en azul (`brand`) con tonos neutros (`slate`, `night`)

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga automática |
| `npm run build` | Genera la build de producción en `dist/` |
| `npm run preview` | Previsualiza la build de producción localmente |
| `npm run lint` | Ejecuta el linter (ESLint) |
| `npm run typecheck` | Verifica los tipos de TypeScript sin compilar |

---

## Despliegue en producción

### Preparación

1. Verifica que el archivo `.env` tenga las variables de Supabase correctas.
2. Ejecuta `npm run build` — los archivos se generan en `dist/`.
3. Asegúrate de que las migraciones de la base de datos estén aplicadas.
4. Verifica que el usuario administrador esté creado.
5. Configura la clave `RESEND_API_KEY` en los secretos de las Edge Functions.

### Opción A — Netlify (recomendado)

1. Sube el repositorio a GitHub.
2. En [netlify.com](https://netlify.com), haz clic en **Add new site → Import an existing project**.
3. Conecta tu repositorio de GitHub.
4. Configura el despliegue:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. En **Site settings → Environment variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. El archivo `public/_redirects` ya está incluido con `/* /index.html 200` para el enrutamiento de React.

### Opción B — Vercel

1. Instala la CLI: `npm install -g vercel`
2. Ejecuta `vercel` en la raíz del proyecto y sigue las instrucciones.
3. Agrega las variables de entorno desde el panel o con:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

### Opción C — Servidor con Nginx

1. Construye el proyecto: `npm run build`
2. Copia el contenido de `dist/` a la ruta raíz del servidor (ej. `/var/www/igf-guatemala`).
3. Configura Nginx para redirigir todas las rutas a `index.html`:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/igf-guatemala;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. Recarga Nginx: `sudo systemctl reload nginx`

### Meta tags para redes sociales

El archivo `index.html` incluye etiquetas Open Graph y Twitter Card para que el sitio muestre un preview con el logo del IGF Guatemala al compartirlo en Facebook, WhatsApp, Twitter/X, LinkedIn, etc. La imagen (`9k98Sy4E.jpg`) está en la carpeta `public/`.

---

## Solución de problemas

### El panel de administración redirige al login aunque inicié sesión

Verifica que el usuario esté confirmado en Supabase (**Authentication → Users**). La opción **Auto Confirm User** debe estar activada al crear el usuario.

### El formulario de contacto no envía correos

Los mensajes siempre se guardan en la base de datos (`contact_submissions`). El correo solo se envía si la clave `RESEND_API_KEY` está configurada en los secretos de las Edge Functions de Supabase. Verifícalo en **Supabase → Edge Functions → Secrets**.

### Una sección del sitio no se muestra

Las secciones de la home se pueden ocultar desde el panel de administración en **Configuración → Visibilidad de Secciones**. Verifica que los interruptores correspondientes estén activados.

### El contenido aparece vacío o con textos por defecto

El hook `useSiteSettings` usa valores por defecto si no encuentra configuraciones en la base de datos. Si ejecutaste las migraciones correctamente, los datos iniciales ya están sembrados. Si faltan, verifica que la migración `add_home_content_tables_and_settings` se haya aplicado.

### Error de CORS al llamar a la Edge Function

La Edge Function `send-contact-email` incluye los encabezados CORS necesarios. Si aparece un error de CORS, verifica que la función esté desplegada y activa en **Supabase → Edge Functions**.

---

## Soporte

Para reportar problemas o solicitar cambios, contacta al equipo técnico del IGF Guatemala en **igf.guatemala.isocgt@gmail.com**.
