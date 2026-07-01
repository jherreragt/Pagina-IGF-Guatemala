# IGF Guatemala — Sitio Web Oficial

Sitio web del Foro Nacional de Gobernanza de Internet de Guatemala. Construido con React + TypeScript + Vite, usando Supabase como base de datos y backend.

---

## Requisitos previos

Antes de instalar, asegúrate de tener lo siguiente:

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| [Node.js](https://nodejs.org) | 18.x o superior | `node -v` |
| [npm](https://www.npmjs.com) | 9.x o superior | `npm -v` |
| Cuenta en [Supabase](https://supabase.com) | — | — |

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd igf-guatemala
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

### Como obtener estos valores

1. Inicia sesion en [supabase.com](https://supabase.com) y abre tu proyecto.
2. Ve a **Project Settings → API**.
3. Copia la **Project URL** y pegala en `VITE_SUPABASE_URL`.
4. Copia la clave **anon / public** y pegala en `VITE_SUPABASE_ANON_KEY`.

> **Importante:** El archivo `.env` nunca debe subirse al repositorio. Ya esta incluido en `.gitignore`.

---

## 4. Configurar la base de datos (Supabase)

Las tablas necesarias se crean ejecutando las migraciones incluidas en la carpeta `supabase/migrations/`.

### Opcion A — Desde el panel de Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor**.
2. Abre y ejecuta, en orden, cada archivo `.sql` de la carpeta `supabase/migrations/`:
   - `20260618144341_create_igf_admin_tables.sql`
   - `20260701214305_create_event_management_tables.sql`

### Opcion B — Con la CLI de Supabase

```bash
# Instalar la CLI (si no la tienes)
npm install -g supabase

# Vincular con tu proyecto (necesitas el ID del proyecto)
supabase link --project-ref <tu-project-ref>

# Aplicar todas las migraciones
supabase db push
```

---

## 5. Crear el usuario administrador

El panel de administracion requiere autenticacion por correo y contrasena.

1. En el panel de Supabase, ve a **Authentication → Users**.
2. Haz clic en **Add user** → **Create new user**.
3. Ingresa el correo y contrasena que usaras para acceder al panel.

El panel de administracion esta disponible en la ruta `/admin` del sitio.

---

## 6. Servidor de desarrollo local

Para ejecutar el sitio en modo desarrollo (con recarga automatica):

```bash
npm run dev
```

El sitio estara disponible en: **http://localhost:5173**

---

## 7. Construir para produccion

Para generar los archivos estaticos optimizados:

```bash
npm run build
```

Los archivos se generaran en la carpeta `dist/`. Esta carpeta es la que se despliega en el servidor.

Para previsualizar la build antes de desplegarla:

```bash
npm run preview
```

---

## 8. Despliegue en servidor

### Opcion A — Servidor con Nginx

1. Construye el proyecto con `npm run build`.
2. Copia el contenido de la carpeta `dist/` a la ruta raiz de tu servidor web (por ejemplo `/var/www/igf-guatemala`).
3. Configura Nginx para servir la aplicacion y redirigir todas las rutas a `index.html` (necesario para el enrutamiento de React):

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

4. Recarga Nginx:

```bash
sudo systemctl reload nginx
```

### Opcion B — Netlify (recomendado)

1. Sube el repositorio a GitHub.
2. En [netlify.com](https://netlify.com), haz clic en **Add new site → Import an existing project**.
3. Conecta tu repositorio de GitHub.
4. Configura el despliegue:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. En **Site settings → Environment variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Crea un archivo `public/_redirects` con este contenido para el enrutamiento correcto:
   ```
   /*    /index.html    200
   ```

### Opcion C — Vercel

1. Instala la CLI de Vercel: `npm install -g vercel`
2. Ejecuta `vercel` en la raiz del proyecto y sigue las instrucciones.
3. Agrega las variables de entorno desde el panel de Vercel o con:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

---

## Estructura del proyecto

```
├── public/                 # Archivos estaticos publicos
├── src/
│   ├── components/         # Componentes reutilizables (Navigation, Footer, etc.)
│   ├── contexts/           # Contextos de React (AuthContext)
│   ├── hooks/              # Hooks personalizados
│   ├── lib/                # Cliente de Supabase y tipos
│   ├── pages/              # Paginas del sitio
│   │   └── admin/          # Panel de administracion
│   └── index.css           # Estilos globales (Tailwind)
├── supabase/
│   └── migrations/         # Scripts SQL para la base de datos
├── .env                    # Variables de entorno (no subir al repo)
├── tailwind.config.js      # Configuracion de Tailwind CSS
└── vite.config.ts          # Configuracion de Vite
```

---

## Comandos disponibles

| Comando | Descripcion |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la build de produccion |
| `npm run preview` | Previsualiza la build localmente |
| `npm run lint` | Ejecuta el linter (ESLint) |
| `npm run typecheck` | Verifica los tipos de TypeScript |

---

## Soporte

Para reportar problemas o solicitar cambios, contacta al equipo tecnico del IGF Guatemala en **info@igfguatemala.org**.
