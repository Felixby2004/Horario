import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { construirTextoPrerequisitos } from '@/lib/cursos';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      include: {
        departamento: true,
        prerequisitos_relacion: {
          select: {
            prerequisito: {
              select: {
                id_curso: true,
                codigo: true,
                nombre: true
              }
            }
          },
          orderBy: {
            prerequisito: {
              codigo: 'asc'
            }
          }
        }
      },
      orderBy: [
        { ciclo: 'asc' },
        { codigo: 'asc' }
      ]
    });

    return NextResponse.json({
      exito: true,
      datos: cursos.map((curso) => {
        const prerequisitosDetalle = curso.prerequisitos_relacion.map((item) => item.prerequisito);
        return {
          ...curso,
          prerequisito_ids: prerequisitosDetalle.map((prerequisito) => prerequisito.id_curso),
          prerequisitos_detalle: prerequisitosDetalle,
          prerequisitos: construirTextoPrerequisitos(prerequisitosDetalle)
        };
      })
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
