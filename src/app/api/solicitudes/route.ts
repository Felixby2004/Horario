import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    const where: any = {};
    
    if (estado && estado !== 'todos') {
      if (estado === 'solicitado') {
        where.estado = { in: ['solicitado', 'borrador'] };
      } else {
        where.estado = estado;
      }
    }

    const solicitudes = await prisma.horarioAsignado.findMany({
      where,
      include: {
        docente: true,
        curso: true,
        grupo: true,
        ambiente: true,
        periodo: true
      },
      orderBy: [
        { fecha_creacion: 'desc' }
      ]
    });

    return NextResponse.json({
      exito: true,
      datos: solicitudes
    });
  } catch (error: any) {
    console.error('Error obteniendo solicitudes:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
