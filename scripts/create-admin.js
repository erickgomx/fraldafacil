/**
 * Script para Criação e Promoção de Superusuário Administrador
 * 
 * Uso:
 *   node scripts/create-admin.js <email> [senha] [nome]
 * 
 * Exemplos:
 *   1. Promover um usuário já cadastrado a ADMIN:
 *      node scripts/create-admin.js admin@fralda.online
 * 
 *   2. Criar um novo Super Admin do zero:
 *      node scripts/create-admin.js admin@fralda.online SenhaForte123 "Administrador Geral"
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
=============================================================
  FRALDA ONLINE - GESTÃO DE SUPERUSUÁRIOS ADMINISTRADORES
=============================================================

Uso:
  node scripts/create-admin.js <email> [senha] [nome]

Exemplos:
  • Promover usuário existente a ADMIN:
      node scripts/create-admin.js seu-email@exemplo.com

  • Criar um novo Administrador:
      node scripts/create-admin.js adm@fralda.online MinhaSenha123 "Admin Fralda"

=============================================================
    `);
    process.exit(0);
  }

  const email = args[0].trim().toLowerCase();
  const password = args[1]?.trim();
  const name = args[2]?.trim() || 'Super Administrador';

  if (!email || !email.includes('@')) {
    console.error('❌ Erro: Por favor, informe um endereço de e-mail válido.');
    process.exit(1);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log(`ℹ️  O usuário "${existingUser.name}" (${existingUser.email}) JÁ É um Administrador (role: ADMIN).`);
        
        // Se uma nova senha foi passada, atualiza a senha também
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
          });
          console.log(`🔑 Senha do administrador atualizada com sucesso!`);
        }
      } else {
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' },
        });
        console.log(`✅ Sucesso! O usuário "${existingUser.name}" (${existingUser.email}) foi promovido a SUPER ADMINISTRADOR!`);
      }
    } else {
      if (!password || password.length < 6) {
        console.error('❌ Erro: Para cadastrar um novo administrador, forneça uma senha com no mínimo 6 caracteres.');
        console.error('Exemplo: node scripts/create-admin.js adm@fralda.online SenhaForte123 "Admin"');
        process.exit(1);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log(`✅ Sucesso! Novo Super Administrador criado:`);
      console.log(`   • ID: ${newUser.id}`);
      console.log(`   • Nome: ${newUser.name}`);
      console.log(`   • E-mail: ${newUser.email}`);
      console.log(`   • Cargo: ADMIN (Acesso irrestrito a /admin)`);
    }
  } catch (error) {
    console.error('❌ Falha ao processar comando no banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
