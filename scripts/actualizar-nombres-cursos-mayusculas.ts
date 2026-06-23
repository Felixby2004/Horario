import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Iniciando actualización de nombres de cursos a mayúsculas...');

  const cursos = await prisma.curso.findMany({
    select: {
      id_curso: true,
      nombre: true
    }
  });

  console.log(`Se encontraron ${cursos.length} cursos.`);

  let actualizados = 0;

  for (const curso of cursos) {
    const nombreMayusculas = curso.nombre.toUpperCase();
    
    if (curso.nombre !== nombreMayusculas) {
      await prisma.curso.update({
        where: { id_curso: curso.id_curso },
        data: {
          nombre: nombreMayusculas
        }
      });
      console.log(`Actualizado curso ${curso.id_curso}: "${curso.nombre}" → "${nombreMayusculas}"`);
      actualizados++;
    }
  }

  console.log(`Proceso completado! Se actualizaron ${actualizados} cursos.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error actualizando nombres de cursos:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
