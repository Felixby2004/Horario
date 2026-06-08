
import { PrismaClient } from '../generated/prisma-client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting actividades no lectivas para usuario Sanchez (123456)...');

  // 1. Buscar usuario Sanchez
  const usuario = await prisma.usuario.findFirst({
    where: { codigo: '123456' },
    include: { docente: true }
  });

  if (!usuario) {
    console.log('❌ Usuario 123456 no encontrado');
    return;
  }
  if (!usuario.docente) {
    console.log('❌ Docente no asociado al usuario');
    return;
  }
  console.log('✅ Encontrado docente:', usuario.docente.codigo_docente);

  // 2. Obtener todas las cargas academicas del docente
  const cargas = await prisma.cargaAcademica.findMany({
    where: { id_docente: usuario.docente.id_docente }
  });
  console.log('✅ Encontradas', cargas.length, 'carga(s) académica(s)');

  // 3. Eliminar todas las ActividadNoLectiva asociadas a esas cargas
  for (const carga of cargas) {
    await prisma.actividadNoLectiva.deleteMany({
      where: { id_carga: carga.id_carga }
    });
    console.log('✅ Eliminadas actividades de carga', carga.id_carga);
  }

  // 4. Resetear horas_no_lectivas en las cargas
  for (const carga of cargas) {
    await prisma.cargaAcademica.update({
      where: { id_carga: carga.id_carga },
      data: { horas_no_lectivas: 0, horas_totales: carga.horas_lectivas + (carga.horas_preparacion || 0) }
    });
  }

  console.log('✅ Reset de actividades no lectivas completado! Horas lectivas intactas!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
