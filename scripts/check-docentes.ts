import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const docentes = await prisma.docente.findMany({
    where: { activo: true },
    select: {
      id_docente: true,
      nombres: true,
      apellidos: true,
      categoria: true,
      modalidad: true
    }
  });

  console.log('--- Listado de Docentes Activos ---');
  docentes.forEach(d => {
    console.log(`[${d.id_docente}] ${d.nombres} ${d.apellidos} | Cat: "${d.categoria}" | Mod: "${d.modalidad}"`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
