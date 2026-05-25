const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar citación del docente 6 en fecha 2026-05-25
  const fechaBuscada = new Date('2026-05-25T00:00:00.000Z');
  const citacion = await prisma.citacionDocente.findFirst({
    where: {
      id_docente: 6,
      fecha_citacion: fechaBuscada
    }
  });

  if (!citacion) {
    console.log('No se encontró citación para id_docente=6 en 2026-05-25');
    await prisma.$disconnect();
    return;
  }

  const actualizado = await prisma.citacionDocente.update({
    where: { id_citacion: citacion.id_citacion },
    data: { hora_fin: '02:00' }
  });

  console.log('Citación actualizada:', { id_citacion: actualizado.id_citacion, fecha_citacion: actualizado.fecha_citacion, hora_inicio: actualizado.hora_inicio, hora_fin: actualizado.hora_fin });
}

main()
  .catch((e) => {
    console.error('Error al actualizar citación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
