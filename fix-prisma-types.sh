#!/bin/bash

# Script para regenerar Prisma Client y corregir errores de tipos

echo "🔧 Regenerando Prisma Client..."

# Regenerar Prisma Client
npx prisma generate

echo ""
echo "✅ Prisma Client regenerado exitosamente"
echo ""
echo "📝 Ahora deberías:"
echo "1. Reiniciar el TypeScript Server en VS Code (Cmd/Ctrl + Shift + P -> 'TypeScript: Restart TS Server')"
echo "2. Los errores de 'blogConfig' deberían desaparecer"
echo ""
echo "Si los errores persisten, ejecuta también:"
echo "npm run build"
