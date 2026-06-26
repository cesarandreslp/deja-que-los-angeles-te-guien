Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Ayúdame a desarrollar un módulo de membresías dentro de mi aplicación del Oráculo de los Arcángeles. 
Este módulo debe ser configurable desde el panel de administración y los usuarios podrán suscribirse pagando con Stripe (internacional) o Mercado Pago (Colombia). 
Debes dividir el desarrollo en fases claras, validar errores al terminar cada fase y optimizar para producción.

---

## Fase 1: Modelos Prisma
- Crear el modelo `MembershipPlan`:
  - `id`: uuid
  - `name`: string (ej. Básica, Premium, Anual, etc.)
  - `description`: string
  - `priceCents`: int (precio en centavos)
  - `currency`: string (ej. COP, USD)
  - `durationDays`: int (ej. 30, 365)
  - `isActive`: boolean (default: true)
  - `createdAt`, `updatedAt`

- Crear el modelo `UserMembership`:
  - `id`: uuid
  - `userId`: relación con `User`
  - `membershipPlanId`: relación con `MembershipPlan`
  - `status`: enum (`ACTIVE`, `EXPIRED`, `CANCELLED`, `PENDING`)
  - `paymentProvider`: enum (`STRIPE`, `MERCADOPAGO`)
  - `paymentStatus`: enum (`PENDING`, `SUCCESS`, `FAILED`)
  - `paymentId`: string? (id del pago)
  - `startDate`: DateTime
  - `endDate`: DateTime
  - `createdAt`, `updatedAt`

- Incluir índices adecuados y relaciones.

---

## Fase 2: Panel de administración
- Crear interfaz en el admin panel para:
  - **CRUD de planes de membresía** (`MembershipPlan`).
  - Activar/desactivar planes.
  - Modificar precios y duración.

- Solo accesible para usuarios con rol `ADMIN`.

---

## Fase 3: API de membresías para usuarios
- Endpoints:
  - `GET /api/memberships/plans` → listar planes activos.
  - `POST /api/memberships/subscribe` → el usuario selecciona un plan, se crea un registro `UserMembership` con estado `PENDING`, y se redirige al checkout de Stripe o Mercado Pago según el país.
  - `POST /api/memberships/payment/webhook` → confirma el pago, actualiza `UserMembership` a `ACTIVE`, asigna `startDate` y `endDate`.

---

## Fase 4: Pasarelas de pago
- **Stripe**: crear sesiones de checkout, recibir webhooks (`payment_intent.succeeded`).
- **Mercado Pago**: crear `preference`, recibir notificación de pago vía webhook.
- Guardar `paymentId`, `paymentProvider`, `paymentStatus` en `UserMembership`.

---

## Fase 5: Gestión automática de expiración
- Usar `node-cron` para revisar diariamente:
  - Si `endDate < now()`, actualizar estado a `EXPIRED`.
- Posibilidad de renovación automática (Stripe lo soporta con suscripciones recurrentes, Mercado Pago requiere reintento manual o suscripción recurrente si está habilitada).

---

## Fase 6: Frontend para usuarios
- Página de “Membresías” donde:
  - Se listan los planes activos con precio y descripción.
  - Botón “Suscribirse”.
  - Flujo de pago con redirección a la pasarela correspondiente.
- Página “Mi Membresía” donde:
  - El usuario ve el estado (`ACTIVE`, `EXPIRED`, `PENDING`).
  - Fechas de inicio y fin.
  - Opción de renovar si está `EXPIRED`.

---

## Fase 7: Notificaciones
- Enviar recordatorios al usuario:
  - Al activar membresía → “Tu membresía está activa hasta [fecha]”.
  - 5 días antes de vencer → “Tu membresía vence pronto, renueva para no perder acceso”.
  - El día de vencimiento → “Tu membresía ha expirado”.

---

## Flujo del usuario
1. Usuario entra a “Membresías” y ve los planes activos.
2. Selecciona un plan → inicia flujo de pago.
3. Pago exitoso → membresía activada (`ACTIVE`) con fechas calculadas.
4. Usuario accede a beneficios según el plan.
5. Notificaciones recuerdan vencimientos.
6. Puede renovar desde la app.

---

## Tu tarea
- Implementar el modelo Prisma, API, frontend y recordatorios en fases.
- Revisar y corregir errores en cada fase antes de pasar a la siguiente.
- Optimizar y documentar el código para producción.
