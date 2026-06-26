const fs = require('fs');

// Leer info route
let infoContent = fs.readFileSync('src/app/api/mentor/info/route.ts', 'utf8');

// Eliminar todos los console.log de debug del info route (líneas 79-103)
infoContent = infoContent.replace(/    console\.log\('🔍 Debug mentor info:',[\s\S]*?\}\);/g, '');
infoContent = infoContent.replace(/      console\.log\('.*?Updating mentor.*?\n/g, '');
infoContent = infoContent.replace(/      console\.log\('.*?Saved consistent.*?\n/g, '');
infoContent = infoContent.replace(/      console\.log\('.*?Using existing.*?\n/g, '');

// Guardar
fs.writeFileSync('src/app/api/mentor/info/route.ts', infoContent);
console.log('✅ Cleaned info/route.ts');

// Leer consult route
let consultContent = fs.readFileSync('src/app/api/mentor/consult/route.ts', 'utf8');

// Eliminar console.log de debug
consultContent = consultContent.replace(/    console\.log\('🔍 Debug mentor consult:',[\s\S]*?\}\);/g, '');
consultContent = consultContent.replace(/      console\.log\('.*?Updating mentor.*?\n/g, '');
consultContent = consultContent.replace(/      console\.log\('.*?Saved consistent.*?\n/g, '');
consultContent = consultContent.replace(/      console\.log\('.*?Using existing.*?\n/g, '');
consultContent = consultContent.replace(/    console\.log\('🕐 Debug today[\s\S]*?\}\);/g, '');
consultContent = consultContent.replace(/    console\.log\('🔍 Today consultation result:',[\s\S]*?\}\);/g, '');
consultContent = consultContent.replace(/    console\.log\('🤖 Generating response[\s\S]*?\}\);/g, '');
consultContent = consultContent.replace(/    console\.log\('🔑 API Key check:',[\s\S]*?\}\);/g, '');
consultContent = consultContent.replace(/      console\.log\('✅ Zhipu Response[\s\S]*?\}\);/g, '');
consultContent = consultContent.replace(/        console\.log\('✅ Generated response from Zhipu.*?\n/g, '');
consultContent = consultContent.replace(/    console\.log\('🎯 Fallback response[\s\S]*?\}\);/g, '');

// Guardar
fs.writeFileSync('src/app/api/mentor/consult/route.ts', consultContent);
console.log('✅ Cleaned consult/route.ts');

console.log('\n✅ All debug logs removed!');
