⚙️ PROMPT MAESTRO — Auditoría y Optimización Global del Proyecto “Deja que los ángeles te guíen”
Asume el papel de un **ingeniero senior full stack especializado en optimización de rendimiento y estabilidad en aplicaciones PWA con arquitectura moderna**.

Tu tarea es **revisar, optimizar, depurar y estabilizar completamente** la aplicación web progresiva (PWA) llamada **“Deja que los ángeles te guíen”**, desarrollada en:

- Next.js (Frontend)
- TypeScript
- Prisma + Neon/PostgreSQL (Base de datos)
- Node.js (Backend)
- Zhipu AI 4.5 (Agente de interpretación)
- TailwindCSS (Estilos)
- Firebase (Notificaciones PWA)
- Integraciones de pago (MercadoPago / Stripe)

---

## 🎯 OBJETIVO GLOBAL

Garantizar que toda la aplicación:

1. Funcione de manera **estable y fluida** en todas las plataformas (web y móvil).  
2. Mantenga **conexiones seguras y persistentes** con Neon y Zhipu AI.  
3. **Aplique correctamente el theme institucional global** en todas las páginas.  
4. Tenga **diseño responsive optimizado para móviles y tablets**.  
5. Mejore tiempos de carga, renderizado y respuestas del servidor.  
6. Cumpla estándares de **rendimiento, accesibilidad y consistencia visual.**

---

## 🧩 FASE 1 — Diagnóstico y revisión estructural

1. Analiza toda la arquitectura de carpetas y archivos.
2. Identifica dependencias innecesarias o desactualizadas.
3. Revisa el uso de imports, hooks, contextos y rutas dinámicas.
4. Verifica la configuración de:
   - Prisma (`schema.prisma`)
   - Variables de entorno `.env`
   - Conexión con Neon (pooling, SSL, conexión persistente)
   - Configuración de Zhipu AI (timeout, reconexión automática)
5. Detecta posibles fugas de memoria o bloqueos de recursos.

👉 **Acción esperada:**  
Proporciona una lista de los hallazgos con su nivel de prioridad (ALTO / MEDIO / BAJO).

---

## ⚙️ FASE 2 — Optimización de la conexión con la base de datos (Neon / Prisma / PostgreSQL)

1. Implementa **pooling de conexiones** estable usando:
   ```ts
   import { PrismaClient } from "@prisma/client";
   const prisma = new PrismaClient({
     log: ['error', 'warn'],
     datasources: { db: { url: process.env.DATABASE_URL } }
   });


Verifica que:

Se utiliza la variable DATABASE_URLcon el formato correcto de Neon.

Haya reconexión automática ante fallas del servidor.

Las operaciones asincrónicas están correctamente await.

Revisa los índices, claves foráneas y consultas costosas en Prisma.

Asegura que el backend maneje correctamente las desconexiones con un sistema de reintento backoff .

👉 Resultado esperado:
Una conexión estable, sin interrupciones esporádicas y con registros de error claros.

🤖 FASE 3 — Estabilización y mejora de la integración con Zhipu AI

Verifica las llamadas al endpoint de Zhipu 4.5.

Asegura:

Que las peticiones se hagan mediante async/awaitcon control de tiempo de espera.

Que haya manejo de errores ( try/catch) y reintentos automáticos (3 veces máximo).

Que las respuestas largas se procesan sin bloquear el hilo principal.

Implementa colas de mensajes si hay saturación de peticiones concurrentes.

👉 Resultado esperado:
Una integración fluida, sin errores de desconexión ni saturación de peticiones.

🎨 FASE 4 — Revisión y aplicación del tema institucional

Confirma que todas las páginas y componentes usan el sistema de temas global ( ThemeContexty themes.ts).

Corrige:

Páginas o módulos que no adoptan el color o tipografía definidos.

Componentes que aplican colores “codificados”.

Inconsistencias de márgenes, paddings y tipografías.

Valida que el logo y nombre “Deja que los ángeles te guían” aparezcan en:

Barra de navegación

Pie de página

Página de inicio

Panel administrativo

👉 Resultado esperado:
Una interfaz visualmente coherente, profesional, sin elementos fuera del estilo institucional.

📱 FASE 5 — Adaptación responsive y experiencia móvil (PWA)

Usa utilidades receptivas TailwindCSS ( sm,,, ) en todos los diseños principales md.lgxl

Corrige:

Desbordamientos de contenido en pantallas pequeñas.

Botones o entradas que no escalan correctamente.

Textos o tarjetas que se cortan o se salen del viewport.

Optimice la estructura para modo vertical y horizontal .

Asegúrese de que el manifest.json y el service trabajador estén configurados correctamente para su uso como PWA.

Valida el ícono, splash y nombre corto de la aplicación en móvil.

👉 Resultado esperado:
Una PWA completamente adaptativa, ligera y fluida en Android, iOS y navegadores móviles.

⚡ FASE 6 — Rendimiento y carga optimizada

Implementa next/imagepara optimizar todas las imágenes.

Revisa y aplica:

Carga diferida de componentes pesados.

Divisiones de código.

Almacenamiento previo en caché de activos esenciales.

Compresión Brotli o Gzip en el servidor.

Reduce el tamaño de los paquetes y mejora el TTFB (Time To First Byte).

Usa Lighthouse y analiza métricas (CLS, LCP, TBT, FID).

👉 Resultado esperado:
Una carga rápida (LCP < 2.5s, CLS < 0.1) y una experiencia fluida en dispositivos de baja potencia.

🔒 FASE 7 — Auditoría de seguridad y buenas prácticas

Verifica variables de entorno y claves API no expuestas.

Revisa los encabezados HTTP y la configuración HTTPS.

Asegura que los JWTs y tokens de autenticación caduquen correctamente.

Comprueba la correcta sanitización de datos del usuario.

🧾 FASE 8 — Documentación y entrega

Genera un informe técnico resumen con:

Cambios aplicados

Problemas solucionados

Recomendaciones futuras

Documenta las funciones clave ( theme, conexión, Zhipu, PWA) con comentarios claros.

Sube los cambios optimizados a una rama segura ( /optimizacion-global).

🚀 Resultado final esperado

Una aplicación web moderna, espiritual, estable y optimizada, que:

Mantiene conexión persistente con Neon y Zhipu.

Carga rápido, sin bloqueos.

Es completamente responsivo.

Refleja el tema institucional global de forma consistente.

Cumplidos estándares de diseño, accesibilidad y seguridad profesional.

⚙️ Instrucciones adicionales para Copilot

Revisa y corrige una fase a la vez , confirmando que no haya errores antes de avanzar.

No hay géneros emojis.

Documenta los cambios con comentarios breves y técnicos.

Priorice la estabilidad, el rendimiento y la consistencia visual.