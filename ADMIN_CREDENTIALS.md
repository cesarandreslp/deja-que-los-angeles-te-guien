# 🔐 CREDENCIALES DE ACCESO - ORÁCULO DE LOS ARCÁNGELES

## 👨‍💼 **ADMINISTRADOR PRINCIPAL**

### 🔑 **Credenciales del Admin:**
- **📧 Email:** `admin@oraculo.com`
- **🔐 Password:** `admin123456`
- **👤 Rol:** ADMIN
- **🌐 Panel:** http://localhost:3004/admin

### ✅ **Accesos del Administrador:**
- ⚙️ **Panel de Personalización:** Temas, colores, logo, textos
- 👥 **Gestión de Usuarios:** Crear, editar, eliminar usuarios
- 📊 **Panel de Estadísticas:** Consultas, ventas, métricas
- 🛍️ **Gestión de Tienda:** Productos, inventario, pedidos
- 💳 **Gestión de Membresías:** Planes, suscripciones
- 📅 **Gestión de Consultas:** Horarios, consultores
- 🔧 **Configuración del Sistema:** Todas las opciones

---

## 👩‍🏫 **CONSULTORES**

### 👨‍💼 **Consultor 1:**
- **📧 Email:** `consultor@oraculo.com`
- **🔐 Password:** `consultor123`
- **👤 Rol:** CONSULTANT
- **🌐 Panel:** http://localhost:3004/consultant

### 👩‍💼 **Consultor 2 (Especialista en Tarot):**
- **📧 Email:** `maria.consultora@oraculo.com`
- **🔐 Password:** `test123`
- **👤 Rol:** CONSULTANT
- **🌐 Panel:** http://localhost:3004/consultant

### 👨‍💼 **Consultor de Prueba:**
- **📧 Email:** `consultor.test@oraculo.com`
- **🔐 Password:** `test123`
- **👤 Rol:** CONSULTANT
- **🌐 Panel:** http://localhost:3004/consultant

### ✅ **Accesos de Consultores:**
- 📅 **Calendario Personal:** Gestión de horarios disponibles
- 📞 **Videoconsultas:** Iniciar y gestionar sesiones
- 👥 **Clientes:** Ver historial de consultas
- 💰 **Comisiones:** Revisar ganancias y pagos
- 📊 **Estadísticas:** Consultas realizadas, calificaciones

---

## 👤 **USUARIOS REGULARES**

### 👤 **Usuario Regular:**
- **📧 Email:** `usuario@oraculo.com`
- **🔐 Password:** `usuario123`
- **👤 Rol:** USER
- **🌐 Panel:** http://localhost:3004/user

### 👤 **Usuario de Prueba:**
- **📧 Email:** `user.test@oraculo.com`
- **🔐 Password:** `test123`
- **👤 Rol:** USER
- **🌐 Panel:** http://localhost:3004/user

### ✅ **Accesos de Usuarios:**
- 📅 **Agendar Consultas:** Reservar videoconsultas
- 📞 **Mis Consultas:** Ver historial y próximas citas
- 🛍️ **Tienda:** Comprar productos espirituales
- 💳 **Membresías:** Suscribirse a planes premium
- 👤 **Mi Perfil:** Actualizar datos personales
- 💰 **Mi Cartera:** Ver saldo y transacciones

---

## 🚀 **ACCESO RÁPIDO**

### 🔗 **URLs Directas:**
- **🏠 Página Principal:** http://localhost:3004/
- **🔐 Login:** http://localhost:3004/login
- **📝 Registro:** http://localhost:3004/register
- **👨‍💼 Panel Admin:** http://localhost:3004/admin
- **🎨 Personalización:** http://localhost:3004/admin/configuracion/personalizacion

### 🎯 **Para Testing Rápido:**
```
Admin: admin@oraculo.com / admin123456
Consultor: consultor@oraculo.com / consultor123
Usuario: usuario@oraculo.com / usuario123
```

---

## 🛠️ **SCRIPTS DISPONIBLES**

### 📋 **Crear Usuarios:**
```bash
# Crear admin y usuarios base
node scripts/create-admin.js

# Crear usuarios de prueba adicionales
node scripts/create-test-users.js

# Verificar usuarios existentes
node scripts/check-users.js
```

### 🔧 **Configuración:**
```bash
# Configurar tema ORACULO
node scripts/switch-to-oraculo.js

# Configurar logo local
node scripts/update-logo-local.js

# Crear configuración por defecto
node scripts/create-default-config.js
```

---

## 🔒 **SEGURIDAD**

### ⚠️ **Importante:**
- 🔐 **Contraseñas de desarrollo:** Solo para testing local
- 🌐 **Producción:** Cambiar todas las contraseñas
- 🔑 **Hash bcrypt:** Contraseñas encriptadas con salt 12
- ✅ **Roles verificados:** Sistema de permisos implementado

### 🛡️ **Recomendaciones:**
- 📝 Cambiar contraseñas por defecto en producción
- 🔒 Usar contraseñas fuertes (mínimo 12 caracteres)
- 👥 Revisar usuarios regularmente
- 🔍 Monitorear accesos admin

---

## 🎉 **ESTADO ACTUAL**

### ✅ **Sistema Configurado:**
- 🎨 **Tema:** ORACULO (gradientes púrpura-azul)
- 🖼️ **Logo:** `/icons/logo.png` (local)
- 🏢 **Nombre:** "Deja que los Arcángeles te Guíen"
- 🌐 **Servidor:** http://localhost:3004
- 🗄️ **Base de datos:** PostgreSQL (Neon)
- 🔑 **Autenticación:** NextAuth.js

### 🎯 **Todo Listo Para:**
- 👨‍💼 Administración completa del sistema
- 👩‍🏫 Gestión de consultores y servicios
- 👤 Registro y uso de usuarios
- 🛍️ Compras en tienda angelical
- 📞 Videoconsultas espirituales
- 💳 Suscripciones a membresías

**¡Usa las credenciales del admin para acceder al panel completo! 🔮✨**