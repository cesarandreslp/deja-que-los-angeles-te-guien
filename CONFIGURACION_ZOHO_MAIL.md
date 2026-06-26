# 📧 CONFIGURACIÓN DE ZOHO MAIL PARA VIDEOCONSULTAS

## 🎯 Información de Configuración

### Correos Configurados:
- **Admin:** admin@ossinnovation.com
- **Consultor:** cesarandres.lopu@gmail.com

---

## 🔧 PASO 1: Configurar Contraseña de Aplicación en Zoho

### 1. Acceder a la configuración de Zoho Mail:
```
https://accounts.zoho.com/home
```

### 2. Ir a "Security" → "App Passwords"
```
https://accounts.zoho.com/home#security/app-password
```

### 3. Generar nueva contraseña de aplicación:
- Click en "Generate New Password"
- Nombre: `Oraculo Angelical - Videoconsultas`
- Seleccionar "Mail" como servicio
- Click en "Generate"
- **COPIAR LA CONTRASEÑA GENERADA** (no la podrás ver de nuevo)

---

## 🔐 PASO 2: Actualizar Variables de Entorno

Abre el archivo `.env.local` y actualiza la contraseña:

```env
# Email configuration - Zoho Mail
SMTP_HOST="smtp.zoho.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="admin@ossinnovation.com"
SMTP_PASSWORD="TU_CONTRASEÑA_DE_APLICACION_AQUI"  # 👈 Pega aquí la contraseña generada
EMAIL_FROM="Oráculo Angelical <admin@ossinnovation.com>"
```

### Configuración de Zoho Mail SMTP:

| Campo | Valor |
|-------|-------|
| **Host** | smtp.zoho.com |
| **Puerto** | 587 (STARTTLS) o 465 (SSL) |
| **Seguridad** | STARTTLS (recomendado) |
| **Usuario** | admin@ossinnovation.com |
| **Contraseña** | Contraseña de aplicación generada |

---

## 📝 PASO 3: Crear Usuarios de Prueba

Ejecuta el script de configuración:

```bash
cd C:/Projects/oraculo_loguin
node scripts/setup-test-users.js
```

Este script creará automáticamente:

### 👑 Administrador
- **Email:** admin@ossinnovation.com
- **Password:** Test123456!
- **Role:** ADMIN

### 👨‍🏫 Consultor
- **Email:** cesarandres.lopu@gmail.com
- **Password:** Test123456!
- **Role:** CONSULTANT
- **Especialidad:** Guía Espiritual y Tarot
- **Tarifa:** $60.000 COP/hora
- **Rating:** 4.8 ⭐
- **Disponibilidad:** 
  - Lun-Vie: 9:00 AM - 6:00 PM
  - Sábado: 9:00 AM - 2:00 PM

### 👤 Usuario de Prueba
- **Email:** usuario@test.com
- **Password:** Test123456!
- **Role:** USER

---

## 📧 PASO 4: Probar Envío de Emails

### Opción 1: Crear un script de prueba

Crea el archivo `test-email.js`:

```javascript
const nodemailer = require('nodemailer')
require('dotenv').config({ path: '.env.local' })

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'cesarandres.lopu@gmail.com', // Email de prueba
      subject: '✅ Test - Sistema de Videoconsultas',
      html: `
        <h2>¡Email de Prueba Exitoso!</h2>
        <p>El sistema de emails está configurado correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
      `
    })
    
    console.log('✅ Email enviado exitosamente!')
    console.log('📧 Message ID:', info.messageId)
  } catch (error) {
    console.error('❌ Error al enviar email:', error)
  }
}

testEmail()
```

Ejecuta:
```bash
node test-email.js
```

### Opción 2: Hacer una reserva de consulta

1. Inicia el servidor: `npm run dev`
2. Login como usuario: `usuario@test.com`
3. Reserva una consulta en: `http://localhost:3000/book-consultation`
4. Deberías recibir emails en ambos correos:
   - usuario@test.com (confirmación)
   - cesarandres.lopu@gmail.com (notificación al consultor)

---

## 📋 TIPOS DE EMAILS QUE SE ENVÍAN

### 1. **Email de Confirmación de Consulta**
- **Enviado a:** Usuario que reserva
- **Cuando:** Al crear una nueva consulta
- **Contenido:**
  - Detalles de la consulta (fecha, hora, duración)
  - Información del consultor
  - Enlace para unirse a la videollamada
  - Recomendaciones antes de la consulta

### 2. **Email de Notificación al Consultor**
- **Enviado a:** Consultor asignado
- **Cuando:** Al crear una nueva consulta
- **Contenido:**
  - Información del cliente
  - Detalles de la consulta
  - Enlace al panel de consultor

### 3. **Email de Recordatorio**
- **Enviado a:** Usuario y Consultor
- **Cuando:** 24h, 1h y 15 min antes de la consulta
- **Contenido:**
  - Recordatorio de la consulta próxima
  - Enlace directo a la videollamada
  - Tiempo restante

### 4. **Email de Cancelación**
- **Enviado a:** Usuario y Consultor
- **Cuando:** Se cancela una consulta
- **Contenido:**
  - Información de la consulta cancelada
  - Motivo de cancelación (si se proporciona)
  - Opciones para reagendar

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Error: "Invalid login" o "Authentication failed"

**Posibles causas:**
1. Contraseña incorrecta o no es contraseña de aplicación
2. 2FA activado sin contraseña de aplicación

**Solución:**
1. Ve a: https://accounts.zoho.com/home#security/app-password
2. Genera una nueva contraseña de aplicación
3. Actualiza `.env.local` con la nueva contraseña
4. Reinicia el servidor

---

### ❌ Error: "Connection timeout"

**Solución:**
1. Verifica que el puerto sea 587
2. Verifica que SMTP_SECURE sea "false"
3. Verifica tu firewall/antivirus

---

### ❌ Error: "ECONNREFUSED"

**Solución:**
1. Verifica tu conexión a internet
2. Prueba cambiar el puerto a 465 y SMTP_SECURE a "true"
3. Verifica que Zoho Mail no esté bloqueado en tu red

---

### ❌ Emails no llegan (sin errores)

**Verificar:**
1. Revisa la carpeta de SPAM
2. Revisa que el email esté verificado en Zoho
3. Revisa los límites de envío de Zoho (50 emails/día en plan gratuito)
4. Revisa el log del servidor para ver si se envió

---

## 🧪 PRUEBAS COMPLETAS

### Test 1: Crear Consulta
1. Login como `usuario@test.com`
2. Ir a `/book-consultation`
3. Seleccionar el consultor César Andrés López
4. Reservar una consulta
5. **Verificar que lleguen 2 emails:**
   - ✅ Confirmación a usuario@test.com
   - ✅ Notificación a cesarandres.lopu@gmail.com

### Test 2: Cancelar Consulta
1. Ir a `/user/consultations`
2. Cancelar una consulta
3. **Verificar que llegue email de cancelación**

### Test 3: Recordatorios (Programados)
1. Crear una consulta para mañana
2. Los recordatorios se enviarán automáticamente:
   - 24h antes
   - 1h antes
   - 15min antes

---

## 📊 MONITOREO DE EMAILS

### Ver logs en el servidor:
El sistema imprime logs cuando envía emails:

```
✅ Email enviado: <message-id>
```

O si hay error:
```
❌ Error al enviar email: <error>
```

### Verificar en Zoho:
1. Ve a tu cuenta de Zoho Mail
2. Revisa la carpeta "Enviados"
3. Deberías ver los emails enviados desde el sistema

---

## 🔒 SEGURIDAD

### ⚠️ IMPORTANTE:
- **NUNCA** subas el archivo `.env.local` a Git
- La contraseña de aplicación es diferente a tu contraseña de Zoho
- Si comprometes la contraseña, revócala y genera una nueva
- El archivo `.env.local` está en `.gitignore` por defecto

### Permisos de la contraseña de aplicación:
La contraseña generada SOLO tiene permisos para enviar emails desde tu cuenta, no puede:
- Leer tus emails
- Modificar configuración
- Acceder a otros servicios de Zoho

---

## 📞 SOPORTE

### Si tienes problemas:

1. **Verifica el archivo `.env.local`:**
   ```bash
   cat .env.local | grep SMTP
   ```

2. **Prueba la conexión SMTP:**
   ```bash
   node test-email.js
   ```

3. **Revisa los logs del servidor:**
   ```bash
   npm run dev
   # Observa la consola cuando hagas una reserva
   ```

4. **Documentación de Zoho:**
   - https://www.zoho.com/mail/help/smtp-access.html
   - https://www.zoho.com/mail/help/adminconsole/app-passwords.html

---

## ✅ CHECKLIST DE CONFIGURACIÓN

```bash
✅ Generar contraseña de aplicación en Zoho
✅ Actualizar SMTP_PASSWORD en .env.local
✅ Ejecutar script de usuarios: node scripts/setup-test-users.js
✅ Probar envío de email con test-email.js
✅ Iniciar servidor: npm run dev
✅ Hacer una reserva de prueba
✅ Verificar recepción de emails
✅ Probar cancelación y verificar email
```

---

## 🎉 RESULTADO FINAL

Una vez configurado correctamente:

1. ✅ Los usuarios reciben confirmación al reservar
2. ✅ Los consultores reciben notificación de nuevas reservas
3. ✅ Se envían recordatorios automáticos
4. ✅ Se notifican cancelaciones
5. ✅ Todo funciona desde admin@ossinnovation.com

**¡El sistema de videoconsultas con emails está listo para producción!** 🚀

---

**Fecha:** 11 de Octubre, 2025  
**Correo Admin:** admin@ossinnovation.com  
**Correo Consultor:** cesarandres.lopu@gmail.com
