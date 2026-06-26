const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Reseteando contraseña del admin...');
    
    // Generate new password hash
    const newPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin user
    const admin = await prisma.user.update({
      where: { email: 'admin@oraculo.com' },
      data: { 
        passwordHash: hashedPassword,
        isActive: true 
      }
    });
    
    console.log('✅ Contraseña actualizada');
    
    // Test the new password
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`🧪 Test de nueva contraseña: ${isValid ? 'EXITOSA' : 'FALLIDA'}`);
    
    // Test from database
    const dbAdmin = await prisma.user.findUnique({
      where: { email: 'admin@oraculo.com' }
    });
    
    if (dbAdmin && dbAdmin.passwordHash) {
      const dbTest = await bcrypt.compare(newPassword, dbAdmin.passwordHash);
      console.log(`🗄️ Test desde DB: ${dbTest ? 'EXITOSA' : 'FALLIDA'}`);
    }
    
    console.log('\n✅ PASSWORD RESET COMPLETO');
    console.log('📧 Email: admin@oraculo.com');
    console.log('🔑 Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();