const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreDatabase(backupFile) {
  try {
    console.log('🔄 Iniciando restauración de la base de datos...');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Archivo de backup no encontrado: ${backupFile}`);
    }

    // Leer datos del backup
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`📂 Restaurando backup del: ${backupData.timestamp}`);

    // Limpiar tablas dependientes primero (orden importante)
    console.log('🧹 Limpiando base de datos...');
    
    // Eliminar datos en orden de dependencias
    await prisma.message.deleteMany();
    await prisma.reading.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.videoConsultation.deleteMany();
    await prisma.contactMessage.deleteMany();
    await prisma.commission.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Base de datos limpiada');

    // Restaurar productos
    if (backupData.data.products?.length > 0) {
      console.log('📋 Restaurando productos...');
      for (const product of backupData.data.products) {
        const { orderItems, cartItems, ...productData } = product;
        await prisma.product.create({
          data: productData
        });
      }
      console.log(`✅ ${backupData.data.products.length} productos restaurados`);
    }

    // Restaurar planes de membresía
    if (backupData.data.membershipPlans?.length > 0) {
      console.log('📋 Restaurando planes de membresía...');
      for (const plan of backupData.data.membershipPlans) {
        const { userMemberships, ...planData } = plan;
        await prisma.membershipPlan.create({
          data: planData
        });
      }
      console.log(`✅ ${backupData.data.membershipPlans.length} planes restaurados`);
    }

    // Restaurar usuarios
    if (backupData.data.users?.length > 0) {
      console.log('📋 Restaurando usuarios...');
      for (const user of backupData.data.users) {
        const { 
          accounts, sessions, verificationTokens, resetTokens,
          commissions, orders, cart, membership, userMemberships,
          userConsultations, consultorConsultations, readings,
          ...userData 
        } = user;

        const createdUser = await prisma.user.create({
          data: userData
        });

        // Restaurar accounts
        if (accounts?.length > 0) {
          for (const account of accounts) {
            await prisma.account.create({
              data: {
                ...account,
                userId: createdUser.id
              }
            });
          }
        }

        // Restaurar sessions
        if (sessions?.length > 0) {
          for (const session of sessions) {
            await prisma.session.create({
              data: {
                ...session,
                userId: createdUser.id
              }
            });
          }
        }

        // Restaurar verification tokens
        if (verificationTokens?.length > 0) {
          for (const token of verificationTokens) {
            await prisma.verificationToken.create({
              data: {
                ...token,
                userId: createdUser.id
              }
            });
          }
        }

        // Restaurar reset tokens
        if (resetTokens?.length > 0) {
          for (const token of resetTokens) {
            await prisma.passwordResetToken.create({
              data: {
                ...token,
                userId: createdUser.id
              }
            });
          }
        }

        // Restaurar membership
        if (membership) {
          await prisma.membership.create({
            data: {
              ...membership,
              userId: createdUser.id
            }
          });
        }

        // Restaurar user memberships
        if (userMemberships?.length > 0) {
          for (const userMembership of userMemberships) {
            await prisma.userMembership.create({
              data: {
                ...userMembership,
                userId: createdUser.id
              }
            });
          }
        }

        // Restaurar videoconsultations
        if (userConsultations?.length > 0) {
          for (const consultation of userConsultations) {
            await prisma.videoConsultation.create({
              data: {
                ...consultation,
                userId: createdUser.id
              }
            });
          }
        }

        if (consultorConsultations?.length > 0) {
          for (const consultation of consultorConsultations) {
            await prisma.videoConsultation.create({
              data: {
                ...consultation,
                consultantId: createdUser.id
              }
            });
          }
        }

        // Restaurar cart
        if (cart) {
          const { items, ...cartData } = cart;
          const createdCart = await prisma.cart.create({
            data: {
              ...cartData,
              userId: createdUser.id
            }
          });

          // Restaurar cart items
          if (items?.length > 0) {
            for (const item of items) {
              await prisma.cartItem.create({
                data: {
                  ...item,
                  cartId: createdCart.id
                }
              });
            }
          }
        }

        // Restaurar orders
        if (orders?.length > 0) {
          for (const order of orders) {
            const { orderItems, ...orderData } = order;
            const createdOrder = await prisma.order.create({
              data: {
                ...orderData,
                userId: createdUser.id
              }
            });

            // Restaurar order items
            if (orderItems?.length > 0) {
              for (const item of orderItems) {
                await prisma.orderItem.create({
                  data: {
                    ...item,
                    orderId: createdOrder.id
                  }
                });
              }
            }
          }
        }

        // Restaurar readings
        if (readings?.length > 0) {
          for (const reading of readings) {
            const { messages, ...readingData } = reading;
            const createdReading = await prisma.reading.create({
              data: {
                ...readingData,
                userId: createdUser.id
              }
            });

            // Restaurar messages
            if (messages?.length > 0) {
              for (const message of messages) {
                await prisma.message.create({
                  data: {
                    ...message,
                    readingId: createdReading.id
                  }
                });
              }
            }
          }
        }

        // Restaurar commissions
        if (commissions?.length > 0) {
          for (const commission of commissions) {
            await prisma.commission.create({
              data: {
                ...commission,
                userId: createdUser.id
              }
            });
          }
        }
      }
      console.log(`✅ ${backupData.data.users.length} usuarios restaurados`);
    }

    // Restaurar videoconsultas adicionales
    if (backupData.data.videoConsultations?.length > 0) {
      console.log('📋 Restaurando videoconsultas adicionales...');
      for (const consultation of backupData.data.videoConsultations) {
        // Solo restaurar si no existe ya
        const existing = await prisma.videoConsultation.findUnique({
          where: { id: consultation.id }
        });
        
        if (!existing) {
          await prisma.videoConsultation.create({
            data: consultation
          });
        }
      }
      console.log(`✅ Videoconsultas adicionales verificadas`);
    }

    // Restaurar mensajes de contacto
    if (backupData.data.contactMessages?.length > 0) {
      console.log('📋 Restaurando mensajes de contacto...');
      for (const message of backupData.data.contactMessages) {
        await prisma.contactMessage.create({
          data: message
        });
      }
      console.log(`✅ ${backupData.data.contactMessages.length} mensajes restaurados`);
    }

    console.log('🎉 Restauración completada exitosamente');
    console.log(`📊 Datos restaurados del backup: ${backupData.timestamp}`);

  } catch (error) {
    console.error('❌ Error durante la restauración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ Por favor proporciona la ruta del archivo de backup');
    console.log('Uso: node restore-database.js <ruta-del-backup>');
    process.exit(1);
  }

  restoreDatabase(backupFile)
    .then(() => {
      console.log('🎉 Restauración exitosa');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en restauración:', error);
      process.exit(1);
    });
}

module.exports = { restoreDatabase };