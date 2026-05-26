import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: parseInt(id_docente)
      },
      include: {
        curso: true,
        grupo: true,
        ambiente: true,
        periodo: true
      },
      orderBy: [
        { periodo: { fecha_inicio: 'desc' } },
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    return NextResponse.json({
      exito: true,
      datos: horarios
    });
  } catch (error: any) {
    console.error('Error obteniendo horarios del docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
