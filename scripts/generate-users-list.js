const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateUsersList() {
  try {
    console.log('📋 Generando lista completa de usuarios...')

    // Obtener todos los usuarios con sus membresías
    const users = await prisma.user.findMany({
      include: {
        membership: true,
        userConsultations: {
          select: {
            id: true,
            scheduledAt: true,
            status: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const currentDate = new Date().toISOString().split('T')[0]
    
    let markdownContent = `# 📋 Lista de Usuarios - Oráculo Angelical
*Actualizado: ${currentDate}*

## 👥 Resumen General
- **Total de usuarios:** ${users.length}
- **Administradores:** ${users.filter(u => u.role === 'ADMIN').length}
- **Consultores:** ${users.filter(u => u.role === 'CONSULTANT').length}
- **Usuarios regulares:** ${users.filter(u => u.role === 'USER').length}
- **Con membresía activa:** ${users.filter(u => u.membership?.status === 'ACTIVE').length}

---

## 🔐 Administradores

| Nombre | Email | Estado | Fecha Creación |
|--------|-------|--------|----------------|
`

    users.filter(u => u.role === 'ADMIN').forEach(user => {
      markdownContent += `| ${user.fullName} | ${user.email} | ${user.isActive ? '✅ Activo' : '❌ Inactivo'} | ${user.createdAt.toISOString().split('T')[0]} |\n`
    })

    markdownContent += `\n## 👨‍💼 Consultores

| Nombre | Email | Estado | Consultas | Fecha Creación |
|--------|-------|--------|-----------|----------------|
`

    users.filter(u => u.role === 'CONSULTANT').forEach(user => {
      markdownContent += `| ${user.fullName} | ${user.email} | ${user.isActive ? '✅ Activo' : '❌ Inactivo'} | ${user.userConsultations.length} | ${user.createdAt.toISOString().split('T')[0]} |\n`
    })

    markdownContent += `\n## 👤 Usuarios Regulares

| Nombre | Email | Membresía | Ángel Mentor | Estado | Password | Fecha Creación |
|--------|-------|-----------|--------------|--------|----------|----------------|
`

    users.filter(u => u.role === 'USER').forEach(user => {
      const membershipInfo = user.membership ? 
        `💎 ${user.membership.type} (${user.membership.status})` : 
        '❌ Sin membresía'
      
      const angelMentor = user.mentorArcangel || '❓ No asignado'
      const password = user.email.includes('test') || user.email.includes('premium') || user.email.includes('vip') ? 
        getPasswordForUser(user.email) : '🔒 Hash'

      markdownContent += `| ${user.fullName} | ${user.email} | ${membershipInfo} | ${angelMentor} | ${user.isActive ? '✅ Activo' : '❌ Inactivo'} | ${password} | ${user.createdAt.toISOString().split('T')[0]} |\n`
    })

    markdownContent += `\n---

## 🧪 Usuarios de Prueba (Testing)

### 💎 Usuarios Premium - NUEVOS (Creados hoy)
- **Sofía Mendoza** - sofia.premium@oraculo.com / **premium123** 
  - 👑 Membresía: ANUAL (Activa hasta ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})
  - 👼 Ángel Mentor: Gabriel (Miércoles)
  - 🌍 País: Colombia
  - ♀️ Género: Femenina

- **Carlos Eduardo Ramírez** - carlos.vip@oraculo.com / **vip123**
  - 💼 Membresía: MENSUAL (Activa hasta ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})
  - 👼 Ángel Mentor: Miguel (Domingo)
  - 🌍 País: México
  - ♂️ Género: Masculino

### 🔧 Usuarios de Testing Básico
- **Usuario de Prueba** - user.test@oraculo.com / **test123**
- **Consultor de Prueba** - consultor.test@oraculo.com / **test123**
- **María González** - maria.consultora@oraculo.com / **test123**

---

## 📊 Estadísticas de Membresías

| Tipo | Cantidad | Estado Activo |
|------|----------|---------------|
| ANUAL | ${users.filter(u => u.membership?.type === 'ANNUAL').length} | ${users.filter(u => u.membership?.type === 'ANNUAL' && u.membership?.status === 'ACTIVE').length} |
| MENSUAL | ${users.filter(u => u.membership?.type === 'MONTHLY').length} | ${users.filter(u => u.membership?.type === 'MONTHLY' && u.membership?.status === 'ACTIVE').length} |
| LIFETIME | ${users.filter(u => u.membership?.type === 'LIFETIME').length} | ${users.filter(u => u.membership?.type === 'LIFETIME' && u.membership?.status === 'ACTIVE').length} |

---

## 🎯 Notas para Testing Hoy (${currentDate})

### ✅ Usuarios Premium Listos
- Los usuarios premium tienen **membresías activas** y pueden:
  - Acceder a consultas ilimitadas
  - Usar funciones premium del oráculo
  - Recibir contenido exclusivo
  - Tener prioridad en el soporte

### 🔑 Credenciales de Acceso Rápido
\`\`\`
# Premium Users
sofia.premium@oraculo.com    | premium123
carlos.vip@oraculo.com       | vip123

# Test Users  
user.test@oraculo.com        | test123
consultor.test@oraculo.com   | test123
maria.consultora@oraculo.com | test123
\`\`\`

### 🧪 Escenarios de Prueba Sugeridos
1. **Login con usuarios premium** - Verificar acceso a funciones premium
2. **Membresía expirada** - Cambiar estado de membresía para probar restricciones
3. **Ángeles mentores** - Probar asignación y contenido personalizado
4. **Consultas premium** - Verificar que no se cobran a usuarios con membresía
5. **Renovación automática** - Probar lógica de renovación de membresías

---
*Lista generada automáticamente el ${new Date().toLocaleString('es-ES')}*`

    return markdownContent

  } catch (error) {
    console.error('❌ Error generando lista de usuarios:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function getPasswordForUser(email) {
  const passwordMap = {
    'sofia.premium@oraculo.com': 'premium123',
    'carlos.vip@oraculo.com': 'vip123',
    'user.test@oraculo.com': 'test123',
    'consultor.test@oraculo.com': 'test123',
    'maria.consultora@oraculo.com': 'test123'
  }
  return passwordMap[email] || '🔒 Hash'
}

if (require.main === module) {
  generateUsersList().then(content => {
    console.log('📄 Contenido generado, guardando archivo...')
    require('fs').writeFileSync('usuarios-lista.md', content)
    console.log('✅ Archivo usuarios-lista.md creado exitosamente!')
  })
}

module.exports = { generateUsersList }