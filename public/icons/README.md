# Iconos PWA - Guía de Implementación

## 📱 **Iconos Requeridos para PWA**

Para que la PWA funcione correctamente, necesitas crear estos iconos:

### **Iconos Principales:**
- `icon-72x72.png` - Para Android Chrome
- `icon-96x96.png` - Para Android Chrome
- `icon-128x128.png` - Para Android Chrome
- `icon-144x144.png` - Para Android Chrome
- `icon-152x152.png` - Para iOS Safari
- `icon-192x192.png` - Para Android Chrome (requerido para PWA)
- `icon-384x384.png` - Para Android Chrome
- `icon-512x512.png` - Para Android Chrome (requerido para PWA)

### **Iconos Adicionales:**
- `badge-72x72.png` - Para notificaciones de badge
- `shortcut-consultation.png` (96x96) - Para acceso directo a consultas
- `shortcut-oracle.png` (96x96) - Para acceso directo al oráculo
- `shortcut-dashboard.png` (96x96) - Para acceso directo al dashboard

### **Características del Diseño:**
1. **Tema:** Espiritual/angelical con colores dorados y azules
2. **Estilo:** Moderno, limpio, fácil de reconocer
3. **Contenido:** Símbolo angelical, alas, aureola, o símbolo místico
4. **Formato:** PNG con transparencia
5. **Colores sugeridos:** 
   - Dorado: #FFD700
   - Azul profundo: #1a1a2e
   - Azul índigo: #6366f1
   - Blanco: #FFFFFF

## 🎨 **Crear Iconos Temporales**

Mientras no tengas iconos personalizados, puedes usar estos comandos para crear iconos básicos:

### Para Windows (usando ImageMagick si está instalado):
```bash
# Crear icono básico de 192x192
magick -size 192x192 xc:"#6366f1" -fill white -pointsize 120 -gravity center -annotate 0 "🔮" icon-192x192.png

# Crear icono básico de 512x512  
magick -size 512x512 xc:"#6366f1" -fill white -pointsize 300 -gravity center -annotate 0 "🔮" icon-512x512.png
```

### O usar herramientas online:
1. **Favicon.io** - https://favicon.io/favicon-generator/
2. **PWA Builder** - https://www.pwabuilder.com/imageGenerator
3. **Canva** - Para diseño personalizado

## 📋 **Lista de Verificación:**

- [ ] Crear todos los iconos requeridos
- [ ] Colocar iconos en `/public/icons/`
- [ ] Verificar que el manifest.json apunte a los iconos correctos
- [ ] Probar la instalación PWA en dispositivo móvil
- [ ] Verificar que las notificaciones funcionen

## 💡 **Nota Importante:**

Los iconos son **requeridos** para que la PWA se pueda instalar correctamente. Sin ellos, el navegador no mostrará la opción "Agregar a pantalla de inicio".