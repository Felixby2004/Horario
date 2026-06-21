import { prisma } from '../src/lib/prisma';
import { construirTextoPrerequisitos } from '../src/lib/cursos';

function normalizarTexto(valor?: string | null) {
  return String(valor || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function main() {
  const cursos = await prisma.curso.findMany({
    select: {
      id_curso: true,
      codigo: true,
      nombre: true,
      prerequisitos: true,
      prerequisitos_relacion: {
        select: {
          prerequisito: {
            select: {
              id_curso: true,
              codigo: true,
              nombre: true
            }
          }
        }
      }
    },
    orderBy: {
      codigo: 'asc'
    }
  });

  const mapaCursos = new Map<string, { id_curso: number; codigo: string; nombre: string }>();
  for (const curso of cursos) {
    mapaCursos.set(normalizarTexto(`${curso.codigo} - ${curso.nombre}`), {
      id_curso: curso.id_curso,
      codigo: curso.codigo,
      nombre: curso.nombre
    });
    mapaCursos.set(normalizarTexto(curso.codigo), {
      id_curso: curso.id_curso,
      codigo: curso.codigo,
      nombre: curso.nombre
    });
  }

  for (const curso of cursos) {
    if (curso.prerequisitos_relacion.length > 0) {
      const texto = construirTextoPrerequisitos(
        curso.prerequisitos_relacion.map((item) => item.prerequisito)
      );

      await prisma.curso.update({
        where: { id_curso: curso.id_curso },
        data: {
          prerequisitos: texto
        }
      });
      continue;
    }

    const candidatos = String(curso.prerequisitos || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => mapaCursos.get(normalizarTexto(item)))
      .filter((item): item is { id_curso: number; codigo: string; nombre: string } => Boolean(item))
      .filter((item) => item.id_curso !== curso.id_curso);

    if (!candidatos.length) {
      continue;
    }

    await prisma.curso.update({
      where: { id_curso: curso.id_curso },
      data: {
        prerequisitos_relacion: {
          create: candidatos.map((prerequisito) => ({
            id_curso_prerequisito: prerequisito.id_curso
          }))
        },
        prerequisitos: construirTextoPrerequisitos(candidatos)
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error migrando prerrequisitos múltiples:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
