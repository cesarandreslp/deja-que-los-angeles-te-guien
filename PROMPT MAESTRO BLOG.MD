Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Ayúdame a desarrollar un **módulo de blog completo** dentro de la aplicación del Oráculo de los Arcángeles.  
Este módulo debe incluir todas las funciones administrativas, editoriales y de visualización que tiene un blog moderno.  
Divide el proyecto en fases, valida errores al final de cada fase y optimiza el código para producción.

---

## Fase 1: Modelos Prisma

Crear los siguientes modelos en `schema.prisma`:

### `BlogCategory`
- `id`: uuid
- `name`: string
- `slug`: string (único)
- `description`: string?
- `createdAt`, `updatedAt`

### `BlogPost`
- `id`: uuid
- `title`: string
- `slug`: string (único)
- `content`: string (cuerpo del artículo en formato HTML o Markdown)
- `excerpt`: string (breve resumen)
- `coverImage`: string? (URL o path)
- `authorId`: relación con `User`
- `categoryId`: relación con `BlogCategory`
- `status`: enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `tags`: string[] (array)
- `publishedAt`: DateTime?
- `views`: int @default(0)
- `likes`: int @default(0)
- `createdAt`, `updatedAt`

### `BlogComment`
- `id`: uuid
- `postId`: relación con `BlogPost`
- `userId`: relación con `User`
- `content`: string
- `isApproved`: boolean @default(false)
- `createdAt`, `updatedAt`

Agregar índices para `slug`, `categoryId`, `status` y relaciones necesarias.

---

## Fase 2: Panel de administración (sección "Blog")

### En el panel de administración agregar una pestaña **“Blog”** con subpestañas:
1. **Entradas**
2. **Categorías**
3. **Comentarios**
4. **Configuración del blog**

### Funcionalidades de administración:
- **Entradas:**
  - Listar todas las publicaciones.
  - Crear, editar y eliminar posts.
  - Cambiar estado (Borrador, Publicado, Archivado).
  - Subir imagen de portada (guardar en `/public/uploads` o en un bucket S3).
  - Editor WYSIWYG (por ejemplo, **TipTap**, **Quill** o **Markdown**).
  - Seleccionar categoría, etiquetas y programar publicación.

- **Categorías:**
  - CRUD completo (crear, editar, eliminar).
  - Slug generado automáticamente a partir del nombre.

- **Comentarios:**
  - Moderar comentarios (aprobar/rechazar).
  - Eliminar comentarios ofensivos.

- **Configuración del blog:**
  - Cambiar título general del blog.
  - Definir cantidad de posts por página.
  - Activar o desactivar los comentarios globalmente.

---

## Fase 3: Frontend (vista pública del blog)

- Crear página `/blog` que muestre:
  - Lista de artículos paginados.
  - Búsqueda por palabra clave.
  - Filtro por categoría y etiquetas.
  - Botón “Leer más”.

- Crear página `/blog/[slug]`:
  - Mostrar artículo completo (título, fecha, autor, categoría, contenido, imagen).
  - Mostrar artículos relacionados al final.
  - Sección de comentarios (si está activada).
  - Botón “Me gusta” con contador.
  - Aumentar contador de visitas cada vez que se visualiza el post.

- Crear página `/blog/categoria/[slug]`:
  - Mostrar solo los artículos de esa categoría.

---

## Fase 4: API endpoints

Crear endpoints protegidos y públicos:

- **Públicos**
  - `GET /api/blog/posts` → lista de posts con filtros (paginación, búsqueda, categoría).
  - `GET /api/blog/posts/[slug]` → obtener un post individual.
  - `GET /api/blog/categories` → lista de categorías activas.
  - `POST /api/blog/comments` → agregar comentario (solo usuarios logueados).

- **Administrativos**
  - `POST /api/admin/blog/post` → crear o actualizar post.
  - `DELETE /api/admin/blog/post/:id` → eliminar post.
  - `POST /api/admin/blog/category` → crear categoría.
  - `POST /api/admin/blog/settings` → actualizar configuración.
  - `POST /api/admin/blog/comments/moderate` → aprobar/rechazar comentario.

Validar permisos (solo admin o editor).

---

## Fase 5: Autores y permisos

- Cada publicación debe asociarse a un autor (`User`).
- Roles:
  - **Admin:** todo acceso (CRUD total).
  - **Editor:** crear/editar posts, moderar comentarios.
  - **Usuario:** solo comentar y leer.
- Mostrar perfil del autor en los artículos (nombre, bio, avatar).

---

## Fase 6: SEO y usabilidad

- Añadir metadatos (`<meta title>`, `<meta description>`, `<meta og:image>`) por post.
- URL amigables con slugs únicos.
- Sitemap dinámico (`/sitemap.xml` con los slugs de los posts publicados).
- Contador de visitas y “likes” almacenados en base de datos.
- Opción de compartir en redes sociales (Facebook, Twitter/X, WhatsApp).

---

## Fase 7: Funcionalidades extra (opcional pero recomendadas)

- **Destacar publicaciones:** marcar artículos como “featured” para mostrarlos en el home.
- **Suscripción al blog:** permitir que los usuarios se registren para recibir notificaciones de nuevos posts.
- **RSS Feed:** generar un feed XML automático (`/rss.xml`).
- **Borradores colaborativos:** permitir guardar posts sin publicar para revisión.
- **Historial de cambios:** almacenar versiones previas del contenido.

---

## Fase 8: Validación y pruebas

- Verificar flujos completos:
  - CRUD de posts, categorías y comentarios.
  - Publicación y visualización correcta.
  - Protección de rutas admin.
  - SEO correcto (meta tags dinámicos).
- Optimizar consultas Prisma y caché para rendimiento.
- Implementar lazy loading para imágenes y paginación infinita si aplica.

---

## Flujo del administrador
1. Inicia sesión → panel → pestaña “Blog”.
2. Crea categorías.
3. Crea posts, sube portada, escribe contenido y publica.
4. Modera comentarios.
5. Configura título general y paginación.
6. Todo se refleja automáticamente en la vista pública del blog.

---

## Flujo del usuario
1. Entra a `/blog` y ve la lista de artículos.
2. Puede buscar, filtrar o abrir un post.
3. Si está logueado, puede comentar o dar “me gusta”.
4. Ve artículos relacionados y destacados.
