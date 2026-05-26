import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const config = await prisma.configuracionSistema.findFirst();
    console.log('📊 Configuración guardada en BD:');
    console.log(JSON.stringify(config, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
