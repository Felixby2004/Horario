import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_ambiente = searchParams.get('id_ambiente');
    const id_periodo = searchParams.get('id_periodo');

    if (!id_ambiente || !id_periodo) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: id_ambiente, id_periodo' },
        { status: 400 }
      );
    }

    const ambiente = await prisma.ambiente.findUnique({
      where: { id_ambiente: parseInt(id_ambiente) }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_ambiente: parseInt(id_ambiente),
        id_periodo: parseInt(id_periodo),
        estado: { in: ['confirmado', 'publicado', 'aprobado', 'modificado', 'borrador', 'solicitado'] }
      },
      include: {
        curso: true,
        grupo: true,
        docente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    return NextResponse.json({
      ambiente,
      horarios,
      totalHorarios: horarios.length,
      mensaje: horarios.length === 0 ? 'No hay horarios asignados para esta aula en este período' : 'Datos cargados correctamente'
    });
  } catch (error: any) {
    console.error('Error obteniendo preview:', error);
    return NextResponse.json(
      { error: error.message || 'Error obteniendo datos' },
      { status: 500 }
    );
  }
}
