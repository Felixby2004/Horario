import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = parseInt(process.argv[2] || '22');
  const hora_fin = process.argv[3] || '23:59';
  const ventana = await prisma.ventanaAtencion.update({
    where: { id_ventana: id },
    data: { hora_fin }
  });
  console.log('Updated ventana:', ventana);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
