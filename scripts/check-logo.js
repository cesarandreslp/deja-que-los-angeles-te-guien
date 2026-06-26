const fs = require('fs');
const path = require('path');

function checkLogoExists() {
  const logoPath = path.join(__dirname, '..', 'public', 'icons', 'logo.png');
  
  console.log('🔍 Verificando logo por defecto...');
  console.log('📁 Ruta del logo:', logoPath);
  
  if (fs.existsSync(logoPath)) {
    const stats = fs.statSync(logoPath);
    console.log('✅ Logo encontrado!');
    console.log('📏 Tamaño:', Math.round(stats.size / 1024), 'KB');
    console.log('📅 Última modificación:', stats.mtime.toLocaleDateString());
    
    // Verificar que sea un archivo válido (no vacío)
    if (stats.size > 0) {
      console.log('✅ El logo parece ser válido');
      console.log('🌐 URL pública: /icons/logo.png');
    } else {
      console.log('❌ El archivo de logo está vacío');
    }
  } else {
    console.log('❌ Logo no encontrado en la ruta esperada');
    console.log('📂 Verificando contenido de la carpeta icons...');
    
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');
    if (fs.existsSync(iconsDir)) {
      const files = fs.readdirSync(iconsDir);
      console.log('📁 Archivos en /public/icons:');
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
    } else {
      console.log('❌ La carpeta /public/icons no existe');
    }
  }
}

checkLogoExists();