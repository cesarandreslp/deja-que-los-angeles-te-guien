Asume el rol de un **desarrollador full stack senior y diseñador UI/UX profesional**, especializado en e-commerce moderno con arquitectura basada en Next.js, TypeScript, Prisma, Neon/PostgreSQL, Node.js y TailwindCSS.

Tu tarea es **refactorizar y evolucionar la Tienda Angelical existente** de la aplicación “Deja que los ángeles te guíen” para que tenga el **aspecto y funcionamiento profesional de Shopify**, manteniendo la estructura actual:

- Panel administrativo: `/admin/store`
- Vista pública de tienda: `/tienda`
- Sistema de temas global (ThemeContext + themes.ts)
- Pasarelas de pago integradas (Stripe para exterior, MercadoPago para Colombia)

---

## 🎯 OBJETIVO GLOBAL

Lograr que tanto el administrador como el usuario final vivan una experiencia tipo **Shopify**, pero con la identidad espiritual del proyecto.

- Panel admin con manejo total de tienda, productos, pedidos, clientes y configuración.  
- Tienda pública moderna, fluida, responsive, visualmente coherente con el tema “Arcángel Celestial”.  
- Experiencia de compra optimizada, con carrito persistente, checkout seguro, notificaciones y panel de usuario.  
- Códigos revisados, optimizados y comentados.

---

## 🧱 FASE 1 — Auditoría y refactorización estructural

1. Analiza el código existente en `/admin/store` y `/tienda`.
2. Revisa la arquitectura de componentes, hooks, estados globales y conexiones con la base de datos (Prisma / Neon).
3. Identifica módulos duplicados o estilos no integrados al `ThemeContext`.
4. Normaliza rutas, imports y nomenclaturas (camelCase, PascalCase, kebab-case).

👉 Acción esperada: refactoriza para mantener orden, modularidad y consistencia visual.

---

## 🛒 FASE 2 — Frontend de la tienda pública (`/tienda`)

El objetivo es replicar la experiencia del **frontend de Shopify**:

1. **Página principal de la tienda:**
   - Banner hero con imagen angelical + frase inspiradora.
   - Sección “Productos destacados”.
   - Carrusel “Recomendados por tu Arcángel”.
   - Sección “Ofertas y promociones espirituales”.
   - Diseño modular y responsivo.

2. **Catálogo general:**
   - Filtros dinámicos (categoría, precio, orden).
   - Búsqueda instantánea.
   - Paginación controlada desde Prisma.
   - Skeleton loaders mientras cargan los productos.

3. **Página individual de producto (`/tienda/[slug]`):**
   - Galería de imágenes con zoom.
   - Descripción detallada.
   - Stock disponible.
   - Botón “Agregar al carrito”.
   - Reseñas (modelo adicional `Review` en Prisma).
   - Recomendaciones relacionadas.

4. **Carrito de compras:**
   - Estado persistente (localStorage + sincronización con cuenta si está logueado).
   - Resumen de compra, subtotal, total y descuentos.
   - Botón “Proceder al pago”.

5. **Checkout / Pasarela:**
   - Selección automática de pasarela:
     - Colombia → MercadoPago.
     - Resto del mundo → Stripe.
   - Confirmación visual del pago + mensaje espiritual del Arcángel Gabriel.

6. **Perfil de usuario / Historial de pedidos:**
   - Ver pedidos anteriores, estados, fechas y valores.
   - Botón “Ver detalle” con datos del pedido.

👉 Resultado esperado:
Un frontend moderno, rápido, responsivo y 100% integrado al tema institucional global.

---

## ⚙️ FASE 3 — Panel administrativo (`/admin/store`)

Inspirado en el **backoffice de Shopify** pero adaptado a tu estructura.

### Módulos principales:
1. **Dashboard general:**
   - Estadísticas de ventas, pedidos, productos más vendidos.
   - Gráficas dinámicas con Recharts.

2. **Gestión de productos:**
   - CRUD completo: nombre, descripción, precio, categoría, stock, imagen principal y galería.
   - Soporte para subir imágenes (Cloudinary o Firebase Storage).
   - Filtro y búsqueda de productos.

3. **Categorías / Colecciones:**
   - Crear grupos de productos (Ejemplo: Arcángel Miguel, Amor, Sanación, Prosperidad).
   - Asignación múltiple de productos a categorías.

4. **Pedidos:**
   - Listar pedidos con estado (`pendiente`, `pagado`, `enviado`, `entregado`).
   - Ver detalle de pedido y cliente.
   - Botón “Actualizar estado”.

5. **Clientes:**
   - Ver historial de compras y datos.
   - Filtrar clientes activos, nuevos, frecuentes.

6. **Promociones y cupones:**
   - Crear descuentos por porcentaje o valor fijo.
   - Establecer vigencia (fecha inicio y fin).

7. **Configuración de tienda:**
   - Nombre, logo, descripción, contacto.
   - Configuración de pasarelas de pago (Stripe / MercadoPago).
   - Integración con el sistema global de temas (ThemeContext).
   - Selección de colores, fuentes, textos estáticos y eslogan (“Deja que los ángeles te guíen”).

👉 Resultado esperado:
Un panel administrativo profesional, ordenado, intuitivo y completamente funcional.

---

## 📱 FASE 4 — Responsividad total y experiencia PWA

1. Asegura que `/tienda` y `/admin/store` se adapten perfectamente a móviles y tablets.
2. Usa las clases responsive de Tailwind (`sm:`, `md:`, `lg:`).
3. Activa `manifest.json` y `service worker` para funcionalidad PWA.
4. Optimiza:
   - Menús colapsables en móviles.
   - Navbar fija y accesible.
   - Scroll suave entre secciones.
5. Implementa ícono, splash y nombre corto de la app (“Ángeles”).

---

## 💳 FASE 5 — Optimización de pagos y flujo seguro

1. Asegura comunicación segura con pasarelas:
   - Stripe → `https://api.stripe.com/v1/...`
   - MercadoPago → `https://api.mercadopago.com/...`
2. Configura `webhooks` para confirmar pagos.
3. Muestra mensajes personalizados tras pago exitoso o fallido.
4. Registra transacciones en Prisma (tabla `Order` + `Payment`).

---

## 🎨 FASE 6 — Integración con ThemeContext

1. Asegura que **todas las vistas** de `/tienda` y `/admin/store` adopten el `ThemeContext`.
2. Aplica colores, fuentes, botones y estilos según el tema activo (especialmente “Arcángel Celestial”).
3. Elimina cualquier uso de colores fijos o inyectados inline.
4. Usa componentes `Button`, `Card`, `Badge`, `Modal` ya tematizados.

---

## 🔔 FASE 7 — Notificaciones y fidelización

1. Implementa recordatorios automáticos:
   - Confirmación de pedido.
   - Recordatorio de envío.
   - Mensaje del Arcángel Mentor (si aplica).
2. Sistema de puntos o beneficios para miembros activos.
3. Mensajes espirituales automáticos después de cada compra.

---

## 📊 FASE 8 — Optimización, revisión y documentación

1. Revisa y corrige errores en cada fase antes de avanzar.
2. Mejora tiempos de carga usando `next/image`, `dynamic import()`, y `React.Suspense`.
3. Documenta cada módulo con comentarios técnicos.
4. Genera reporte final con métricas de rendimiento (Lighthouse o Web Vitals).

---

## 🚀 RESULTADO FINAL ESPERADO

Una **Tienda Angelical tipo Shopify**, completamente funcional, profesional y espiritual:

- 🛒 Catálogo, carrito y checkout como en Shopify.
- ⚙️ Panel admin robusto y organizado.
- 🎨 Theme institucional global aplicado.
- 📱 Totalmente responsive (PWA).
- 💳 Pagos seguros con Stripe / MercadoPago.
- 🕊️ Mensajes y recomendaciones angelicales automáticas.

---

## ⚙️ INSTRUCCIONES ADICIONALES PARA COPILOT

- Mantén las rutas actuales (`/tienda`, `/admin/store`).
- No uses emojis en el código.
- Usa comentarios claros y técnicos.
- Refactoriza en fases, revisando y corrigiendo errores en cada paso.
- Prioriza rendimiento, escalabilidad y estética angelical.
