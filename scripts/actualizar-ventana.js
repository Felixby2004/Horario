const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = 34; // id_ventana a actualizar
  const nuevaHora = '02:00';

  const ventana = await prisma.ventanaAtencion.update({
    where: { id_ventana: id },
    data: { hora_fin: nuevaHora }
  });

  console.log('Ventana actualizada:', { id_ventana: ventana.id_ventana, fecha: ventana.fecha, hora_inicio: ventana.hora_inicio, hora_fin: ventana.hora_fin });
}

main()
  .catch((e) => {
    console.error('Error al actualizar ventana:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
