/**
 * Script para generar iconos PWA básicos
 * Crea iconos de diferentes tamaños usando SVG y Canvas
 */

const fs = require('fs')
const path = require('path')

// SVG base del logo angelical
const logoSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="angelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5FBF;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo circular -->
  <circle cx="256" cy="256" r="240" fill="url(#angelGradient)" stroke="#fff" stroke-width="8"/>
  
  <!-- Alas angelicales -->
  <g transform="translate(256,256)">
    <!-- Ala izquierda -->
    <path d="M-80,-60 C-120,-40 -140,-10 -140,20 C-140,50 -120,80 -80,100 C-60,80 -50,50 -50,20 C-50,-10 -60,-40 -80,-60 Z" 
          fill="white" opacity="0.9"/>
    
    <!-- Ala derecha -->
    <path d="M80,-60 C120,-40 140,-10 140,20 C140,50 120,80 80,100 C60,80 50,50 50,20 C50,-10 60,-40 80,-60 Z" 
          fill="white" opacity="0.9"/>
    
    <!-- Cuerpo del ángel -->
    <ellipse cx="0" cy="20" rx="25" ry="80" fill="white" opacity="0.8"/>
    
    <!-- Cabeza -->
    <circle cx="0" cy="-40" r="20" fill="white" opacity="0.9"/>
    
    <!-- Halo -->
    <circle cx="0" cy="-60" r="15" fill="none" stroke="gold" stroke-width="3" opacity="0.8"/>
    
    <!-- Detalles de luz -->
    <circle cx="-20" cy="-30" r="3" fill="gold" opacity="0.6"/>
    <circle cx="20" cy="-30" r="3" fill="gold" opacity="0.6"/>
    <circle cx="0" cy="0" r="4" fill="gold" opacity="0.7"/>
  </g>
  
  <!-- Texto inferior -->
  <text x="256" y="420" text-anchor="middle" font-family="serif" font-size="24" fill="white" font-weight="bold">
    ORÁCULO
  </text>
</svg>
`

// Función para crear archivo SVG
function createSVGIcon(size, filename) {
  const scaledSVG = logoSVG.replace('width="512" height="512"', `width="${size}" height="${size}"`)
  const iconPath = path.join(__dirname, '..', 'public', 'icons', filename)
  
  // Por ahora creamos un archivo SVG simple que se puede usar como fallback
  const simpleSVG = `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5FBF"/>
      <stop offset="100%" style="stop-color:#667eea"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g1)" rx="50"/>
  <text x="256" y="280" text-anchor="middle" font-family="serif" font-size="120" fill="white" font-weight="bold">Ω</text>
</svg>`
  
  fs.writeFileSync(iconPath, simpleSVG)
  console.log(`✅ Created SVG icon: ${filename}`)
}

// Crear iconos SVG para diferentes tamaños
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

console.log('🎨 Generando iconos PWA...')

sizes.forEach(size => {
  createSVGIcon(size, `icon-${size}x${size}.svg`)
})

// Crear versiones PNG básicas (placeholder)
sizes.forEach(size => {
  const pngContent = `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5FBF"/>
      <stop offset="100%" style="stop-color:#667eea"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad${size})" rx="50"/>
  <g transform="translate(256,256)">
    <circle cx="0" cy="-50" r="30" fill="white" opacity="0.9"/>
    <ellipse cx="0" cy="0" rx="40" ry="80" fill="white" opacity="0.8"/>
    <path d="M-60,-30 C-80,-20 -80,0 -60,10 L-40,0 Z" fill="white" opacity="0.7"/>
    <path d="M60,-30 C80,-20 80,0 60,10 L40,0 Z" fill="white" opacity="0.7"/>
    <circle cx="0" cy="-70" r="20" fill="none" stroke="gold" stroke-width="4"/>
  </g>
  <text x="256" y="450" text-anchor="middle" font-family="serif" font-size="40" fill="white" font-weight="bold">ORÁCULO</text>
</svg>`
  
  const pngPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`)
  fs.writeFileSync(pngPath, pngContent)
  console.log(`📱 Created PNG placeholder: icon-${size}x${size}.png`)
})

console.log('✨ Iconos PWA generados exitosamente!')
console.log('📍 Ubicación: public/icons/')
console.log('🔧 Para mejores iconos PNG, usa herramientas como ImageMagick o un generador online')