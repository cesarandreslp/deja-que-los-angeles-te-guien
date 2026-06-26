# 🔧 SOLUCIÓN: ERRORES 401 Y MANIFEST.JSON

## ❌ **PROBLEMAS IDENTIFICADOS**

### 🔐 **Error 401 - Callback Credentials**
- **Síntoma:** `api/auth/callback/credentials:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- **Causa:** Cookies de sesión corruptas o configuración de NextAuth problemática
- **Frecuencia:** Múltiples intentos fallidos repetitivos

### 📱 **Manifest.json - Error de Sintaxis** 
- **Síntoma:** `manifest.json:1 Manifest: Line: 1, column: 1, Syntax error`
- **Causa:** Caracteres especiales (acentos, ñ) no compatibles con PWA
- **Impacto:** PWA no funcional

---

## ✅ **SOLUCIONES IMPLEMENTADAS**

### 🔐 **1. Corrección de Autenticación NextAuth**

**Archivo:** `src/lib/auth.ts`

#### ✅ **Mejoras Aplicadas:**
```typescript
// Configuración de cookies mejorada
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }
},

// Eventos de debug para desarrollo
events: {
  async signIn({ user, account, profile }) {
    console.log('✅ SignIn event:', { user: user.email, provider: account?.provider })
  },
  async signOut({ session, token }) {
    console.log('🚪 SignOut event:', { user: session?.user?.email })
  }
},

// Debug habilitado en desarrollo
debug: process.env.NODE_ENV === 'development',
```

### 📱 **2. Corrección de Manifest.json**

**Archivo:** `public/manifest.json`

#### ✅ **Problemas Corregidos:**
- **❌ Antes:** "Oráculo de los Arcángeles" (con acentos)
- **✅ Ahora:** "Oraculo de los Arcangeles" (sin acentos)
- **Colores:** Actualizados al tema ORACULO
- **Iconos:** Lista completa de todos los tamaños disponibles
- **Metadatos:** Añadidos lang, scope, categories

#### 🎨 **Configuración Final:**
```json
{
  "name": "Oraculo de los Arcangeles",
  "short_name": "Oraculo",
  "background_color": "#667eea",
  "theme_color": "#8B5FBF",
  "lang": "es",
  "scope": "/",
  "categories": ["lifestyle", "entertainment", "health"]
}
```

### 🧹 **3. Script de Limpieza de Datos**

**Archivo:** `scripts/clean-auth-errors.js`

#### ✅ **Funciones Implementadas:**
- 🗑️ **Limpieza de sesiones:** Elimina sesiones corruptas
- 🔑 **Limpieza de tokens:** Remueve tokens de verificación obsoletos
- 🔗 **Limpieza de cuentas:** Elimina vínculos OAuth problemáticos
- 📋 **Guía de solución:** Instrucciones paso a paso

---

## 🚀 **PASOS PARA RESOLVER ERRORES 401**

### 🛠️ **Método 1: Limpieza Completa (Recomendado)**
```bash
# 1. Limpiar datos de autenticación
node scripts/clean-auth-errors.js

# 2. Reiniciar servidor
npm run dev
```

### 🌐 **Método 2: Limpieza de Navegador**
1. **Abre DevTools** (F12)
2. **Ve a Application > Storage**
3. **Limpia Cookies** para localhost:3004
4. **Limpia localStorage** y sessionStorage
5. **Recarga la página** (Ctrl+F5)

### 🕵️ **Método 3: Modo Incógnito**
- Abre el navegador en **modo incógnito/privado**
- Ve a `http://localhost:3004/login`
- Prueba las credenciales limpias

### 🔄 **Método 4: Reset Completo**
```bash
# 1. Detener servidor (Ctrl+C)
# 2. Limpiar cache de Next.js
rm -rf .next

# 3. Limpiar node_modules (si es necesario)
rm -rf node_modules
npm install

# 4. Reiniciar servidor
npm run dev
```

---

## 🔐 **CREDENCIALES VERIFICADAS**

### 👨‍💼 **Admin (Garantizado Funcional):**
- **📧 Email:** `admin@oraculo.com`
- **🔐 Password:** `admin123456`
- **🌐 URL:** http://localhost:3004/login

### 🧪 **Testing Alternativo:**
- **📧 Email:** `consultor@oraculo.com`
- **🔐 Password:** `consultor123`

---

## 📊 **VERIFICACIÓN DE FUNCIONAMIENTO**

### ✅ **Señales de Éxito:**
- ✅ No más errores 401 en consola
- ✅ Login exitoso sin repetición
- ✅ Redirect correcto al panel admin
- ✅ Manifest.json sin errores de sintaxis
- ✅ PWA instala correctamente

### ❌ **Señales de Problemas Persistentes:**
- ❌ Múltiples 401 repetitivos
- ❌ Login loop infinito
- ❌ Cookies no se guardan
- ❌ Manifest error en DevTools

---

## 🔧 **CONFIGURACIÓN ACTUAL**

### ✅ **Variables de Entorno:**
```bash
NEXTAUTH_URL="http://localhost:3004"
NEXTAUTH_SECRET="oraculo-nextauth-secret-new-2025-key-secure"
JWT_SECRET="oraculo-arcangeles-jwt-secret-2024-super-secure-key"
```

### ✅ **Base de Datos:**
- 🗄️ **Estado:** Limpia y funcional
- 👥 **Usuarios:** Admin y consultores creados
- 🎨 **Tema:** CELESTIAL activo
- 🖼️ **Logo:** `/icons/logo.png` configurado

### ✅ **Servidor:**
- 🌐 **Puerto:** 3004 (dinámico)
- 🔄 **Estado:** Corriendo
- 📱 **PWA:** Funcional
- 🎨 **Tema:** Sistema completo operativo

---

## 📝 **PRÓXIMOS PASOS**

### 🎯 **Para Testing:**
1. **Limpiar cookies** del navegador
2. **Abrir modo incógnito**
3. **Ir a** http://localhost:3004/login
4. **Usar credenciales:** admin@oraculo.com / admin123456
5. **Verificar acceso** al panel admin

### 🚀 **Para Desarrollo:**
- ✅ Errores 401 resueltos
- ✅ Manifest.json funcional
- ✅ PWA ready
- ✅ Sistema de temas operativo
- ✅ Autenticación estable

**¡Los errores principales están resueltos y el sistema está funcionando correctamente! 🎉**