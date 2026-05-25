import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_periodo = searchParams.get('id_periodo');
    const ciclo = searchParams.get('ciclo');

    if (!id_periodo || !ciclo) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: id_periodo, ciclo' },
        { status: 400 }
      );
    }

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: parseInt(id_periodo) }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: parseInt(id_periodo),
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] },
        curso: { ciclo: parseInt(ciclo) }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true,
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const cursos = Array.from(new Map(horarios.map((h) => [h.id_curso, h])).values()).map((h) => ({
      id_curso: h.id_curso,
      codigo: h.curso?.codigo,
      nombre: h.curso?.nombre,
      docente: h.docente ? `${h.docente.apellidos}, ${h.docente.nombres}` : 'N/A'
    }));

    return NextResponse.json({
      periodo,
      ciclo: parseInt(ciclo),
      horarios,
      cursos,
      totalHorarios: horarios.length,
      totalCursos: cursos.length,
      mensaje: horarios.length === 0 ? 'No hay horarios asignados para este ciclo en este período' : 'Datos cargados correctamente'
    });
  } catch (error: any) {
    console.error('Error obteniendo preview ciclo:', error);
    return NextResponse.json(
      { error: error.message || 'Error obteniendo datos' },
      { status: 500 }
    );
  }
}
