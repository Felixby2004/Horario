
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos...');

  // Eliminar en orden correcto para evitar violaciones de llaves foráneas
  await prisma.horarioAsignado.deleteMany();
  console.log('✓ Horarios asignados eliminados');

  await prisma.cursoAmbiente.deleteMany();
  console.log('✓ Relaciones curso-ambiente eliminadas');

  await prisma.docenteCurso.deleteMany();
  console.log('✓ Relaciones docente-curso eliminadas');

  await prisma.grupo.deleteMany();
  console.log('✓ Grupos eliminados');

  await prisma.curso.deleteMany();
  console.log('✓ Cursos eliminados');

  await prisma.docente.deleteMany();
  console.log('✓ Docentes eliminados');

  await prisma.usuario.deleteMany();
  console.log('✓ Usuarios eliminados');

  await prisma.ambiente.deleteMany();
  console.log('✓ Ambientes eliminados');

  await prisma.periodoAcademico.deleteMany();
  console.log('✓ Períodos académicos eliminados');

  console.log('\n✅ Base de datos limpiada completamente! 🧹');
}

main()
  .catch((e) => {
    console.error('❌ Error al limpiar la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

