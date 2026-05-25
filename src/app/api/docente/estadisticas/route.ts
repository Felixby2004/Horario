import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_docente = searchParams.get('id_docente');

    if (!id_docente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'ID de docente requerido'
      }, { status: 400 });
    }

    // Contar cursos asignados
    const grupos = await prisma.grupo.findMany({
      where: { id_docente: parseInt(id_docente) },
      include: { curso: true }
    });

    const cursosUnicos = new Set(grupos.map(g => g.id_curso));

    // Contar horarios por estado
    const horarios = await prisma.horarioAsignado.findMany({
      where: { id_docente: parseInt(id_docente) }
    });

    const horariosConfirmados = horarios.filter(
      h => h.estado === 'aprobado' || h.estado === 'confirmado'
    ).length;

    const horariosPendientes = horarios.filter(
      h => h.estado === 'solicitado' || h.estado === 'borrador'
    ).length;

    return NextResponse.json({
      exito: true,
      datos: {
        cursosAsignados: cursosUnicos.size,
        horariosConfirmados,
        horariosPendientes
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
