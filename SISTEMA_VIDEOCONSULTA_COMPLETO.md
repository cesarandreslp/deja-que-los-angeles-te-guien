Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Ayúdame a desarrollar un módulo de consultas por video dentro de mi aplicación de lectura del Oráculo de los Arcángeles. 
Debes seguir los pasos al pie de la letra, dividir el trabajo en fases, y revisar/corregir errores al final de cada fase antes de continuar. 
Optimiza el código para producción.

---

## Fase 1: Modelo de datos en Prisma
- Crear el modelo `VideoConsultation` en `prisma/schema.prisma` con los siguientes campos:
  - `id`: identificador único (uuid).
  - `userId`: id del consultante (relación con modelo `User`).
  - `consultantId`: id del consultor (relación con `User`).
  - `date`: fecha de la cita.
  - `time`: hora de la cita.
  - `status`: estado (`PENDING`, `CONFIRMED`, `PAID`, `ATTENDED`, `REPROGRAMMED`, `CANCELLED`).
  - `paymentProvider`: `MERCADOPAGO` o `STRIPE`.
  - `paymentStatus`: `PENDING`, `SUCCESS`, `FAILED`.
  - `videoLink`: string con el link de videollamada.
  - `createdAt` y `updatedAt`.
- Incluir migración inicial.

---

## Fase 2: API de disponibilidad y reserva
- Rutas API:
  - `GET /api/availability` → devuelve días y horas disponibles.
  - `POST /api/book` → recibe día, hora y consultante; crea registro preliminar de la cita con estado `PENDING`.
- Validar que el turno no esté ocupado.
- Devolver confirmación de reserva.

---

## Fase 3: Pasarela de pagos
- Implementar integración con:
  - **Mercado Pago** (para usuarios en Colombia).
  - **Stripe** (para usuarios internacionales).
- En `/api/book` redirigir al checkout de la pasarela correcta según el país del usuario.
- Webhooks:
  - `POST /api/payment/webhook` → confirmar pago.
    - Cambiar estado a `PAID`.
    - Guardar `paymentProvider` y `paymentStatus`.
    - Generar automáticamente link de videollamada (usando Jitsi Meet API o Daily.co).
    - Guardar `videoLink`.

---

## Fase 4: Recordatorios automáticos
- Implementar recordatorios con `node-cron` o servicio equivalente.
- Recordatorios enviados al consultante:
  - Al agendar: “Tu cita ha sido programada para [fecha y hora de Colombia]”.
  - 1 día antes.
  - El mismo día: 3h, 2h, 1h y 30 minutos antes.
- Guardar logs de recordatorios en la BD.

---

## Fase 5: Asistencia y reprogramación
- Nueva API: `POST /api/attendance`.
- Lógica:
  - Si consultante y consultor se conectan → `status = ATTENDED`.
  - Si solo 1 se conecta → reprogramar automáticamente al próximo espacio disponible (no el mismo día).
  - Si en la reprogramación el consultante no se conecta → marcar como `ATTENDED` igualmente.
- Actualizar estado en la base de datos.

---

## Fase 6: Frontend — Calendario y flujo de citas
- Componentes React:
  - Calendario interactivo con disponibilidad.
  - Formulario para confirmar cita.
  - Integración de pagos (Stripe/Mercado Pago).
  - Confirmación de cita y visualización del link de videollamada.
- Mostrar estados (`PENDING`, `PAID`, `ATTENDED`).
- UI amigable, responsiva y clara.

---

## Fase 7: Validación y testing
- Revisar flujo completo:
  1. Selección de cita.
  2. Pago.
  3. Generación de link.
  4. Recordatorios.
  5. Asistencia / reprogramación.
- Incluir pruebas básicas de API (ej. con Jest o integración Postman).
- Corregir errores y optimizar para producción.

---

## Flujo del usuario
1. Usuario abre calendario y ve disponibilidad.
2. Selecciona día y hora.
3. Confirma cita → redirige a la pasarela de pago.
4. Pago exitoso → cita confirmada + link de videollamada generado.
5. Usuario recibe confirmación y recordatorios.
6. El día de la cita → ambos ingresan al link.
   - Si ambos se conectan → atendida.
   - Si solo uno se conecta → reprogramada automáticamente.
   - Si el consultante no asiste en la reprogramación → atendida.

---

## Tu tarea
- Desarrollar cada fase paso a paso.
- Validar errores al finalizar cada fase antes de continuar.
- Optimizar y documentar el código.
