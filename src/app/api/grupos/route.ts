import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curso = searchParams.get('curso');
    const periodo = searchParams.get('periodo');
    const id_docente = searchParams.get('id_docente');

    // Si se proporciona id_docente, obtener solo los grupos asignados por horarios
    if (id_docente) {
      const docenteId = parseInt(id_docente);
      
      // Encontrar todos los horarios del docente y extraer los grupos únicos
      const horariosDocente = await prisma.horarioAsignado.findMany({
        where: { id_docente: docenteId },
        select: { id_grupo: true }
      });

      // Obtener IDs únicos de grupos
      const gruposIds = [...new Set(horariosDocente.map(h => h.id_grupo))];

      // Si no hay horarios, devolver vacío
      if (gruposIds.length === 0) {
        return NextResponse.json({
          exito: true,
          datos: []
        });
      }

      // Obtener detalles de los grupos
      const grupos = await prisma.grupo.findMany({
        where: {
          id_grupo: { in: gruposIds }
        },
        include: {
          curso: true,
          periodo: true
        },
        orderBy: {
          codigo_grupo: 'asc'
        }
      });

      return NextResponse.json({
        exito: true,
        datos: grupos
      });
    }

    // Búsqueda normal sin filtro de docente
    const where: any = {};
    if (curso) where.id_curso = parseInt(curso);
    if (periodo) where.id_periodo = parseInt(periodo);

    const grupos = await prisma.grupo.findMany({
      where,
      include: {
        curso: true,
        periodo: true
      },
      orderBy: {
        codigo_grupo: 'asc'
      }
    });

    return NextResponse.json({
      exito: true,
      datos: grupos
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    const grupo = await prisma.grupo.create({
      data: {
        id_curso: datos.id_curso,
        id_periodo: datos.id_periodo,
        codigo_grupo: datos.codigo_grupo,
        capacidad_maxima: datos.capacidad_maxima || 40,
        activo: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: grupo
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
