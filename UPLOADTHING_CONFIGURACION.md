# 🔧 CONFIGURACIÓN DE UPLOADTHING

**Archivo de Configuración Pendiente**  
**Estado:** ⚠️ Requiere configuración de API keys

---

## 📝 QUÉ ES UPLOADTHING

UploadThing es un servicio de upload de archivos para aplicaciones Next.js que proporciona:
- ✅ Upload rápido y seguro
- ✅ Storage en la nube
- ✅ CDN automático
- ✅ Límites de tamaño configurables
- ✅ Validación de tipos de archivo

---

## 🚀 PASOS PARA CONFIGURAR

### **1. Crear Cuenta en UploadThing**

1. Ve a: https://uploadthing.com/
2. Click en "Sign Up"
3. Usa tu cuenta de GitHub o Google
4. Crea un nuevo proyecto

### **2. Obtener API Keys**

1. En el dashboard de UploadThing:
2. Ve a "API Keys"
3. Copia las siguientes keys:
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`

### **3. Configurar Variables de Entorno**

**Archivo:** `.env.local`

```env
# UploadThing Configuration
UPLOADTHING_SECRET=your_uploadthing_secret_here
UPLOADTHING_APP_ID=xxxxxxxxxxxxx
```

### **4. Reiniciar el Servidor**

```bash
# Detener el servidor actual (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

---

## 📁 ARCHIVOS YA CONFIGURADOS

Los siguientes archivos ya están creados y listos:

✅ `src/app/api/uploadthing/core.ts` - Configuración de endpoints  
✅ `src/app/api/uploadthing/route.ts` - API routes  
✅ `src/lib/uploadthing.ts` - React hooks  
✅ `src/components/blog/ImageUpload.tsx` - Componente de UI

---

## 🎯 ENDPOINTS CONFIGURADOS

### **1. blogImageUploader**
- **Uso:** Imágenes dentro del contenido del blog
- **Límite:** 4MB
- **Formato:** JPG, PNG, GIF
- **Acceso:** Solo ADMIN y CONSULTANT

### **2. coverImageUploader**
- **Uso:** Imágenes de portada de posts
- **Límite:** 8MB
- **Formato:** JPG, PNG, GIF
- **Acceso:** Solo ADMIN y CONSULTANT

---

## 🔒 SEGURIDAD

El sistema ya incluye:
- ✅ Verificación de autenticación
- ✅ Verificación de roles (ADMIN/CONSULTANT)
- ✅ Validación de tamaño de archivo
- ✅ Validación de tipo de archivo
- ✅ Logs de actividad

```typescript
// En: src/app/api/uploadthing/core.ts
.middleware(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user || !['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
    throw new Error("No autorizado");
  }

  return { userId: session.user.id };
})
```

---

## 🧪 CÓMO PROBAR

### **Opción 1: Con UploadThing (Recomendado)**

1. Configurar las API keys (pasos arriba)
2. Ir a `/admin/blog/posts/new`
3. En "Imagen de Portada", hacer drag & drop de una imagen
4. Ver el preview instantáneo
5. Guardar el post

### **Opción 2: Sin UploadThing (Temporal)**

Si no quieres configurar UploadThing ahora, puedes usar URLs:

1. Ir a `/admin/blog/posts/new`
2. Scroll hasta "O ingresa una URL de imagen"
3. Pegar URL de imagen (ej: https://ejemplo.com/imagen.jpg)
4. Guardar el post

**Nota:** La URL manual seguirá funcionando siempre.

---

## 💰 PLANES DE UPLOADTHING

### **Free Tier (Gratis):**
- ✅ 2GB de storage
- ✅ 10GB de bandwidth/mes
- ✅ Suficiente para desarrollo
- ✅ Perfecto para empezar

### **Pro ($20/mes):**
- ✅ 100GB de storage
- ✅ 500GB de bandwidth/mes
- ✅ Para producción

### **Enterprise:**
- ✅ Storage ilimitado
- ✅ Bandwidth ilimitado
- ✅ Soporte prioritario

**Recomendación:** Empezar con Free Tier para desarrollo.

---

## 🔄 ALTERNATIVAS

Si prefieres otra solución, puedes integrar:

### **Cloudinary:**
```bash
npm install cloudinary next-cloudinary
```

### **AWS S3:**
```bash
npm install @aws-sdk/client-s3
```

### **Vercel Blob:**
```bash
npm install @vercel/blob
```

---

## ⚙️ CONFIGURACIÓN OPCIONAL

### **Limitar Tipos de Archivo:**

En `src/app/api/uploadthing/core.ts`:

```typescript
blogImageUploader: f({ 
  image: { 
    maxFileSize: "4MB", 
    maxFileCount: 1,
    accept: ["image/png", "image/jpeg", "image/webp"] // Solo PNG, JPG, WEBP
  } 
})
```

### **Agregar Más Uploaders:**

```typescript
// Para avatares de usuarios
avatarUploader: f({ image: { maxFileSize: "2MB" } })
  .middleware(async () => {
    // Tu lógica de auth
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Tu lógica post-upload
  }),
```

---

## 📊 MONITORING

UploadThing proporciona dashboard con:
- 📈 Uploads por día
- 💾 Storage usado
- 📊 Bandwidth consumido
- 📁 Archivos subidos
- ⚠️ Errores

---

## 🐛 TROUBLESHOOTING

### **Error: "No autorizado"**
- ✅ Verificar que estás logueado
- ✅ Verificar que eres ADMIN o CONSULTANT
- ✅ Verificar la sesión en DevTools

### **Error: "File too large"**
- ✅ Verificar límite de tamaño (4MB-8MB)
- ✅ Comprimir imagen antes de subir
- ✅ Usar formato optimizado (WebP)

### **Error: "Invalid API key"**
- ✅ Verificar `.env.local`
- ✅ Reiniciar el servidor
- ✅ Copiar keys correctamente

### **Upload muy lento:**
- ✅ Comprimir imagen
- ✅ Usar formato optimizado
- ✅ Verificar conexión a internet

---

## 📚 DOCUMENTACIÓN OFICIAL

- UploadThing Docs: https://docs.uploadthing.com/
- Next.js Integration: https://docs.uploadthing.com/getting-started/appdir
- API Reference: https://docs.uploadthing.com/api-reference

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] Crear cuenta en UploadThing
- [ ] Obtener API keys
- [ ] Agregar keys a `.env.local`
- [ ] Reiniciar servidor
- [ ] Probar upload de imagen
- [ ] Verificar preview
- [ ] Guardar post con imagen
- [ ] Verificar en frontend público

---

## 🎉 ESTADO ACTUAL

**Sin Configurar UploadThing:**
- ✅ Código implementado
- ✅ Componentes creados
- ✅ APIs configuradas
- ⚠️ Falta: API keys

**Con UploadThing Configurado:**
- ✅ Upload funcional
- ✅ Storage en cloud
- ✅ CDN automático
- ✅ Sistema completo al 100%

---

## 💡 RECOMENDACIÓN

Para desarrollo y testing, puedes usar URLs manuales.  
Para producción, configura UploadThing (toma solo 5 minutos).

---

**Última actualización:** 12 de Octubre, 2025  
**Estado:** Código listo, configuración pendiente  
**Prioridad:** Media (funciona con URLs mientras tanto)
