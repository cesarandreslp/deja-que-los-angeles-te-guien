Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL), Node.js y Tailwind. 
Debes ayudarme a crear un sistema de **paneles** para los diferentes roles de mi aplicación del Oráculo de los Arcángeles. 
Los paneles son: **Administrador**, **Consultor** y **Usuario**. 
Debes dividir el trabajo en fases, validar errores al final de cada fase, y optimizar el código para producción.

---

## Roles del sistema
- **Administrador (ADMIN):**
  - Acceso total a estadísticas, configuraciones y gestión de módulos.
- **Consultor (CONSULTANT):**
  - Acceso a agenda, estadísticas propias y comisiones.
- **Usuario (USER):**
  - Acceso a perfil, citas, compras y estadísticas personales.

---

## Panel de Administrador
1. **Dashboard de estadísticas globales**
   - Usuarios registrados.
   - Lecturas realizadas (1, 3 y 9 cartas).
   - Video consultas agendadas, atendidas, reprogramadas, no atendidas.
   - Ventas de la tienda (totales, por producto, ingresos).
   - Comisiones pagadas a consultores.

2. **Módulo de Oráculo**
   - Subir nuevas cartas (imagen + texto).
   - Editar cartas existentes.
   - Eliminar cartas.
   - Subir o editar imágenes de arcángeles para el chat.

3. **Módulo de Video Consultas**
   - Ver todas las consultas (agendadas, atendidas, rechazadas, reprogramadas).
   - Filtrar por consultor, fecha, estado.
   - Crear consultores (asignar rol `CONSULTANT` a usuarios).
   - Asignar o reasignar consultas manualmente si es necesario.

4. **Módulo de Tienda**
   - Subir nuevos productos (nombre, descripción, precio, stock, imágenes).
   - Editar productos existentes.
   - Eliminar productos.
   - Estadísticas de la tienda (ventas por categoría, producto más vendido, ingresos mensuales).

5. **Módulo de Configuración**
   - Subir, editar y eliminar credenciales de APIs:
     - Zhipu (IA)
     - Neon (PostgreSQL)
     - Vercel (deploy y hosting)
     - Mercado Pago (pagos Colombia)
     - Stripe (pagos internacionales)
     - Otras claves necesarias (ej. SMTP/email, JWT secret).
   - Guardar estas configuraciones en un modelo seguro (`Config`).

---

## Panel de Consultor
1. **Agenda**
   - Ver todas sus citas (pendientes, atendidas, reprogramadas).
   - Ver link de videollamada generado.
   - Confirmar asistencia a una consulta.

2. **Estadísticas del consultor**
   - Total de consultas atendidas.
   - Consultas reprogramadas o no atendidas.
   - Valor de sus consultas atendidas.
   - Calificaciones de usuarios (si se implementan).

3. **Comisiones**
   - Ver comisiones acumuladas.
   - Historial de pagos de comisiones.

---

## Panel de Usuario
1. **Perfil**
   - Ver y editar nombre, país, sexo, foto de perfil.
   - Cambiar contraseña (si es usuario clásico).
   - Completar datos si entró con Google.

2. **Citas**
   - Ver citas agendadas, reprogramadas, atendidas.
   - Acceder a link de videollamada en el horario correspondiente.
   - Ver historial de consultas.

3. **Membresía**
   - Ver estado de la membresía (ej. mensual, anual).
   - Renovar o cancelar membresía.
   - Ver beneficios activos.

4. **Tienda**
   - Ver pedidos realizados.
   - Estado de pedidos (pendiente, pagado, enviado).
   - Descargar facturas.

5. **Estadísticas personales**
   - Número de lecturas realizadas.
   - Consultas atendidas.
   - Productos comprados.

---

## Fases del desarrollo

### Fase 1: Modelos en Prisma
- `Config`: id, key, value, createdAt, updatedAt.
- Ampliar `User` con rol (`USER`, `CONSULTANT`, `ADMIN`).
- `Commission`: id, consultorId, amountCents, status, createdAt.
- Validar relaciones con `VideoConsultation`, `Order`, `Product`.

### Fase 2: API de estadísticas
- Endpoints para administrador (`/api/admin/stats`) que consoliden datos de todos los módulos.
- Endpoints para consultor (`/api/consultant/stats`) que muestren estadísticas personales.
- Endpoints para usuario (`/api/user/stats`).

### Fase 3: APIs de gestión
- Oráculo: CRUD de cartas y arcángeles.
- Video consultas: listado, asignación, filtrado.
- Tienda: CRUD de productos, estadísticas de ventas.
- Configuración: CRUD de claves de APIs.
- Consultores: asignar rol a usuarios.

### Fase 4: Frontend — Panel de Administrador
- Dashboard principal con gráficos (ej. recharts).
- Módulos de oráculo, consultas, tienda y configuración.
- Tablas con paginación, búsqueda y filtros.

### Fase 5: Frontend — Panel de Consultor
- Agenda con calendario.
- Dashboard de estadísticas personales.
- Sección de comisiones.

### Fase 6: Frontend — Panel de Usuario
- Perfil editable.
- Citas y membresías.
- Historial de tienda.
- Estadísticas personales.

### Fase 7: Seguridad y roles
- Middleware para validar el rol en cada panel.
- Solo `ADMIN` accede al panel de administración.
- Solo `CONSULTANT` accede al panel de consultor.
- `USER` accede al panel de usuario.
- Auditoría de cambios importantes (opcional).

### Fase 8: Testing
- Probar flujos de cada panel.
- Validar seguridad y acceso según rol.
- Corregir errores antes de pasar a producción.

---

## Tu tarea
- Implementar cada fase paso a paso.
- Validar errores antes de avanzar.
- Optimizar rendimiento y seguridad.
- Garantizar que cada panel cumpla con las operaciones permitidas según el rol.
