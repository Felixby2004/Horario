import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_docente = searchParams.get('id_docente');
    const ciclo = searchParams.get('ciclo');

    if (!id_docente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'ID de docente requerido'
      }, { status: 400 });
    }

    // Obtener grupos asignados al docente
    const grupos = await prisma.grupo.findMany({
      where: {
        id_docente: parseInt(id_docente)
      },
      include: {
        curso: true
      }
    });

    // Filtrar por ciclo si se proporciona
    let cursos = grupos.map(g => g.curso);
    
    if (ciclo) {
      cursos = cursos.filter(c => c.ciclo === parseInt(ciclo));
    }

    // Eliminar duplicados
    const cursosUnicos = Array.from(
      new Map(cursos.map(c => [c.id_curso, c])).values()
    );

    return NextResponse.json({
      exito: true,
      datos: cursosUnicos
    });
  } catch (error: any) {
    console.error('Error obteniendo cursos del docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
