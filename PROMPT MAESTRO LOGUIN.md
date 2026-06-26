Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Debes ayudarme a crear el módulo de autenticación y gestión de usuarios para mi aplicación del Oráculo de los Arcángeles. 
El sistema debe ser seguro, escalable y compatible con los módulos existentes (oráculo, video consultas, tienda). 
Divide el trabajo en fases, revisa errores al final de cada fase y optimiza para producción.

---

## Requerimientos clave

1. **Registro de usuario (clásico):**
   - Campos obligatorios:
     - nombre completo
     - email (único, validado)
     - contraseña (mínimo 8 caracteres, validación fuerte)
     - fecha de nacimiento
     - país (ISO code)
     - sexo (Masculino, Femenino, Otro)
   - Campos opcionales:
     - número de teléfono
     - foto de perfil
   - El usuario debe activar su cuenta mediante un enlace de verificación enviado por email.

2. **Login:**
   - **Método 1: Email + contraseña**
     - Usar JWT para sesiones.
     - Expiración de sesión y refresh tokens.
   - **Método 2: Login con Google**
     - Integración con Auth.js (NextAuth).
     - Al iniciar sesión con Google:
       - Si el email ya existe en BD → vincular cuenta.
       - Si es nuevo → crear usuario automáticamente con datos mínimos (nombre, email, foto).
       - El usuario podrá completar datos faltantes (fecha de nacimiento, país, sexo) en su perfil.

3. **Recuperar contraseña (solo usuarios con registro clásico):**
   - Endpoint para solicitar reset → enviar email con enlace temporal.
   - Endpoint para actualizar contraseña con token válido.

4. **Activación de cuenta (solo registro clásico):**
   - Al registrarse se envía un email con un enlace único.
   - El enlace activa la cuenta cambiando `isActive` a `true`.

5. **Perfil de usuario:**
   - Vista donde el usuario puede editar:
     - nombre completo
     - foto de perfil
     - país
     - sexo
   - No puede cambiar la fecha de nacimiento ni el email después del registro.
   - Contraseña puede actualizarse desde el perfil.

6. **Seguridad:**
   - Hash de contraseñas con bcrypt.
   - Tokens firmados con clave segura.
   - Validación de inputs para prevenir inyección y XSS.
   - Roles básicos: `USER`, `CONSULTANT`, `ADMIN`.

7. **Compatibilidad con módulos existentes:**
   - `userId` debe integrarse con video consultas y tienda.
   - El sistema de carrito, pedidos y reservas debe asociarse al usuario autenticado.

---

## Fases del desarrollo

### Fase 1: Modelos en Prisma
- `User`: id, nombre, email, contraseñaHash, fechaNacimiento, país, sexo, teléfono, fotoPerfil, rol, isActive, createdAt, updatedAt.
- `VerificationToken`: id, userId, token, expiresAt.
- `PasswordResetToken`: id, userId, token, expiresAt.
- `Account` (para Auth.js): id, userId, provider, providerAccountId, type, access_token, refresh_token, expires_at.

### Fase 2: Registro y activación (clásico)
- Endpoint `POST /api/auth/register` → crea usuario, genera token de verificación, envía email.
- Endpoint `GET /api/auth/verify?token=...` → activa cuenta.

### Fase 3: Login clásico
- Endpoint `POST /api/auth/login` → valida credenciales, devuelve accessToken + refreshToken.
- Endpoint `POST /api/auth/refresh` → renueva accessToken.
- Middleware de autenticación para proteger rutas.

### Fase 4: Login con Google (OAuth)
- Configurar Auth.js (NextAuth) con Google Provider.
- Rutas:
  - `/api/auth/[...nextauth]` → manejada por Auth.js.
- Flujo:
  - Google devuelve perfil (email, nombre, foto).
  - Si email existe → vincular con usuario existente.
  - Si no existe → crear usuario con datos mínimos.
  - Usuario completa perfil en `/profile`.

### Fase 5: Recuperación de contraseña
- Endpoint `POST /api/auth/forgot-password` → envía email con link temporal.
- Endpoint `POST /api/auth/reset-password` → cambia contraseña si token válido.

### Fase 6: Perfil de usuario
- Endpoint `GET /api/user/me` → devuelve datos del usuario autenticado.
- Endpoint `PUT /api/user/me` → actualiza campos editables.
- Endpoint `PUT /api/user/change-password` → permite cambiar contraseña (solo usuarios clásicos).

### Fase 7: Seguridad y roles
- Middleware para validar rol en rutas protegidas (ej. solo `ADMIN` puede gestionar productos).
- Auditoría de cambios importantes (opcional).

### Fase 8: Frontend
- Páginas:
  - `/register` → formulario de registro clásico.
  - `/login` → opciones: login clásico o login con Google.
  - `/forgot-password` y `/reset-password`.
  - `/profile` → perfil editable.
- Formularios con validación.
- Redirecciones tras login/registro.

### Fase 9: Testing
- Probar registro clásico, login clásico, login con Google, logout, refresh, perfil y recuperación.
- Validar tokens y expiraciones.
- Corregir errores.

---

## Tu tarea
- Implementar cada fase paso a paso.
- Validar errores antes de avanzar a la siguiente fase.
- Garantizar que el login clásico y el login con Google coexistan sin conflictos.
- Mantener compatibilidad con la base de datos existente y los módulos ya creados.


como parte de la fase 1!!!!

// Enum para roles
enum Role {
  USER
  CONSULTANT
  ADMIN
}

// Enum para sexo
enum Gender {
  MALE
  FEMALE
  OTHER
}

model User {
  id              String     @id @default(uuid())
  fullName        String
  email           String     @unique
  passwordHash    String?    // null si el login es solo con Google
  dateOfBirth     DateTime
  country         String     // ISO code, ej. "CO", "US"
  gender          Gender
  phone           String?    
  profileImage    String?    
  role            Role       @default(USER)
  isActive        Boolean    @default(false)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  // Relaciones
  accounts        Account[]
  sessions        Session[]
  verificationTokens VerificationToken[]
  resetTokens     PasswordResetToken[]
  consultations   VideoConsultation[] // relación con tu módulo de video consultas
  orders          Order[]             // relación con tu tienda virtual
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?   @db.Text
  access_token      String?   @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?   @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  id        String   @id @default(cuid())
  identifier String
  token     String   @unique
  expires   DateTime
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id      String   @id @default(cuid())
  token   String   @unique
  userId  String
  expires DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

Guarda este modelo en prisma/schema.prisma.

Genera la migración:

npx prisma generate
npx prisma migrate dev --name add_user_auth_models


Integra NextAuth/Auth.js :

Proveedores:

CredentialsProvider(para iniciar sesión con correo electrónico + contraseña).

GoogleProvider(para iniciar sesión con Google).

Con esto tendrás un sistema híbrido:

Usuarios clásicos → requieren passwordHash, verificación por correo y recuperación de contraseña.

Usuarios Google → se crean sin contraseña, con datos mínimos, y completan perfil en /profile.