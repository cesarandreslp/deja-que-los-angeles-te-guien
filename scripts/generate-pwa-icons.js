const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuración de iconos
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const COLORS = {
  primary: '#6366f1',      // Índigo
  secondary: '#FFD700',    // Dorado
  background: '#1a1a2e',   // Azul oscuro
  white: '#FFFFFF',
  gradient1: '#4F46E5',    // Púrpura
  gradient2: '#7C3AED',    // Violeta
};

function createIconCanvas(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo con gradiente radial
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, COLORS.gradient1);
  gradient.addColorStop(0.6, COLORS.primary);
  gradient.addColorStop(1, COLORS.background);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Círculo interior con brillo
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  
  // Sombra del círculo
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = size * 0.05;
  ctx.shadowOffsetY = size * 0.02;
  
  // Círculo dorado
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.secondary;
  ctx.fill();
  
  // Resetear sombra
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Símbolo angelical - Estrella de 6 puntas (Estrella de David)
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.primary;
  ctx.lineWidth = size * 0.01;
  
  const starRadius = radius * 0.6;
  const starPoints = 6;
  
  // Dibujar estrella de 6 puntas
  ctx.beginPath();
  for (let i = 0; i < starPoints * 2; i++) {
    const angle = (i * Math.PI) / starPoints;
    const r = i % 2 === 0 ? starRadius : starRadius * 0.4;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Círculo central pequeño
  ctx.beginPath();
  ctx.arc(centerX, centerY, starRadius * 0.15, 0, 2 * Math.PI);
  ctx.fillStyle = COLORS.primary;
  ctx.fill();
  
  // Brillo superior
  const glowGradient = ctx.createLinearGradient(0, 0, 0, size * 0.4);
  glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, size, size * 0.4);
  
  return canvas;
}

function createBadgeIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo circular con gradiente
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, COLORS.secondary);
  gradient.addColorStop(1, '#B8860B'); // Dorado más oscuro
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Símbolo de notificación (campana)
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.background;
  ctx.lineWidth = 2;
  
  const bellSize = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Dibujar campana simplificada
  ctx.beginPath();
  ctx.arc(centerX, centerY - bellSize * 0.1, bellSize * 0.6, 0, Math.PI);
  ctx.lineTo(centerX - bellSize * 0.6, centerY + bellSize * 0.3);
  ctx.lineTo(centerX + bellSize * 0.6, centerY + bellSize * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Mango de la campana
  ctx.beginPath();
  ctx.arc(centerX, centerY - bellSize * 0.7, bellSize * 0.1, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas;
}

function createShortcutIcon(size, iconType) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo
  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(0, 0, size, size);
  
  // Esquinas redondeadas
  const radius = size * 0.1;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  // Símbolo central
  ctx.fillStyle = COLORS.white;
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = size * 0.05;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const symbolSize = size * 0.4;
  
  switch (iconType) {
    case 'consultation':
      // Símbolo de videollamada
      ctx.beginPath();
      ctx.roundRect(centerX - symbolSize/2, centerY - symbolSize/3, symbolSize, symbolSize * 0.6, symbolSize * 0.1);
      ctx.fill();
      
      // Lente de la cámara
      ctx.beginPath();
      ctx.arc(centerX + symbolSize * 0.2, centerY, symbolSize * 0.15, 0, 2 * Math.PI);
      ctx.fillStyle = COLORS.primary;
      ctx.fill();
      break;
      
    case 'oracle':
      // Símbolo de cartas (tres cartas apiladas)
      for (let i = 0; i < 3; i++) {
        const offset = i * size * 0.05;
        ctx.fillStyle = i === 2 ? COLORS.secondary : COLORS.white;
        ctx.beginPath();
        ctx.roundRect(
          centerX - symbolSize/2 + offset, 
          centerY - symbolSize/2 + offset, 
          symbolSize * 0.6, 
          symbolSize, 
          symbolSize * 0.05
        );
        ctx.fill();
      }
      break;
      
    case 'dashboard':
      // Símbolo de dashboard (grid 2x2)
      const gridSize = symbolSize * 0.35;
      const gap = symbolSize * 0.1;
      
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          ctx.beginPath();
          ctx.roundRect(
            centerX - gridSize + col * (gridSize + gap),
            centerY - gridSize + row * (gridSize + gap),
            gridSize,
            gridSize,
            gridSize * 0.1
          );
          ctx.fill();
        }
      }
      break;
  }
  
  return canvas;
}

async function generateAllIcons() {
  console.log('🎨 Generando iconos PWA...\n');
  
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Crear directorio si no existe
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  let generatedCount = 0;
  
  // Generar iconos principales
  console.log('📱 Generando iconos principales...');
  for (const size of ICON_SIZES) {
    const canvas = createIconCanvas(size);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    console.log(`✅ ${filename} generado (${size}x${size})`);
    generatedCount++;
  }
  
  // Generar icono de badge
  console.log('\n🔔 Generando icono de badge...');
  const badgeCanvas = createBadgeIcon(72);
  const badgeBuffer = badgeCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, 'badge-72x72.png'), badgeBuffer);
  console.log('✅ badge-72x72.png generado');
  generatedCount++;
  
  // Generar iconos de shortcuts
  console.log('\n🚀 Generando iconos de shortcuts...');
  const shortcuts = [
    { name: 'shortcut-consultation.png', type: 'consultation' },
    { name: 'shortcut-oracle.png', type: 'oracle' },
    { name: 'shortcut-dashboard.png', type: 'dashboard' }
  ];
  
  for (const shortcut of shortcuts) {
    const canvas = createShortcutIcon(96, shortcut.type);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, shortcut.name), buffer);
    console.log(`✅ ${shortcut.name} generado`);
    generatedCount++;
  }
  
  // Crear iconos adicionales para notificaciones
  console.log('\n🔔 Generando iconos de notificaciones...');
  const notificationIcons = [
    { name: 'action-view.png', size: 32 },
    { name: 'action-close.png', size: 32 },
    { name: 'notification-banner.png', size: 320 }
  ];
  
  for (const notifIcon of notificationIcons) {
    let canvas;
    if (notifIcon.name.includes('banner')) {
      // Banner rectangular
      canvas = createCanvas(320, 180);
      const ctx = canvas.getContext('2d');
      
      // Fondo con gradiente
      const gradient = ctx.createLinearGradient(0, 0, 320, 180);
      gradient.addColorStop(0, COLORS.primary);
      gradient.addColorStop(1, COLORS.gradient2);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 320, 180);
      
      // Texto
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Oráculo de los Arcángeles', 160, 90);
      
      ctx.font = '16px Arial';
      ctx.fillText('Nueva consulta programada', 160, 120);
      
    } else {
      // Iconos pequeños para acciones
      canvas = createCanvas(notifIcon.size, notifIcon.size);
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = COLORS.white;
      ctx.strokeStyle = COLORS.primary;
      ctx.lineWidth = 2;
      
      if (notifIcon.name.includes('view')) {
        // Ojo para ver
        ctx.beginPath();
        ctx.arc(16, 16, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(16, 16, 4, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // X para cerrar
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(24, 24);
        ctx.moveTo(24, 8);
        ctx.lineTo(8, 24);
        ctx.stroke();
      }
    }
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, notifIcon.name), buffer);
    console.log(`✅ ${notifIcon.name} generado`);
    generatedCount++;
  }
  
  console.log(`\n🎉 ¡Generación completa! ${generatedCount} iconos creados en /public/icons/`);
  console.log('\n📱 Iconos PWA listos para usar:');
  console.log('   • Iconos principales: 72x72 hasta 512x512');
  console.log('   • Badge de notificaciones: 72x72');
  console.log('   • Shortcuts de aplicación: 96x96');
  console.log('   • Iconos de acciones: 32x32');
  console.log('   • Banner de notificación: 320x180');
  
  return generatedCount;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateAllIcons()
    .then((count) => {
      console.log(`\n✨ Proceso completado: ${count} iconos generados exitosamente`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error generando iconos:', error);
      process.exit(1);
    });
}

module.exports = { generateAllIcons };