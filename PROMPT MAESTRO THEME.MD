Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Ayúdame a desarrollar un módulo de **personalización de la aplicación** accesible desde el panel de administración. 
Debes dividir el trabajo en fases claras, validar errores al terminar cada fase y optimizar para producción.

---

## Requerimientos principales
- El administrador debe poder cambiar:
  - **Tema visual** con soporte para:
    - LIGHT
    - DARK
    - Prediseñados (ejemplo: "Celestial", "Aurora", "Arcángeles", "Minimal").
  - **Logo de la aplicación** (subir imagen).
  - **Nombre de la app en el navbar** (ej. "Oráculo Angelical" → "Deja que los ángeles te guíen").
  - **Textos estáticos** de distintas páginas (ejemplo: home, footer, secciones informativas).

- Todo debe gestionarse desde el panel de administración en una nueva pestaña llamada **Configuración > Personalización**.

- Los cambios deben reflejarse de inmediato en el frontend (sin necesidad de reiniciar el servidor).

---

## Fase 1: Modelo Prisma
Crear un modelo `AppConfig` en `schema.prisma`:

- `id`: uuid
- `theme`: enum (`LIGHT`, `DARK`, `CELESTIAL`, `AURORA`, `ARCANGELES`, `MINIMAL`, `CUSTOM`)
- `primaryColor`: string? (ej. hex code, usado solo en `CUSTOM`)
- `appName`: string (nombre mostrado en navbar)
- `logoUrl`: string? (path de imagen subida)
- `staticTexts`: Json (diccionario clave/valor para textos estáticos)
- `createdAt`, `updatedAt`

Restricciones:
- Solo debe existir **un registro activo** de `AppConfig`.

---

## Fase 2: API de configuración
- Endpoint `GET /api/config` → devuelve la configuración actual.
- Endpoint `POST /api/config` (solo admin) → permite actualizar tema, logo, appName y textos estáticos.
- Validar roles (solo admin puede modificar).

---

## Fase 3: Panel de administración
- Nueva pestaña en **Configuración > Personalización** con formularios:
  - Selector de tema:
    - Dropdown con opciones LIGHT, DARK, CELESTIAL, AURORA, ARCANGELES, MINIMAL, CUSTOM.
    - Si se selecciona `CUSTOM`, habilitar input de color primario.
  - Campo de texto para `appName`.
  - Subida de imagen para `logo`.
  - Editor de textos estáticos (listado de claves/valores que se pueden modificar).
- Botón “Guardar cambios” → actualiza vía API.

---

## Fase 4: Integración en frontend
- Consumir `GET /api/config` en `_app.tsx` o en un provider global.
- Aplicar:
  - `theme` → mapear a clases Tailwind prediseñadas o ThemeProvider.
  - `primaryColor` solo si el tema es `CUSTOM`.
  - `appName` en el navbar dinámicamente.
  - `logoUrl` en navbar y favicon.
  - `staticTexts` para renderizar contenido dinámico en páginas estáticas.
- Cambios deben reflejarse en tiempo real.

---

## Fase 5: Implementación de temas prediseñados
- Crear un archivo `themes.ts` con los estilos de cada tema:
  - `LIGHT`: fondo blanco, texto negro, acentos azules.
  - `DARK`: fondo gris oscuro, texto claro, acentos morados.
  - `CELESTIAL`: fondo azul profundo, acentos dorados y tipografía elegante.
  - `AURORA`: gradientes verdes/morados, botones brillantes.
  - `ARCANGELES`: tonos pastel, iconografía angelical, tipografía serif.
  - `MINIMAL`: blanco/gris, tipografía sans-serif limpia.
- Mapear el `theme` seleccionado a estas configuraciones.

---

## Fase 6: Validación y testing
- Verificar que solo un registro `AppConfig` esté en uso.
- Probar que los cambios desde admin se reflejen en el frontend.
- Validar subida de archivos (logo) y seguridad.
- Revisar temas prediseñados que carguen correctamente.

---

## Flujo del administrador
1. Entra al panel admin → pestaña **Configuración > Personalización**.
2. Selecciona tema prediseñado o custom.
3. Cambia logo, nombre de app o textos.
4. Guarda cambios → API actualiza `AppConfig`.
5. Frontend refleja la nueva configuración de inmediato.
