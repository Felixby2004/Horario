const { PrismaClient } = require('./generated/prisma-client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing Prisma connection...');
  try {
    const users = await prisma.usuario.findFirst();
    console.log('Success! First user:', users);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();