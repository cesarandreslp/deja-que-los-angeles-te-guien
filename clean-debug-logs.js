const fs = require('fs');
const path = require('path');

// Patrones de console.log a eliminar (debug logs)
const debugPatterns = [
  /console\.log\('🔍 Debug mentor.*?(?=\n\s{4}\/\/|\n\s{4}const|\n\s{4}let|\n\s{4}if|\n\s{4}await)/gs,
  /console\.log\('📝 Updating mentor.*?\n/g,
  /console\.log\('💾 Saved consistent.*?\n/g,
  /console\.log\('✅ Using existing.*?\n/g,
  /console\.log\('🕐 Debug today.*?(?=\n\s{4}const|\n\s{4}let)/gs,
  /console\.log\('🔍 Today consultation.*?(?=\n\s{4}\}\)\n)/gs,
];

// Mantener estos logs (son útiles para producción):
// - Logs de fallback responses
// - Logs de API key missing
// - Logs de errors
// - Logs de Zhipu responses

const files = [
  'src/app/api/mentor/info/route.ts',
  'src/app/api/mentor/consult/route.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  debugPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  
  // Limpiar líneas vacías múltiples
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned ${file}`);
  } else {
    console.log(`⚠️  No changes in ${file}`);
  }
});

console.log('\n✅ Debug logs cleanup completed!');
