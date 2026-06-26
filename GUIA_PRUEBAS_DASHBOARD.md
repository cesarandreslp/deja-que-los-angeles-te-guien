# 🧪 Guía de Pruebas - Dashboard de Usuario

## 🚀 Cómo Probar las Mejoras

### **Paso 1: Verificar Compilación** ✅

```bash
# Verificar que no hay errores de compilación
npm run build

# O ejecutar en modo desarrollo
npm run dev
```

**Resultado esperado:** Compilación exitosa sin errores

---

### **Paso 2: Iniciar Sesión**

1. Navega a: `http://localhost:3000/login`
2. Inicia sesión con credenciales de usuario (rol: USER)
3. Serás redirigido a: `http://localhost:3000/user`

---

### **Paso 3: Observar el Loading State** ⏳

**Qué ver:**
- ✅ Skeleton loader con placeholders animados
- ✅ Banner placeholder con efecto pulse
- ✅ 4 cards de skeleton

**Duración:** 1-2 segundos

---

### **Paso 4: Welcome Banner** 🎊

**Qué verificar:**
- ✅ Saludo personalizado según hora:
  - 00:00 - 11:59 → "Buenos días"
  - 12:00 - 18:59 → "Buenas tardes"
  - 19:00 - 23:59 → "Buenas noches"
- ✅ Gradiente según membresía:
  - Básico → Azul/Morado/Rosa
  - Premium → Morado/Rosa/Rojo
  - VIP → Amarillo/Naranja/Rojo
- ✅ Badge de membresía visible
- ✅ Estrellas flotantes animadas
- ✅ Efecto de brillo (shine)

**Acciones:**
- Hover sobre el banner → Ver animación
- Click en "Nueva Lectura" → Ir al oráculo
- Click en "Agendar Consulta" → Ir a book-consultation

---

### **Paso 5: Stats Cards Animadas** 💫

**Qué verificar:**

#### **Card 1: Lecturas** (Morado)
- ✅ Contador anima desde 0 hasta valor real
- ✅ Icono de ojo (EyeIcon)
- ✅ Descripción: "Total de lecturas realizadas"
- ✅ Barra de progreso se llena al final

#### **Card 2: Consultas** (Azul)
- ✅ Contador anima desde 0
- ✅ Icono de teléfono (PhoneIcon)
- ✅ Descripción: "X completadas"
- ✅ Delay de 0.1s en animación

#### **Card 3: Compras** (Verde)
- ✅ Contador anima desde 0
- ✅ Icono de bolsa (ShoppingBagIcon)
- ✅ Descripción muestra total gastado en $
- ✅ Delay de 0.2s en animación

#### **Card 4: Puntos** (Dorado) - NUEVO ⭐
- ✅ Contador anima desde 0
- ✅ Icono de estrella (StarIcon)
- ✅ Sufijo " pts" después del número
- ✅ Delay de 0.3s en animación
- ✅ Cálculo: `lecturas×10 + consultas×50 + compras×25`

**Interacción:**
- Hover sobre cards → Escala 1.05 + Rotación 3°
- Scroll hacia abajo y volver → Animaciones se ejecutan solo 1 vez

---

### **Paso 6: Membresía Activa** 👑

**Si tienes membresía activa:**
- ✅ GradientCard dorada visible
- ✅ Icono de corona (👑)
- ✅ Título: "Membresía Activa"
- ✅ Valor: Tipo de membresía (Premium/VIP/Básica)
- ✅ Badge con fecha de expiración
- ✅ Hover → Escala y levitación

**Si NO tienes membresía:**
- Esta sección no se muestra

---

### **Paso 7: Analytics Dashboard** 📊

**Verificar 3 gráficos:**

#### **1. Lecturas del Oráculo** (Línea)
- ✅ Título: "Lecturas del Oráculo"
- ✅ Punto morado antes del título
- ✅ Eje X: Ene, Feb, Mar, Abr
- ✅ Eje Y: Números
- ✅ Línea morada con puntos
- ✅ Hover sobre puntos → Tooltip personalizado

#### **2. Consultas Realizadas** (Barras)
- ✅ Título: "Consultas Realizadas"
- ✅ Punto verde antes del título
- ✅ Barras verdes con esquinas redondeadas
- ✅ Altura de barras proporcional a datos
- ✅ Hover sobre barras → Tooltip

#### **3. Distribución de Gastos** (Circular)
- ✅ Título: "Distribución de Gastos"
- ✅ Punto naranja antes del título
- ✅ 3 secciones:
  - Consultas (Azul)
  - Tienda (Verde)
  - Membresía (Naranja)
- ✅ Porcentajes en etiquetas
- ✅ Leyenda abajo del gráfico
- ✅ Cards de resumen con totales en $

**Interacción:**
- Hover sobre gráficos → Ver datos detallados
- Los colores deben coincidir con el theme actual

---

### **Paso 8: Progreso Espiritual** 🎯

**Si tienes membresía:**
- ✅ Sección visible con título: "🎯 Tu Progreso Espiritual"
- ✅ 3 barras de progreso:

#### **Barra 1: Lecturas del Oráculo**
- Color: Accent del theme
- Max: 50
- Porcentaje calculado automáticamente
- Animación de llenado (1 segundo)

#### **Barra 2: Consultas Completadas**
- Color: Verde (#10b981)
- Max: 10
- Muestra progreso: "X / 10"

#### **Barra 3: Productos Adquiridos**
- Color: Naranja (#f59e0b)
- Max: 20
- Muestra progreso: "X / 20"

**Si NO tienes membresía:**
- Esta sección no se muestra

---

### **Paso 9: Actividad Reciente** 📝

**Qué verificar:**
- ✅ Título: "📝 Actividad Reciente"
- ✅ Emoji grande de bola de cristal (🔮)
- ✅ Título: "No hay actividad reciente"
- ✅ Descripción motivadora
- ✅ Botón: "Consultar Oráculo"
- ✅ Botón con animaciones:
  - Hover → Escala 1.05 + Sube 2px
  - Click → Escala 0.95
  - Click → Navega a /oraculo

---

### **Paso 10: Responsive Testing** 📱

**Probar en diferentes tamaños:**

#### **Mobile (< 640px)**
- Grid de stats: 1 columna
- Welcome banner: Stack vertical
- Gráficos: Ancho completo, uno debajo del otro

#### **Tablet (640px - 1024px)**
- Grid de stats: 2 columnas
- Gráficos: 1 por fila
- Espaciado intermedio

#### **Desktop (> 1024px)**
- Grid de stats: 4 columnas
- Gráficos: 2 por fila (línea y barras)
- Gráfico circular: Ancho completo
- Espaciado amplio

**Herramientas:**
- Chrome DevTools → Device toolbar (Ctrl + Shift + M)
- Probar: iPhone 12, iPad, Desktop 1920px

---

### **Paso 11: Theme Testing** 🎨

**Cambiar de theme:**
1. Ir a Settings o Theme Selector
2. Cambiar entre themes disponibles
3. Verificar que:
   - ✅ Colores de fondo se actualizan
   - ✅ Textos son legibles
   - ✅ Bordes son visibles
   - ✅ Gradientes se mantienen
   - ✅ Iconos contrastan bien

---

### **Paso 12: Performance Testing** ⚡

**Verificar rendimiento:**

#### **Chrome DevTools → Performance**
1. Iniciar grabación
2. Recargar página
3. Esperar carga completa
4. Detener grabación

**Métricas esperadas:**
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- FPS durante animaciones: ~60 FPS
- No hay "Long Tasks" > 50ms

#### **Network Tab**
- Tamaño total de página: < 2MB
- Recharts bundle: ~50KB
- Framer Motion bundle: ~30KB

---

### **Paso 13: Accessibility Testing** ♿

**Verificar accesibilidad:**

#### **Keyboard Navigation**
- Tab → Navega entre botones
- Enter → Activa botones
- Escape → Cierra modales (si aplica)

#### **Screen Reader**
- Instalar NVDA (Windows) o VoiceOver (Mac)
- Activar screen reader
- Verificar que se leen:
  - Títulos de secciones
  - Valores de stats
  - Botones y links
  - Descripciones de gráficos

#### **Contrast Checker**
- Usar herramienta: https://webaim.org/resources/contrastchecker/
- Verificar ratios:
  - Texto normal: >= 4.5:1
  - Texto grande: >= 3:1
  - UI elements: >= 3:1

---

### **Paso 14: Edge Cases** 🔍

**Casos especiales a probar:**

#### **Usuario sin datos**
- Todas las stats en 0
- Gráficos muestran líneas/barras vacías
- Sistema de puntos: 0 pts
- Barras de progreso: 0%

#### **Usuario con muchos datos**
- Stats > 999 → Usar separador de miles
- Gráficos con valores altos
- Puntos > 10,000

#### **Sin membresía**
- Sección de membresía NO visible
- Sección de progreso NO visible
- Badge de membresía: "Básico" en welcome banner

#### **Membresía VIP**
- Welcome banner dorado
- Badge "VIP"
- Icono de corona (👑)

---

### **Paso 15: Console Errors** 🐛

**Abrir Console (F12):**
- ✅ NO debe haber errores rojos
- ⚠️ Warnings permitidos (si los hay, documentar)
- ℹ️ Info messages son normales

**Errores comunes a revisar:**
- ❌ "Cannot read property of undefined"
- ❌ "Hydration mismatch"
- ❌ "Key prop missing"
- ❌ "Memory leak detected"

---

## ✅ **CHECKLIST COMPLETO**

```
Dashboard Loading:
  [x] Skeleton loader aparece
  [x] Transición suave a contenido real

Welcome Banner:
  [x] Saludo correcto según hora
  [x] Gradiente según membresía
  [x] Badge visible
  [x] Animaciones funcionan
  [x] Botones navegan correctamente

Stats Cards:
  [x] 4 cards visibles
  [x] Contadores animan desde 0
  [x] Delays escalonados (0, 0.1, 0.2, 0.3s)
  [x] Iconos correctos
  [x] Hover effects funcionan
  [x] Sistema de puntos calcula bien

Membresía (si activa):
  [x] GradientCard visible
  [x] Badge con fecha
  [x] Hover effect funciona

Analytics:
  [x] 3 gráficos se muestran
  [x] Datos se renderizan correctamente
  [x] Tooltips funcionan
  [x] Colores según theme
  [x] Cards de resumen muestran totales

Progreso (si membresía):
  [x] 3 barras de progreso
  [x] Animaciones de llenado
  [x] Porcentajes correctos
  [x] Colores distintivos

Actividad Reciente:
  [x] EmptyState visible
  [x] Botón navega al oráculo
  [x] Animaciones hover/tap

Responsive:
  [x] Mobile: 1 columna
  [x] Tablet: 2 columnas
  [x] Desktop: 4 columnas
  [x] Sin overflow horizontal

Theme:
  [x] Cambia colores al cambiar theme
  [x] Texto legible en todos los themes
  [x] Gradientes se mantienen

Performance:
  [x] FPS >= 60 durante animaciones
  [x] Sin re-renders innecesarios
  [x] Lazy loading activo

Accesibilidad:
  [x] Navegación con teclado
  [x] Screen reader compatible
  [x] Contraste adecuado

Edge Cases:
  [x] Usuario sin datos (0)
  [x] Usuario con muchos datos
  [x] Sin membresía
  [x] Membresía VIP

Console:
  [x] Sin errores rojos
  [x] Build exitoso
```

---

## 🎉 **¡Testing Completado!**

Si todos los checks están ✅, el dashboard está listo para producción.

**Próximo paso:**
- 📸 Tomar screenshots para documentación
- 📹 Grabar video demo (opcional)
- 🚀 Deploy a staging/producción
- 📊 Monitorear métricas reales de usuarios

---

**Versión:** 2.0.0  
**Última actualización:** ${new Date().toLocaleDateString('es-ES')}  
**Status:** ✅ **FASE 1 LISTA PARA TESTING**
