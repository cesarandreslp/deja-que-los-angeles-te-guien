# 🔮 Oráculo de los Arcángeles - Sistema de Autenticación

Sistema completo de autenticación construido con Next.js 14, TypeScript, Prisma, PostgreSQL (Neon) y NextAuth.js.

## ✨ Características Implementadas

### 🔐 Sistema de Autenticación Completo

#### **Registro Clásico (Implementado)**
- ✅ Validación completa de datos de entrada
- ✅ Hash seguro de contraseñas con bcrypt (12 rounds)
- ✅ Verificación de email única
- ✅ Campos obligatorios: nombre, email, contraseña, fecha de nacimiento, país, sexo
- ✅ Campos opcionales: teléfono, foto de perfil
- ✅ Activación de cuenta por email con tokens únicos
- ✅ Validación de contraseña fuerte (minúscula, mayúscula, número, símbolo)

#### **Login Clásico (Implementado)**
- ✅ Autenticación con email + contraseña
- ✅ JWT para access tokens (15 minutos)
- ✅ Refresh tokens en cookies httpOnly (7 días)
- ✅ Verificación de cuenta activa
- ✅ Endpoint de refresh automático

#### **Login con Google (Implementado pero DESHABILITADO)**
- ✅ Configuración completa con NextAuth.js
- ✅ Integración con Google Provider (comentado)
- ✅ Lógica de vinculación/creación automática de usuarios
- ✅ **NOTA:** Deshabilitado según instrucciones, listo para activar

#### **Recuperación de Contraseña (Implementado)**
- ✅ Solicitud de reset por email
- ✅ Tokens temporales con expiración (1 hora)
- ✅ Validación de contraseña nueva
- ✅ Solo disponible para usuarios con registro clásico

#### **Gestión de Perfil (Implementado)**
- ✅ Ver información del usuario autenticado
- ✅ Editar: nombre, país, sexo, teléfono, foto
- ✅ Campos NO editables: email, fecha de nacimiento
- ✅ Cambio de contraseña (solo usuarios clásicos)

### 🛡️ Seguridad Implementada

- ✅ **Hash de contraseñas**: bcrypt con 12 rounds
- ✅ **JWT firmados**: access tokens con expiración corta
- ✅ **Refresh tokens**: httpOnly cookies para renovación
- ✅ **Validación de entrada**: Zod schemas en frontend y backend
- ✅ **Middleware de autenticación**: protección de rutas por rol
- ✅ **Tokens únicos**: verificación y reset con expiración
- ✅ **Prevención XSS/Injection**: validación y sanitización

### 🎭 Roles de Usuario

- ✅ **USER**: Usuario básico (por defecto)
- ✅ **CONSULTANT**: Consultor
- ✅ **ADMIN**: Administrador
- ✅ Middleware para proteger rutas por rol

## 🗄️ Base de Datos (Prisma + PostgreSQL)

### Modelos Implementados

```prisma
// Enums
enum Role { USER, CONSULTANT, ADMIN }
enum Gender { MALE, FEMALE, OTHER }

// Usuario principal
model User {
  id              String     @id @default(uuid())
  fullName        String
  email           String     @unique
  passwordHash    String?    // null para usuarios de Google
  dateOfBirth     DateTime?  // Opcional inicialmente
  country         String?    // ISO code
  gender          Gender?
  phone           String?    
  profileImage    String?    
  role            Role       @default(USER)
  isActive        Boolean    @default(false)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  // Relaciones NextAuth
  accounts        Account[]
  sessions        Session[]
  verificationTokens VerificationToken[]
  resetTokens     PasswordResetToken[]
}

// Para NextAuth (OAuth)
model Account { ... }
model Session { ... }

// Para verificación y reset
model VerificationToken { ... }
model PasswordResetToken { ... }
```

## 🚀 API Endpoints Implementados

### Autenticación
- `POST /api/auth/register` - Registro clásico
- `GET /api/auth/verify?token=...` - Verificación de email
- `POST /api/auth/login` - Login clásico
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Cambiar contraseña con token
- `GET|POST /api/auth/[...nextauth]` - NextAuth (Google deshabilitado)

### Gestión de Usuario
- `GET /api/user/me` - Obtener perfil del usuario
- `PUT /api/user/me` - Actualizar perfil
- `PUT /api/user/change-password` - Cambiar contraseña

## 💻 Frontend Implementado

### Páginas
- ✅ `/` - Página principal con navegación
- ✅ `/register` - Formulario de registro completo
- ✅ `/login` - Login con validación (Google comentado)
- ✅ `/profile` - Perfil editable + cambio de contraseña
- ✅ `/forgot-password` - Solicitar recuperación
- ✅ `/reset-password` - Nueva contraseña con token

### Componentes UI
- ✅ `Button` - Botón con estados de carga y variantes
- ✅ `Input` - Input con validación y errores
- ✅ `Select` - Select con opciones predefinidas

### Validación Frontend
- ✅ Validación en tiempo real con Zod
- ✅ Mensajes de error específicos
- ✅ Estados de carga y éxito/error
- ✅ Manejo de tokens expirados

## 📧 Sistema de Emails

- ✅ **Verificación de cuenta**: Email con enlace único (24h)
- ✅ **Recuperación de contraseña**: Email con token temporal (1h)
- ✅ **Templates HTML**: Diseño profesional y responsive
- ✅ **Configuración SMTP**: Listo para Gmail/otros proveedores

## 🔧 Configuración de Desarrollo

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (.env.local)
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Email (SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@oraculo.com"

# Google OAuth (DESHABILITADO)
# GOOGLE_CLIENT_ID="your-google-client-id"  
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Configurar base de datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name add_user_auth_models

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

## 🔄 Flujos de Usuario Implementados

### Registro y Verificación
1. Usuario completa formulario de registro
2. Sistema valida datos y crea usuario inactivo
3. Se envía email de verificación con token único
4. Usuario hace clic en enlace del email
5. Cuenta se activa automáticamente
6. Redirección a login con mensaje de éxito

### Login Clásico
1. Usuario ingresa email y contraseña
2. Sistema valida credenciales y estado activo
3. Genera access token (15 min) y refresh token (7 días)
4. Refresh token se guarda en cookie httpOnly
5. Redirección a perfil del usuario

### Recuperación de Contraseña
1. Usuario solicita reset desde login
2. Sistema envía email con token temporal (1h)
3. Usuario accede al enlace y establece nueva contraseña
4. Token se invalida automáticamente
5. Redirección a login con confirmación

### Gestión de Sesión
1. Access tokens expiran en 15 minutos
2. Frontend detecta expiración automáticamente
3. Uso de refresh token para renovar sesión
4. Si refresh falla, redirección a login
5. Logout limpia todos los tokens

## 🎯 Funcionalidades Listas para Habilitar

### Google OAuth (Comentado)
Para habilitar Google login:

1. Descomentar Google Provider en `/src/lib/auth.ts`
2. Configurar variables de entorno `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
3. Descomentar botón de Google en `/src/app/login/page.tsx`
4. Los usuarios de Google se crearán automáticamente con datos mínimos

## 🧪 Testing y Validación

### Casos de Prueba Implementados
- ✅ Registro con datos válidos/inválidos
- ✅ Verificación de email con tokens válidos/expirados
- ✅ Login con credenciales correctas/incorrectas
- ✅ Cuentas activas/inactivas
- ✅ Renovación de tokens automática
- ✅ Recuperación de contraseña completa
- ✅ Validación de roles y permisos
- ✅ Manejo de errores y casos edge

## 📱 Compatibilidad

- ✅ **Frontend**: Responsive design con Tailwind CSS
- ✅ **Backend**: API Routes de Next.js 14
- ✅ **Base de datos**: PostgreSQL (compatible con Neon)
- ✅ **Autenticación**: NextAuth.js + JWT personalizado
- ✅ **Emails**: Nodemailer con templates HTML

## 🔗 Integración con Módulos Existentes

El sistema está diseñado para integrarse fácilmente:

```typescript
// Ejemplo de uso en otros módulos
const userId = request.user.userId // Desde middleware
const userRole = request.user.role  // Verificación de permisos

// En Prisma schemas futuros
model VideoConsultation {
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

model Order {
  userId String  
  user   User   @relation(fields: [userId], references: [id])
}
```

## 🎉 Estado del Proyecto

**✅ COMPLETADO AL 100%** según las especificaciones del PROMPT MAESTRO LOGUIN.md

- ✅ Todas las 9 fases implementadas
- ✅ Google OAuth implementado pero deshabilitado como se solicitó
- ✅ Sistema seguro y escalable
- ✅ Compatible con módulos existentes
- ✅ Listo para producción

---

*Desarrollado siguiendo las instrucciones del PROMPT MAESTRO LOGUIN.md al pie de la letra.*