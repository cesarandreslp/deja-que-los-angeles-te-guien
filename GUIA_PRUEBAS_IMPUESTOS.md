# 🚀 GUÍA DE PRUEBAS - Sistema de Impuestos

## ✅ ESTADO ACTUAL
- **Errores TypeScript:** 0
- **Archivos Corregidos:** 2
- **Migración de BD:** Completada
- **Componentes:** Creados y listos

---

## 📋 PREPARACIÓN ANTES DE PROBAR

### 1. Asegurar que Prisma está actualizado
```bash
cd C:/Projects/oraculo_loguin
npx prisma generate
```

### 2. Limpiar cache de Next.js
```bash
rm -rf .next
```

### 3. Iniciar el servidor
```bash
npm run dev
```

**Esperar hasta ver:**
```
✓ Ready on http://localhost:3000
```

---

## 🧪 PRUEBAS A REALIZAR

### PRUEBA 1: Configuración de Impuestos (Admin)

#### Paso 1: Acceder al Panel de Admin
```
URL: http://localhost:3000/admin/store/settings
```

#### Paso 2: Verificar valores por defecto
- ✅ Impuestos habilitados: SÍ
- ✅ Tasa de impuesto: 19%
- ✅ Nombre del impuesto: IVA
- ✅ Envío habilitado: SÍ
- ✅ Envío gratis sobre: $50.000 COP
- ✅ Costo envío estándar: $5.000 COP

#### Paso 3: Probar cambios
1. Cambiar tasa de IVA a 16%
2. Guardar
3. Verificar mensaje de éxito
4. Ver actualización en vista previa

**Resultado esperado:**
```
Subtotal: $100.000
IVA (16%): $16.000
Total: $116.000
```

---

### PRUEBA 2: API de Configuración

#### Obtener Configuración
```bash
curl http://localhost:3000/api/store/config
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "taxEnabled": true,
    "defaultTaxRate": 0.19,
    "taxName": "IVA",
    "shippingEnabled": true,
    "freeShippingThreshold": 5000000,
    "standardShippingCents": 500000,
    "currency": "COP",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Actualizar Configuración
```bash
curl -X PUT http://localhost:3000/api/store/config \
  -H "Content-Type: application/json" \
  -d '{
    "taxEnabled": true,
    "defaultTaxRate": 0.16,
    "taxName": "IVA",
    "shippingEnabled": true,
    "freeShippingThreshold": 5000000,
    "standardShippingCents": 500000
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Configuración actualizada exitosamente"
}
```

---

### PRUEBA 3: Carrito con Impuestos

#### Paso 1: Agregar Productos al Carrito
1. Ir a: `http://localhost:3000/tienda/productos`
2. Agregar "Pulsera Gabriel" (2 unidades)
   - Precio unitario: $30.000 COP
   - Cantidad: 2

#### Paso 2: Ver Carrito
```
URL: http://localhost:3000/tienda/carrito
```

**Verificar desglose:**
```
Subtotal (2 productos):    $60.000 COP
IVA (19%):                 $11.400 COP
Envío:                     GRATIS 🎉
─────────────────────────────────────
Total Final:               $71.400 COP
```

#### Paso 3: Verificar Envío Gratis
- ✅ Si subtotal > $50.000 → Envío GRATIS
- ✅ Mostrar mensaje: "🎁 Envío gratis aplicado"

#### Paso 4: Verificar Envío Pagado
1. Reducir cantidad a 1 unidad
2. Subtotal: $30.000 COP
3. Envío: $5.000 COP

**Nuevo total:**
```
Subtotal (1 producto):     $30.000 COP
IVA (19%):                 $5.700 COP
Envío:                     $5.000 COP
─────────────────────────────────────
Total Final:               $40.700 COP
```

---

### PRUEBA 4: API de Cálculo de Checkout

#### Calcular Totales
```bash
curl -X POST http://localhost:3000/api/store/checkout/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "cmglaf76a00003j5p8u1oiy7u",
        "quantity": 2
      }
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "subtotalCents": 6000000,
    "taxCents": 1140000,
    "shippingCents": 0,
    "totalCents": 7140000,
    "taxRate": 0.19,
    "currency": "COP",
    "taxName": "IVA",
    "config": {
      "taxEnabled": true,
      "defaultTaxRate": 0.19,
      "taxName": "IVA",
      "shippingEnabled": true,
      "freeShippingThreshold": 5000000,
      "standardShippingCents": 500000
    },
    "itemsWithTax": [
      {
        "productId": "cmglaf76a00003j5p8u1oiy7u",
        "quantity": 2,
        "priceCents": 3000000,
        "subtotalCents": 6000000,
        "taxCents": 1140000,
        "totalCents": 7140000
      }
    ]
  }
}
```

---

## 🎯 ESCENARIOS DE PRUEBA

### Escenario 1: Compra Pequeña (< $50.000)
```
Producto: 1x Pulsera Gabriel ($30.000)

Subtotal:    $30.000
IVA (19%):   $5.700
Envío:       $5.000
──────────────────────
Total:       $40.700
```

### Escenario 2: Compra Grande (> $50.000)
```
Producto: 2x Pulsera Gabriel ($30.000)

Subtotal:    $60.000
IVA (19%):   $11.400
Envío:       GRATIS 🎉
──────────────────────
Total:       $71.400
```

### Escenario 3: Cambio de Tasa de IVA (16%)
```
Admin cambia IVA a 16%

Subtotal:    $60.000
IVA (16%):   $9.600
Envío:       GRATIS
──────────────────────
Total:       $69.600
```

### Escenario 4: Deshabilitar Impuestos
```
Admin deshabilita impuestos

Subtotal:    $60.000
IVA:         $0
Envío:       GRATIS
──────────────────────
Total:       $60.000
```

---

## 🔍 VERIFICACIONES VISUALES

### En el Carrito:
✅ Muestra "Subtotal"
✅ Muestra "IVA (19%)" con el porcentaje correcto
✅ Muestra "Envío" (Gratis o monto)
✅ Muestra "Total Final" en grande
✅ Indicador de progreso para envío gratis
✅ Información sobre impuestos incluidos

### En Admin Settings:
✅ Toggle switches funcionando
✅ Slider de tasa de impuesto actualiza en vivo
✅ Vista previa muestra cálculos correctos
✅ Botón de guardar muestra feedback
✅ Mensajes de éxito/error claros

---

## ⚠️ POSIBLES PROBLEMAS Y SOLUCIONES

### Problema 1: "Property 'storeConfig' does not exist"
**Solución:**
```bash
npx prisma generate
rm -rf .next
npm run dev
```

### Problema 2: No se crea la configuración automáticamente
**Solución:**
Llamar al endpoint GET una vez:
```bash
curl http://localhost:3000/api/store/config
```

### Problema 3: Cálculos no se actualizan
**Solución:**
1. Verificar que el API responde correctamente
2. Limpiar localStorage del navegador
3. Refrescar la página

### Problema 4: Error 500 en APIs
**Verificar:**
1. Prisma está conectado a la BD
2. La migración se aplicó correctamente:
   ```bash
   npx prisma migrate status
   ```
3. El modelo StoreConfig existe en la BD

---

## 📊 CHECKLIST FINAL

Antes de dar por terminado, verificar:

- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ API `/api/store/config` responde
- [ ] ✅ API `/api/store/checkout/calculate` calcula correctamente
- [ ] ✅ Página admin `/admin/store/settings` carga
- [ ] ✅ Carrito muestra desglose de impuestos
- [ ] ✅ Cambios en admin se reflejan en carrito
- [ ] ✅ Envío gratis funciona correctamente
- [ ] ✅ Cálculos son precisos (sin decimales raros)
- [ ] ✅ Diseño es consistente con el tema
- [ ] ✅ No hay errores en consola del navegador

---

## 📸 CAPTURAS ESPERADAS

### 1. Panel de Admin
![Settings Panel]
- Toggle switches
- Slider de impuestos
- Vista previa de cálculos
- Botón de guardar

### 2. Carrito
![Cart with Taxes]
- Lista de productos
- Desglose de totales
- Indicador de envío gratis
- Botón de checkout

### 3. Cálculo de Totales
```
📋 Resumen del Pedido Angelical

Subtotal (2 productos)    $60.000 COP
💰 IVA (19%)              $11.400 COP
🚚 Envío angelical        GRATIS ✨
────────────────────────────────────
💰 Total Final            $71.400 COP

ℹ️ El IVA (19%) ya está incluido en el total
```

---

## 🎉 ESTADO FINAL ESPERADO

```
✅ Sistema de Impuestos: FUNCIONANDO
✅ Configuración Admin: FUNCIONANDO
✅ Cálculos Automáticos: FUNCIONANDO
✅ Vista de Carrito: ACTUALIZADA
✅ APIs: RESPONDIENDO
✅ Base de Datos: ACTUALIZADA
✅ Types TypeScript: CORREGIDOS
✅ Errores: 0

🚀 SISTEMA LISTO PARA PRODUCCIÓN
```

---

**Fecha de Testing:** 10 de Octubre, 2025
**Última Actualización:** Sistema de Impuestos v1.0.0
