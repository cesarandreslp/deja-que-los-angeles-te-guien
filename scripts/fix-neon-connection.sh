#!/bin/bash

# Script de diagnóstico y solución para problemas de conexión a Neon PostgreSQL
# Para el Oráculo de los Arcángeles

echo "🔍 DIAGNÓSTICO DE CONEXIÓN A NEON DATABASE"
echo "==========================================="
echo ""

# 1. Verificar variables de entorno
echo "📋 1. Verificando configuración..."
if [ -f ".env.local" ]; then
    echo "✅ Archivo .env.local encontrado"
    
    # Extraer el host de la URL de conexión
    DB_HOST=$(grep "DATABASE_URL" .env.local | cut -d'@' -f2 | cut -d'/' -f1 | cut -d':' -f1)
    echo "🌐 Host de la base de datos: $DB_HOST"
else
    echo "❌ Archivo .env.local no encontrado"
    exit 1
fi

echo ""

# 2. Verificar conectividad de red
echo "🌐 2. Probando conectividad de red..."
if command -v telnet >/dev/null 2>&1; then
    echo "Probando conexión TCP al puerto 5432..."
    timeout 5 telnet $DB_HOST 5432 2>/dev/null || echo "❌ No se puede conectar al puerto 5432"
else
    echo "⚠️ Telnet no disponible, saltando prueba TCP"
fi

echo ""

# 3. Probar conexión con Prisma
echo "🔗 3. Probando conexión con Prisma..."
echo "Ejecutando: npx prisma db pull --preview-feature"
timeout 15 npx prisma db pull --preview-feature 2>&1 | head -10

echo ""

# 4. Soluciones recomendadas
echo "💡 4. SOLUCIONES RECOMENDADAS:"
echo "================================"
echo ""
echo "🚀 SOLUCIÓN 1: Reactivar base de datos Neon"
echo "   • Ve a https://console.neon.tech/"
echo "   • Inicia sesión en tu cuenta"
echo "   • Busca tu proyecto 'oraculo_loguin'"
echo "   • Si está pausado, haz clic en 'Wake up'"
echo ""

echo "🔄 SOLUCIÓN 2: Regenerar credenciales"
echo "   • En Neon Console, ve a Settings > Connection"
echo "   • Genera una nueva contraseña"
echo "   • Actualiza DATABASE_URL en .env.local"
echo ""

echo "📊 SOLUCIÓN 3: Verificar límites del plan"
echo "   • Revisa tu usage en Neon Console"
echo "   • Si excediste el límite gratuito, considera upgrade"
echo ""

echo "🏠 SOLUCIÓN 4: Usar SQLite local (desarrollo)"
echo "   • Cambia a SQLite para desarrollo local"
echo "   • Mantén PostgreSQL para producción"
echo ""

echo "🔧 SOLUCIÓN 5: Configurar fallback local"
echo "   • Instalar PostgreSQL local"
echo "   • Configurar DATABASE_URL_LOCAL"
echo ""

# 5. Generar nueva configuración SQLite
echo "💾 5. Generando configuración SQLite de respaldo..."
cat > .env.local.sqlite << 'EOF'
# SQLite para desarrollo local (respaldo)
DATABASE_URL="file:./dev.db"

# NextAuth - Puerto dinámico  
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="oraculo-nextauth-secret-new-2025-key-secure"

# JWT Secret
JWT_SECRET="oraculo-arcangeles-jwt-secret-2024-super-secure-key"

# Email configuration - Zoho Mail
EMAIL_SERVER_HOST="smtp.zoho.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="admin@ossinnovation.com"
EMAIL_SERVER_PASSWORD="your-zoho-app-password"
EMAIL_FROM="admin@ossinnovation.com"

# Zhipu AI Configuration - Oráculo Arcangélico
ZHIPU_API_KEY="9715fe8f7c844db3ab4375d4a589ad65.HN2LQh2cdh8EJW6n"
ZHIPU_API_URL="https://open.bigmodel.cn/api/paas/v4/chat/completions"
EOF

echo "✅ Archivo .env.local.sqlite creado como respaldo"
echo ""

echo "🎯 PRÓXIMOS PASOS:"
echo "=================="
echo "1. 🌐 Ve a https://console.neon.tech y reactiva tu base de datos"
echo "2. 🔄 Si no funciona, copia .env.local.sqlite a .env.local"
echo "3. 🗄️ Ejecuta: npx prisma db push"
echo "4. 🚀 Reinicia el servidor: npm run dev"
echo ""

echo "✨ ¡El Oráculo seguirá funcionando!"