Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Debes ayudarme a crear un módulo de **tienda virtual angelical** integrado a mi aplicación del Oráculo de los Arcángeles. 
El sistema debe ser seguro, escalable, y compatible con los módulos ya creados (autenticación, video consultas, oráculo). 
Debes dividir el trabajo en fases, revisar errores al final de cada fase y optimizar el código para producción. 
El carrito de compras debe ser unificado: puede contener productos físicos y también video consultas.

---

## Requerimientos clave

1. **Gestión de productos:**
   - Productos físicos angelicales: camisetas, collares, brazaletes, esencias, aceites, rituales.
   - Cada producto debe tener:
     - nombre
     - descripción
     - precio (en centavos)
     - moneda
     - stock
     - categoría
     - imágenes
     - estado (activo/inactivo)

2. **Carrito unificado:**
   - Un carrito puede contener tanto `Product` como `VideoConsultation`.
   - Cada ítem del carrito debe guardar tipo, cantidad, precio y referencia.
   - Debe estar asociado al `userId`.

3. **Checkout unificado:**
   - Colombia → Mercado Pago.
   - Internacional → Stripe.
   - Soporte de múltiples ítems (productos + consultas).
   - Al pagar:
     - Para productos físicos → descontar stock y generar pedido.
     - Para video consultas → confirmar la cita (cambiar estado a `PAID`).

4. **Gestión de pedidos:**
   - Cada pedido (`Order`) tiene:
     - total, moneda, estado (`PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`).
     - relación con el usuario.
     - relación con ítems (`OrderItem`).
   - Envío:
     - Guardar dirección de envío y teléfono de contacto.
     - Actualizar estado del pedido a `SHIPPED` cuando se envíe.

5. **Frontend:**
   - Página de productos (lista + detalle).
   - Carrito con ítems agregados (productos y consultas).
   - Proceso de checkout.
   - Página de confirmación de compra.
   - Vista de pedidos anteriores.

6. **Pagos y seguridad:**
   - Webhook de Mercado Pago y Stripe en `/api/payment/webhook`.
   - Verificación de firma de los webhooks.
   - Guardar logs de transacciones.
   - Manejo de errores y reintentos.

7. **Compatibilidad:**
   - No romper modelos ya existentes (User, VideoConsultation).
   - El carrito y pedidos deben integrarse con el `userId` actual.

---

## Fases del desarrollo

### Fase 1: Modelos en Prisma
- `Product`: id, nombre, descripción, precioCents, currency, stock, categoría, imágenes, isActive, createdAt, updatedAt.
- `Order`: id, userId, totalCents, currency, status, paymentProvider, paymentStatus, address, phone, createdAt, updatedAt.
- `OrderItem`: id, orderId, productId (opcional), videoConsultationId (opcional), quantity, priceCents, currency.
- `Cart`: id, userId, createdAt, updatedAt.
- `CartItem`: id, cartId, productId (opcional), videoConsultationId (opcional), quantity.

### Fase 2: API de productos
- `GET /api/products` → lista de productos activos.
- `GET /api/products/:id` → detalle.
- `POST /api/products` (admin) → crear producto.
- `PUT /api/products/:id` (admin) → actualizar.
- `DELETE /api/products/:id` (admin) → desactivar producto.

### Fase 3: API de carrito
- `GET /api/cart` → ver carrito del usuario.
- `POST /api/cart/add` → añadir producto o consulta.
- `POST /api/cart/remove` → eliminar ítem.
- `POST /api/cart/clear` → vaciar carrito.

### Fase 4: Checkout unificado
- `POST /api/checkout` → iniciar checkout según país.
- Crear preferencia (Mercado Pago) o checkout session (Stripe).
- Redirigir al usuario a la pasarela.
- Al pagar, webhook actualiza `Order`, `OrderItem`, `VideoConsultation` y `Product.stock`.

### Fase 5: Gestión de pedidos
- `GET /api/orders` → listar pedidos del usuario.
- `GET /api/orders/:id` → detalle.
- `PUT /api/orders/:id/ship` (admin) → marcar como enviado.
- Reducir stock al confirmar pago.

### Fase 6: Frontend
- Páginas:
  - `/store` → grid de productos.
  - `/store/[id]` → detalle de producto.
  - `/cart` → carrito con ítems.
  - `/checkout` → flujo de pago.
  - `/orders` → historial de pedidos.
- UI responsiva tipo app móvil.
- Unificación visual con el oráculo y las consultas.

### Fase 7: Notificaciones
- Confirmación de compra por email.
- Notificación de envío (cuando `Order` = SHIPPED).
- Integración opcional con notificaciones push.

### Fase 8: Testing y validación
- Probar compra de productos.
- Probar compra de video consulta.
- Probar carrito con ítems mixtos.
- Validar integridad de pagos y stock.

---

## Tu tarea
- Implementar cada fase paso a paso.
- Validar errores antes de avanzar.
- Mantener compatibilidad con `User` y `VideoConsultation`.
- Garantizar que el carrito unificado funcione con productos y consultas.
