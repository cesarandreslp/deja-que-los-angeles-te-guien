# 🎥 GUÍA COMPLETA DE PRUEBAS - Sistema de Videoconsultas

## 📋 ÍNDICE
1. [Preparación](#preparación)
2. [Flujo de Usuario Normal](#flujo-usuario-normal)
3. [Flujo de Usuario Invitado (Guest)](#flujo-guest)
4. [Panel de Administrador](#panel-admin)
5. [Panel de Consultor](#panel-consultor)
6. [Videollamada en Vivo](#videollamada)
7. [APIs y Backend](#apis)
8. [Casos de Prueba Específicos](#casos-prueba)

---

## 🚀 PREPARACIÓN

### 1. Iniciar el Servidor
```bash
cd C:/Projects/oraculo_loguin
npm run dev
```

Esperar a que aparezca:
```
✓ Ready on http://localhost:3000
```

### 2. Verificar Base de Datos
```bash
npx prisma studio
```

**Verificar que existan:**
- ✅ Tabla `video_consultations`
- ✅ Tabla `users` con roles: USER, CONSULTANT, ADMIN
- ✅ Tabla `consultation_reminders` (para notificaciones)

### 3. Crear Usuarios de Prueba

#### Admin (si no existe):
- Email: admin@oraculo.com
- Role: ADMIN

#### Consultor (si no existe):
- Email: consultor@oraculo.com
- Role: CONSULTANT
- Necesita tener datos adicionales configurados

#### Usuario Normal:
- Email: usuario@test.com
- Role: USER

---

## 👤 FLUJO DE USUARIO NORMAL

### PRUEBA 1: Explorar Consultores (Sin Login)

#### Paso 1: Acceder a la página de consultas
```
URL: http://localhost:3000/book-consultation
o
URL: http://localhost:3000/consultas
```

**Verificar:**
- ✅ La página carga sin requerir login
- ✅ Se muestra lista de consultores disponibles
- ✅ Cada consultor muestra:
  - Nombre
  - Foto de perfil
  - Especialidad
  - Tarifa por hora
  - Rating (estrellas)
  - Número de consultas realizadas
  - Bio/descripción

#### Paso 2: Ver detalles de un consultor
- Click en "Ver Perfil" o en un consultor
- **Verificar:**
  - ✅ Muestra información detallada
  - ✅ Horarios disponibles
  - ✅ Testimonios/reviews
  - ✅ Botón "Reservar Consulta"

---

### PRUEBA 2: Reservar Consulta (Usuario Autenticado)

#### Paso 1: Login como usuario
```
Email: usuario@test.com
Password: [tu password]
```

#### Paso 2: Seleccionar consultor
- Click en un consultor de la lista
- Click en "Reservar Consulta"

**Verificar:**
- ✅ Avanza al paso de selección de fecha/hora

#### Paso 3: Seleccionar fecha y hora
- Usar el calendario para seleccionar fecha
- Seleccionar hora disponible
- Seleccionar duración (30, 60, 90 minutos)

**Verificar:**
- ✅ Calendario muestra fechas disponibles
- ✅ Horas ocupadas están deshabilitadas
- ✅ Muestra precio calculado según duración
- ✅ Campo opcional para notas

#### Paso 4: Confirmar reserva
- Revisar resumen:
  - Consultor
  - Fecha y hora
  - Duración
  - Precio total
- Click en "Confirmar y Pagar"

**Verificar:**
- ✅ Muestra resumen correcto
- ✅ Opciones de pago disponibles (Mercado Pago/Stripe)

#### Paso 5: Realizar pago
- Seleccionar método de pago
- Completar información de pago
- Confirmar

**Verificar:**
- ✅ Redirección a página de éxito
- ✅ Mensaje de confirmación
- ✅ Botón para ver detalles de la consulta
- ✅ Opción de agregar al calendario

---

### PRUEBA 3: Ver Mis Consultas

#### Acceder al panel de usuario
```
URL: http://localhost:3000/user
o
URL: http://localhost:3000/dashboard
```

#### Navegar a "Mis Consultas"

**Verificar que se muestren:**
- ✅ **Próximas Consultas:**
  - Fecha y hora
  - Consultor
  - Estado (SCHEDULED, CONFIRMED)
  - Tiempo restante (ej: "En 2 horas")
  - Botón "Unirse a la Videollamada" (activo 15 min antes)
  
- ✅ **Consultas Pasadas:**
  - Fecha y hora
  - Consultor
  - Estado (COMPLETED, CANCELLED)
  - Opción para dejar review
  - Opción para ver grabación (si aplica)

#### Funcionalidades disponibles:
- ✅ Cancelar consulta (si falta más de 24h)
- ✅ Reprogramar consulta
- ✅ Ver detalles completos
- ✅ Contactar al consultor (chat)

---

## 🎫 FLUJO DE USUARIO INVITADO (GUEST)

### PRUEBA 4: Reservar sin Login

#### Paso 1: Como invitado, seleccionar consultor
```
URL: http://localhost:3000/book-consultation
```
- NO hacer login
- Seleccionar un consultor
- Seleccionar fecha, hora, duración

#### Paso 2: Al intentar confirmar
**Verificar:**
- ✅ Aparece modal: "Necesitas crear una cuenta para continuar"
- ✅ Opciones:
  - Iniciar Sesión
  - Registrarse
  - Continuar como invitado (con email)

#### Paso 3: Registrarse desde la reserva
- Click en "Registrarse"
- Completar formulario
- **Verificar:**
  - ✅ Después del registro, vuelve a la página de confirmación
  - ✅ Los datos de la consulta se mantienen
  - ✅ Puede completar la reserva

#### Paso 4: Continuar como invitado
- Proporcionar email
- **Verificar:**
  - ✅ Se crea cuenta temporal
  - ✅ Se envía email de verificación
  - ✅ Puede completar el pago
  - ✅ Recibe link de la videollamada por email

---

## 👨‍💼 PANEL DE ADMINISTRADOR

### PRUEBA 5: Gestión de Consultas (Admin)

#### Acceder al panel
```
URL: http://localhost:3000/admin/consultations
```

**Verificar vista general:**
- ✅ Lista de todas las consultas
- ✅ Filtros por:
  - Estado (PENDING, SCHEDULED, COMPLETED, CANCELLED)
  - Fecha
  - Consultor
  - Usuario
- ✅ Búsqueda por nombre/email
- ✅ Estadísticas:
  - Total de consultas
  - Consultas hoy
  - Ingresos del mes
  - Consultores activos

#### Funcionalidades de admin:
- ✅ Ver detalles de cualquier consulta
- ✅ Editar información de consulta
- ✅ Cancelar consulta (con reembolso)
- ✅ Asignar/reasignar consultor
- ✅ Ver historial de cambios
- ✅ Exportar reporte

#### Gestión de consultores:
```
URL: http://localhost:3000/admin/users
```
- ✅ Promover usuario a CONSULTANT
- ✅ Configurar tarifa por hora
- ✅ Establecer disponibilidad
- ✅ Ver estadísticas del consultor
- ✅ Desactivar consultor

---

## 👨‍🏫 PANEL DE CONSULTOR

### PRUEBA 6: Vista de Consultor

#### Acceder como consultor
```
Login: consultor@oraculo.com
URL: http://localhost:3000/consultant
o
URL: http://localhost:3000/dashboard
```

**Verificar que se muestre:**
- ✅ **Próximas Consultas:**
  - Fecha y hora
  - Cliente (nombre/foto)
  - Duración
  - Notas del cliente
  - Botón "Iniciar Consulta"
  
- ✅ **Estadísticas:**
  - Consultas hoy
  - Consultas este mes
  - Ingresos del mes
  - Rating promedio

#### Configurar Disponibilidad:
```
URL: http://localhost:3000/consultant/availability
```
- ✅ Calendario para marcar días/horas disponibles
- ✅ Configurar horario recurrente
- ✅ Bloquear fechas específicas
- ✅ Establecer duración de sesiones
- ✅ Guardar cambios

#### Gestionar Consultas:
- ✅ Ver detalles del cliente
- ✅ Ver historial de consultas con el cliente
- ✅ Agregar notas privadas
- ✅ Cancelar/reprogramar (notificar al cliente)
- ✅ Marcar como completada
- ✅ Solicitar review

---

## 🎥 VIDEOLLAMADA EN VIVO

### PRUEBA 7: Iniciar y Unirse a Videollamada

#### Preparación:
1. Tener una consulta programada para "ahora" o dentro de 15 minutos
2. Tener dos navegadores/dispositivos:
   - Navegador 1: Usuario
   - Navegador 2: Consultor

#### Paso 1: Unirse a la llamada (Usuario)
```
URL: http://localhost:3000/videocall/[consultation-id]
o
Desde "Mis Consultas" → "Unirse a la Videollamada"
```

**Verificar:**
- ✅ Solicita permisos de cámara/micrófono
- ✅ Muestra preview de la cámara
- ✅ Muestra información de la consulta
- ✅ Botón "Unirse a la Llamada"
- ✅ Solo disponible 15 min antes de la hora programada

#### Paso 2: El consultor se une
```
Navegador 2 (Consultor):
URL: http://localhost:3000/videocall/[consultation-id]
```

**Verificar:**
- ✅ Ambos se ven y escuchan
- ✅ Video bidireccional funciona
- ✅ Audio bidireccional funciona

#### Paso 3: Controles durante la llamada

**Verificar controles disponibles:**
- ✅ Silenciar/Activar micrófono
- ✅ Activar/Desactivar cámara
- ✅ Compartir pantalla
- ✅ Chat de texto
- ✅ Grabación (si está habilitada)
- ✅ Finalizar llamada
- ✅ Indicador de tiempo transcurrido
- ✅ Indicador de calidad de conexión

#### Paso 4: Durante la llamada

**Funcionalidades a probar:**
1. **Silenciar Micrófono:**
   - Click en botón de micrófono
   - ✅ Icono cambia a "muted"
   - ✅ El otro usuario ve indicador "muted"

2. **Desactivar Cámara:**
   - Click en botón de cámara
   - ✅ Video se detiene
   - ✅ Muestra avatar o placeholder

3. **Compartir Pantalla:**
   - Click en "Compartir Pantalla"
   - ✅ Solicita seleccionar ventana/pantalla
   - ✅ El otro usuario ve la pantalla compartida

4. **Chat de Texto:**
   - Abrir panel de chat
   - Enviar mensaje
   - ✅ Mensaje aparece en ambos lados
   - ✅ Notificación de nuevo mensaje

5. **Indicador de Tiempo:**
   - ✅ Cuenta regresiva del tiempo restante
   - ✅ Alerta cuando faltan 5 minutos
   - ✅ Finaliza automáticamente al acabar el tiempo

#### Paso 5: Finalizar la llamada

**Por el consultor:**
- Click en "Finalizar Consulta"
- ✅ Solicita confirmación
- ✅ Opción para dejar notas finales
- ✅ Marca consulta como COMPLETED

**Por el usuario:**
- Click en "Salir"
- ✅ Pregunta si está seguro
- ✅ La sesión continúa para el consultor si no ha finalizado

#### Paso 6: Después de la llamada

**Para el usuario:**
- ✅ Redirección a página de feedback
- ✅ Solicitud de rating (1-5 estrellas)
- ✅ Campo para dejar review
- ✅ Botón para descargar grabación (si aplica)
- ✅ Opción para reservar otra consulta

**Para el consultor:**
- ✅ Formulario para notas post-consulta
- ✅ Actualización automática de estadísticas
- ✅ Actualización de comisiones

---

## 🔧 APIS Y BACKEND

### PRUEBA 8: Endpoints de Consultas

#### 1. Listar Consultores
```bash
curl http://localhost:3000/api/consultants
```

**Respuesta esperada:**
```json
[
  {
    "id": "...",
    "fullName": "Dr. Juan Pérez",
    "email": "consultor@oraculo.com",
    "specialty": "Guía Espiritual",
    "hourlyRate": 50000,
    "rating": 4.8,
    "totalConsultations": 145,
    "profileImage": "/path/to/image.jpg",
    "bio": "Experto en..."
  }
]
```

#### 2. Crear Consulta
```bash
curl -X POST http://localhost:3000/api/consultations/book \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "consultantId": "xxx",
    "date": "2025-10-15",
    "time": "14:00",
    "duration": 60,
    "notes": "Primera consulta"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "consultationId": "...",
  "paymentUrl": "https://mercadopago.com/...",
  "message": "Consulta creada exitosamente"
}
```

#### 3. Obtener Consulta
```bash
curl http://localhost:3000/api/consultations/[id] \
  -H "Cookie: next-auth.session-token=..."
```

#### 4. Cancelar Consulta
```bash
curl -X DELETE http://localhost:3000/api/consultations/[id] \
  -H "Cookie: next-auth.session-token=..."
```

#### 5. Actualizar Estado
```bash
curl -X PATCH http://localhost:3000/api/consultations/[id] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "rating": 5,
    "review": "Excelente consulta"
  }'
```

---

## 🧪 CASOS DE PRUEBA ESPECÍFICOS

### CASO 1: Consulta con Notificaciones

#### Preparación:
1. Habilitar notificaciones push
2. Crear consulta para dentro de 1 hora

#### Verificar:
- ✅ **24 horas antes:** Email recordatorio
- ✅ **1 hora antes:** Push notification
- ✅ **15 minutos antes:** 
  - Push notification
  - Email con link de la videollamada
  - SMS (si está configurado)
- ✅ **5 minutos antes:** Push notification urgente

---

### CASO 2: Reprogramación de Consulta

#### Escenario:
Usuario necesita cambiar la fecha/hora

#### Pasos:
1. Ir a "Mis Consultas"
2. Click en consulta programada
3. Click en "Reprogramar"
4. Seleccionar nueva fecha/hora
5. Confirmar

#### Verificar:
- ✅ Se envía notificación al consultor
- ✅ Consultor recibe email de cambio
- ✅ Se actualiza en ambos calendarios
- ✅ No se cobra cargo adicional (si falta >24h)
- ✅ Se aplica cargo si falta <24h

---

### CASO 3: No Show (Usuario no se presenta)

#### Escenario:
Usuario no se une a la videollamada

#### Pasos:
1. Consultor se une a la llamada
2. Espera 10 minutos
3. Usuario no aparece
4. Consultor marca como "No Show"

#### Verificar:
- ✅ Estado cambia a NO_SHOW
- ✅ Se cobra al usuario (no reembolso)
- ✅ Se paga al consultor
- ✅ Se registra en historial del usuario
- ✅ Se envía email al usuario

---

### CASO 4: Problemas Técnicos

#### Escenario:
Problemas de conexión durante la llamada

#### Pasos:
1. Simular desconexión (cerrar pestaña)
2. Volver a unirse

#### Verificar:
- ✅ Puede reconectarse fácilmente
- ✅ La sesión persiste
- ✅ No se pierde el tiempo pagado
- ✅ Chat y notas se mantienen
- ✅ Grabación continúa (si aplica)

---

### CASO 5: Consulta Grupal (Si está implementado)

#### Escenario:
Consulta con múltiples participantes

#### Verificar:
- ✅ Todos los participantes se ven
- ✅ Control de quién puede hablar
- ✅ Moderador tiene controles especiales
- ✅ Se divide el costo entre participantes

---

## 📊 REPORTES Y ANALÍTICAS

### PRUEBA 9: Dashboard de Admin

```
URL: http://localhost:3000/admin/analytics
```

#### Métricas a verificar:
- ✅ **Consultas:**
  - Total de consultas
  - Consultas por estado
  - Tasa de cancelación
  - Duración promedio
  
- ✅ **Ingresos:**
  - Ingresos totales
  - Ingresos por mes
  - Ingresos por consultor
  - Comisiones pagadas

- ✅ **Usuarios:**
  - Usuarios activos
  - Nuevos registros
  - Tasa de conversión (guest → registered)
  - Usuarios con membresía

- ✅ **Consultores:**
  - Consultores activos
  - Rating promedio
  - Horas trabajadas
  - Consultas completadas

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Video no funciona
**Verificar:**
- [ ] Permisos de cámara/micrófono en el navegador
- [ ] HTTPS está habilitado (required para WebRTC)
- [ ] Firewall no bloquea WebRTC
- [ ] Navegador compatible (Chrome, Firefox, Safari)

### Problema 2: No aparecen consultores
**Verificar:**
- [ ] Hay usuarios con role CONSULTANT
- [ ] Consultores tienen `isActive: true`
- [ ] API `/api/consultants` responde correctamente

### Problema 3: No se puede crear consulta
**Verificar:**
- [ ] Usuario está autenticado
- [ ] Consultor tiene disponibilidad configurada
- [ ] Fecha/hora está en el futuro
- [ ] No hay conflictos de horario

### Problema 4: Pago no procesa
**Verificar:**
- [ ] Credenciales de Mercado Pago/Stripe configuradas
- [ ] Webhook está configurado
- [ ] Variables de entorno correctas

---

## ✅ CHECKLIST COMPLETO

### Funcionalidad Básica:
- [ ] Ver lista de consultores
- [ ] Ver detalles de consultor
- [ ] Seleccionar fecha y hora
- [ ] Calcular precio correctamente
- [ ] Crear consulta como usuario autenticado
- [ ] Crear consulta como guest
- [ ] Recibir confirmación por email

### Panel de Usuario:
- [ ] Ver consultas programadas
- [ ] Ver consultas pasadas
- [ ] Cancelar consulta
- [ ] Reprogramar consulta
- [ ] Dejar review

### Panel de Consultor:
- [ ] Ver consultas del día
- [ ] Configurar disponibilidad
- [ ] Ver estadísticas
- [ ] Gestionar consultas

### Videollamada:
- [ ] Unirse a la llamada
- [ ] Video funciona
- [ ] Audio funciona
- [ ] Compartir pantalla funciona
- [ ] Chat funciona
- [ ] Finalizar consulta

### Notificaciones:
- [ ] Email de confirmación
- [ ] Recordatorio 24h antes
- [ ] Recordatorio 1h antes
- [ ] Recordatorio 15 min antes
- [ ] Push notifications funcionan

### Admin:
- [ ] Ver todas las consultas
- [ ] Filtrar y buscar
- [ ] Ver estadísticas
- [ ] Gestionar consultores
- [ ] Exportar reportes

---

## 🎯 PRIORIDAD DE PRUEBAS

### Críticas (Hacer primero):
1. ✅ Crear consulta (flow completo)
2. ✅ Unirse a videollamada
3. ✅ Procesar pago
4. ✅ Enviar notificaciones

### Importantes (Hacer segundo):
5. ✅ Cancelar/reprogramar
6. ✅ Panel de usuario
7. ✅ Panel de consultor
8. ✅ Reviews y ratings

### Opcionales (Hacer al final):
9. ✅ Analíticas avanzadas
10. ✅ Exportar reportes
11. ✅ Consultas grupales
12. ✅ Grabaciones

---

## 🔗 RUTAS PRINCIPALES DEL SISTEMA

### Públicas (sin autenticación):
- `/book-consultation` - Reservar consulta
- `/consultas` - Ver consultores disponibles

### Usuario autenticado:
- `/user` o `/dashboard` - Panel principal
- `/user/consultations` - Mis consultas
- `/videocall/[id]` - Unirse a videollamada

### Consultor:
- `/consultant` - Panel del consultor
- `/consultant/availability` - Configurar disponibilidad
- `/consultant/consultations` - Ver mis consultas

### Admin:
- `/admin/consultations` - Gestionar todas las consultas
- `/admin/users` - Gestionar usuarios y consultores
- `/admin/analytics` - Ver estadísticas

### APIs:
- `GET /api/consultants` - Listar consultores
- `GET /api/availability` - Ver disponibilidad
- `POST /api/consultations/book` - Crear consulta
- `GET /api/consultations/[id]` - Ver consulta
- `PATCH /api/consultations/[id]` - Actualizar consulta
- `DELETE /api/consultations/[id]` - Cancelar consulta
- `POST /api/consultations/[id]/pay` - Procesar pago

---

**Fecha:** 10 de Octubre, 2025
**Sistema:** Videoconsultas v2.0
**Estado:** Listo para Testing Completo 🚀

**Nota:** Esta guía cubre el 100% de las funcionalidades del sistema de videoconsultas. Según `PROGRESO_VIDEOCONSULTA.md`, las fases 1-3 están completas (60% del sistema), por lo que algunas funcionalidades avanzadas pueden estar pendientes de implementación.
