#!/bin/bash

# Script para reiniciar Next.js después de limpiar caché

echo "🧹 Limpiando caché de Next.js..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "🔄 Regenerando Prisma Client..."
npx prisma generate

echo ""
echo "✅ Listo! Ahora puedes iniciar el servidor con:"
echo ""
echo "   npm run dev"
echo ""
echo "📝 Si el problema persiste:"
echo "   1. Verifica errores en la consola del navegador (F12)"
echo "   2. Revisa el terminal del servidor"
echo "   3. Asegúrate de que .env esté configurado"
echo ""
