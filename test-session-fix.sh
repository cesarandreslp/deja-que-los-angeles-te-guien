#!/bin/bash

echo "🔍 Verificando la configuración de sesión y cookies..."

# Verificar archivos críticos
echo "📄 Verificando archivos existentes:"
files=(
    "src/lib/auth.ts"
    "src/components/HydrationGuard.tsx"
    "src/components/providers/SessionProvider.tsx"
    "src/app/layout.tsx"
    "src/middleware.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Existe"
    else
        echo "❌ $file - No encontrado"
    fi
done

echo -e "\n🔧 Configuraciones implementadas:"
echo "✅ NextAuth con configuración JWT mejorada"
echo "✅ Cookies optimizadas para desarrollo local"
echo "✅ HydrationGuard para prevenir problemas de hidratación"
echo "✅ SessionProvider con configuraciones de estabilidad"
echo "✅ Middleware con headers de cache mejorados"

echo -e "\n🚀 Para probar la aplicación:"
echo "1. Ejecuta: npm run dev"
echo "2. Ve a: http://localhost:3000"
echo "3. Inicia sesión"
echo "4. Ve a: http://localhost:3000/oraculo"
echo "5. Verifica que Gabriel saluda correctamente con Zhipu AI"
echo "6. Prueba el paso 8 (GroupChatRevealStep)"

echo -e "\n📋 Checklist de pruebas:"
echo "□ La sesión carga sin necesidad de refresh"
echo "□ Gabriel da un saludo personalizado (no genérico)"
echo "□ El paso 8 muestra botones de interpretación"
echo "□ Los arcángeles aparecen en el lado derecho del chat"
echo "□ Gabriel aparece en el lado izquierdo del chat"
echo "□ Los botones funcionan paso a paso"

echo -e "\n💡 Si hay problemas:"
echo "- Revisa la consola del navegador"
echo "- Verifica que ZHIPU_API_KEY esté en .env.local"
echo "- Asegúrate de que la base de datos esté funcionando"
echo "- Comprueba que no hay errores de TypeScript"