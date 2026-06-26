# 🚀 GUÍA RÁPIDA DE INICIO - Sistema de Videoconsultas

**Fecha:** 11 de Octubre, 2025  
**Sistema:** Oráculo Angelical - Videoconsultas 100% Funcional

---

## ⚡ INICIO RÁPIDO (5 Pasos)

### 📋 PASO 1: Configurar Contraseña de Zoho Mail

1. Ve a: https://accounts.zoho.com/home#security/app-password
2. Click en **"Generate New Password"**
3. Nombre: `Oraculo Angelical`
4. Servicio: `Mail`
5. **COPIAR** la contraseña generada

### 🔐 PASO 2: Actualizar .env.local

Abre `.env.local` y actualiza esta línea:

```env
SMTP_PASSWORD="PEGA_AQUI_LA_CONTRASEÑA_DE_ZOHO"
```

### 👥 PASO 3: Crear Usuarios de Prueba

```bash
node scripts/setup-test-users.js
```

Este comando crea:
- ✅ Admin: admin@ossinnovation.com
- ✅ Consultor: cesarandres.lopu@gmail.com  
- ✅ Usuario: usuario@test.com

**Password para todos:** `Test123456!`

### 📧 PASO 4: Probar Email (Opcional)

```bash
node test-email.js
```

Deberías recibir un email en cesarandres.lopu@gmail.com

### 🚀 PASO 5: Iniciar Servidor

```bash
npm run dev
```

---

## 🎯 PROBAR EL SISTEMA

### 1️⃣ Login como Usuario
```
🔗 http://localhost:3000/login
📧 Email: usuario@test.com
🔑 Password: Test123456!
```

### 2️⃣ Ver Consultores
```
🔗 http://localhost:3000/book-consultation
```

Verás a **César Andrés López** con:
- Especialidad: Guía Espiritual y Tarot
- Tarifa: $60.000 COP/hora
- Rating: 4.8 ⭐
- Disponible: Lun-Vie 9-18h, Sáb 9-14h

### 3️⃣ Reservar Consulta
1. Click en "Reservar Consulta"
2. Selecciona fecha y hora
3. Confirma (modo test del pago)
4. **✅ Recibirás email de confirmación**

### 4️⃣ Ver Mis Consultas
```
🔗 http://localhost:3000/user/consultations
```

### 5️⃣ Probar Videollamada
```
🔗 http://localhost:3000/videocall/[ID-DE-CONSULTA]
```

Abre en 2 navegadores:
- Navegador 1: Como usuario
- Navegador 2: Como consultor (cesarandres.lopu@gmail.com)

---

## 📂 ARCHIVOS CREADOS

```
✅ scripts/setup-test-users.js       # Crear usuarios automáticamente
✅ test-email.js                      # Probar envío de emails
✅ CONFIGURACION_ZOHO_MAIL.md        # Guía completa de Zoho Mail
✅ INICIO_RAPIDO.md                  # Esta guía
✅ .env.local                        # Variables actualizadas
```

---

## 👥 CREDENCIALES CREADAS

### 👑 Administrador
```
Email:    admin@ossinnovation.com
Password: Test123456!
Panel:    http://localhost:3000/admin/consultations
```

### 👨‍🏫 Consultor
```
Email:    cesarandres.lopu@gmail.com
Password: Test123456!
Panel:    http://localhost:3000/consultant
```

### 👤 Usuario
```
Email:    usuario@test.com
Password: Test123456!
Panel:    http://localhost:3000/user/consultations
```

---

## 📧 EMAILS DEL SISTEMA

Todos los emails se envían desde: **admin@ossinnovation.com**

### Se envían automáticamente:
1. ✉️ **Confirmación** - Al reservar consulta (usuario + consultor)
2. ⏰ **Recordatorio 24h** - 1 día antes
3. ⏰ **Recordatorio 1h** - 1 hora antes  
4. ⏰ **Recordatorio 15min** - 15 minutos antes
5. ❌ **Cancelación** - Al cancelar consulta

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### ✅ Checklist Rápido:

```bash
✅ Contraseña de Zoho configurada en .env.local
✅ Script de usuarios ejecutado: node scripts/setup-test-users.js
✅ Email de prueba exitoso: node test-email.js
✅ Servidor iniciado: npm run dev
✅ Login funciona: http://localhost:3000/login
✅ Consultores visibles: http://localhost:3000/book-consultation
✅ Consulta creada (debe llegar email)
✅ Panel de usuario funciona: http://localhost:3000/user/consultations
✅ Panel de consultor funciona: http://localhost:3000/consultant
✅ Videollamada funciona: http://localhost:3000/videocall/[id]
```

---

## ⚠️ SI ALGO NO FUNCIONA

### ❌ Error al crear usuarios
```bash
# Verifica que Prisma esté actualizado
npx prisma generate
node scripts/setup-test-users.js
```

### ❌ Email no funciona
```bash
# Prueba el test de email
node test-email.js

# Si falla, regenera la contraseña en Zoho:
# https://accounts.zoho.com/home#security/app-password
```

### ❌ No aparecen consultores
```bash
# Verifica que el usuario consultor existe
npx prisma studio
# Busca: cesarandres.lopu@gmail.com
# Debe tener role: CONSULTANT
```

### ❌ Videollamada no funciona
- Permite permisos de cámara/micrófono
- Usa Chrome o Firefox
- Verifica que ambos usuarios estén conectados

---

## 📖 DOCUMENTACIÓN COMPLETA

Para más detalles, consulta:

1. **CONFIGURACION_ZOHO_MAIL.md** - Configuración detallada de emails
2. **GUIA_PRUEBAS_VIDEOCONSULTAS.md** - Guía completa de pruebas
3. **RESUMEN_VIDEOCONSULTAS_COMPLETO.md** - Resumen del sistema

---

## 🎉 ¡LISTO PARA USAR!

Después de estos 5 pasos, tendrás:

✅ Sistema de videoconsultas 100% funcional  
✅ 3 usuarios de prueba configurados  
✅ Emails funcionando con Zoho Mail  
✅ Consultor con disponibilidad configurada  
✅ Servidor corriendo en http://localhost:3000  

**¡A probar el sistema! 🚀**

---

## 📞 SOPORTE

Si necesitas ayuda:
1. Revisa los logs del servidor
2. Ejecuta `node test-email.js` para verificar emails
3. Revisa la documentación completa en los archivos .md
4. Verifica las variables en `.env.local`

---

**Desarrollado por:** GitHub Copilot  
**Correos configurados:**
- admin@ossinnovation.com (Admin/Sistema)
- cesarandres.lopu@gmail.com (Consultor)
