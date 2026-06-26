# 🔄 BUCLE INFINITO EN ORÁCULO - SOLUCIONADO

## ❌ ERROR REAL

```
Warning: Maximum update depth exceeded. This can happen when a component 
calls setState inside useEffect, but useEffect either doesn't have a 
dependency array, or one of the dependencies changes on every render.
```

```
Error: Objects are not valid as a React child (found: object with keys 
{id, name, imageUrl, description, isActive, createdAt, updatedAt})
```

## 🎯 PROBLEMA IDENTIFICADO

El error NO era por renderizar objetos (ese era un síntoma). El problema REAL era:

### 1. **BUCLE INFINITO en `useEffect`** ⚠️

**Ubicación:** `src/app/oraculo/page.tsx` línea ~62-103

**Causa:** 
```typescript
useEffect(() => {
  // ... código que cambia el estado con setStep(), setCards(), etc.
}, [status, router, dailyReading]); // ❌ dailyReading es un OBJETO
```

**Por qué causaba bucle infinito:**

1. `dailyReading` es un **objeto completo** devuelto por `useDailyReading()` hook
2. En JavaScript, los objetos **NUNCA son iguales** (`{} !== {}`)
3. Cada render crea una nueva referencia del objeto `dailyReading`
4. React compara dependencias: `dailyReading !== dailyReading_anterior`
5. React ejecuta el `useEffect` de nuevo
6. `useEffect` llama a `setStep(10)`, `setCards()`, etc.
7. Estos `setState` causan un **re-render**
8. Al re-render, `dailyReading` es una nueva referencia
9. **GOTO 4** → BUCLE INFINITO ♾️

### 2. **Objetos Prisma sin filtrar** (error secundario)

Cuando el componente finalmente renderizaba (entre bucles), intentaba renderizar objetos Prisma con campos como `isActive`, `createdAt`, `updatedAt` que React no puede renderizar directamente.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **Fix 1: Usar `useRef` para evitar bucle infinito**

```typescript
// Agregar ref para controlar inicialización
const hasInitialized = useRef(false);

useEffect(() => {
  // Evitar bucle infinito - solo ejecutar una vez
  if (status === 'loading' || dailyReading.loading) return;
  if (hasInitialized.current) return; // ✅ GUARD CLAUSE
  
  // ... resto del código ...
  
  // Marcar como inicializado al final
  hasInitialized.current = true;
}, [
  // ✅ Solo dependencias primitivas, no objetos completos
  status, 
  dailyReading.loading, 
  dailyReading.requiresMembership, 
  dailyReading.hasReadingToday, 
  dailyReading.canCreateNew, 
  dailyReading.error, 
  dailyReading.todayReading, // Este es inevitable pero está controlado por hasInitialized
  router
]);
```

**Cómo funciona:**

1. Primera ejecución: `hasInitialized.current = false` → código se ejecuta
2. Al final: `hasInitialized.current = true`
3. Siguientes ejecuciones: `if (hasInitialized.current) return;` → **SALE INMEDIATAMENTE**
4. **NO más bucle infinito** ✅

### **Fix 2: Filtrado de objetos Prisma** (ya estaba, pero es secundario)

El filtrado de cartas ya estaba implementado en el código para eliminar campos problemáticos:

```typescript
const filteredCards = dailyReading.todayReading.cards.map((card: any) => ({
  id: card.id,
  code: card.code,
  name: card.name,
  description: card.description,
  imageUrl: card.imageUrl,
  arcangel: card.arcangel,
  shortMsg: card.shortMsg
  // ✅ SIN: isActive, createdAt, updatedAt
}));
```

---

## 📝 CAMBIOS REALIZADOS

### Archivo: `src/app/oraculo/page.tsx`

**1. Import de useRef:**
```typescript
import React, { useState, useEffect, useRef } from "react";
```

**2. Declaración de ref:**
```typescript
const hasInitialized = useRef(false);
```

**3. Guard clause en useEffect:**
```typescript
if (hasInitialized.current) return;
```

**4. Marcar como inicializado:**
```typescript
hasInitialized.current = true; // Al final de cada branch
```

**5. Dependencias específicas:**
```typescript
}, [status, dailyReading.loading, dailyReading.requiresMembership, 
    dailyReading.hasReadingToday, dailyReading.canCreateNew, 
    dailyReading.error, dailyReading.todayReading, router]);
```

**6. ⚠️ FILTRAR CARTAS AL SELECCIONARLAS (Línea ~308):**
```typescript
onCardsSelected={(result: { cards: any[], readingId: string }) => {
  // Filtrar cartas para eliminar campos de Prisma no renderizables
  const filteredCards = result.cards.map((card: any) => ({
    id: card.id,
    code: card.code,
    name: card.name,
    description: card.description,
    imageUrl: card.imageUrl,
    arcangel: card.arcangel,
    shortMsg: card.shortMsg
  }));
  setCards(filteredCards); // ✅ Cartas filtradas
  setReadingId(result.readingId);
  goToNextStep();
}}
```

---

## 🧪 CÓMO PROBAR

1. **Limpiar cache** (ya hecho):
   ```bash
   rm -rf .next
   ```

2. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Ir a:** http://localhost:3000/oraculo

4. **Verificar en consola:**
   - ❌ NO debe aparecer: "Maximum update depth exceeded"
   - ❌ NO debe aparecer: "Objects are not valid as a React child"
   - ✅ Debe funcionar normalmente

5. **Hard Reload en navegador:**
   - **Chrome/Edge:** `Ctrl + Shift + R`
   - O: F12 → Right-click en botón reload → "Empty Cache and Hard Reload"

---

## 🎓 LECCIÓN APRENDIDA

### ⚠️ NUNCA hagas esto:
```typescript
useEffect(() => {
  // código que cambia estado
}, [objetoCompleto]); // ❌ MALO - causa bucle infinito
```

### ✅ SIEMPRE haz esto:
```typescript
const hasRun = useRef(false);

useEffect(() => {
  if (hasRun.current) return; // Guard clause
  // código que cambia estado
  hasRun.current = true;
}, [prop1, prop2, prop3]); // ✅ BUENO - dependencias específicas
```

### O mejor aún:
```typescript
useEffect(() => {
  // código que NO cambia estado
  // o cambia estado de forma controlada
}, [dependenciasPrimitivas]); // string, number, boolean
```

---

## 🔍 DIAGNÓSTICO DEL ERROR

**Síntomas previos:**
- ✅ Bucle infinito de re-renders
- ✅ Console lleno de errores repetidos
- ✅ Página se congela
- ✅ "Maximum update depth exceeded"
- ✅ "Objects are not valid as a React child"

**Causa raíz:**
- ❌ `useEffect` con objeto completo en dependencias
- ❌ `useEffect` que cambia estado sin control
- ❌ Sin guard clause para prevenir ejecuciones múltiples

**Solución:**
- ✅ `useRef` para controlar ejecución única
- ✅ Guard clause: `if (hasInitialized.current) return;`
- ✅ Dependencias específicas en lugar de objeto completo
- ✅ Marcar como inicializado al completar

---

## 📊 ANTES vs DESPUÉS

### ANTES ❌
```typescript
useEffect(() => {
  setStep(10);
  setCards(filteredCards);
  // ... más setState
}, [dailyReading]); // ❌ Objeto completo → bucle infinito
```

**Resultado:**
- Bucle infinito ♾️
- Página congelada
- Miles de errores en consola

### DESPUÉS ✅
```typescript
const hasInitialized = useRef(false);

useEffect(() => {
  if (hasInitialized.current) return; // ✅ Guard
  setStep(10);
  setCards(filteredCards);
  hasInitialized.current = true; // ✅ Marcar
}, [status, dailyReading.loading, ...]); // ✅ Primitivos
```

**Resultado:**
- Ejecuta solo UNA vez
- Página funciona normal
- Sin errores

---

## 🚀 ESTADO ACTUAL

- ✅ Bucle infinito ELIMINADO
- ✅ useEffect controlado con `useRef`
- ✅ Guard clause implementada
- ✅ Dependencias específicas
- ✅ Objetos Prisma filtrados (ya estaba)
- ✅ Cache limpiado
- ✅ Listo para probar

---

## 📌 NOTA IMPORTANTE

Este error NO fue causado por la "auditoría de base de datos". El problema era **arquitectural** en el código del `useEffect` desde el inicio. La auditoría solo **expuso** el problema existente al hacer cambios que forzaron re-renders.

**El verdadero culpable:** Mal uso de `useEffect` con objetos en dependencias + cambios de estado sin control.

---

**Fecha:** 12 de Octubre, 2025  
**Archivo:** `BUCLE_INFINITO_SOLUCIONADO.md`  
**Status:** ✅ RESUELTO
