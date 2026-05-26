import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json().catch(() => ({}));
    const motivo = body.motivo || 'Sin motivo especificado';

    const solicitud = await prisma.horarioAsignado.findUnique({
      where: { id_asignacion: id }
    });

    if (!solicitud) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Solicitud no encontrada'
      }, { status: 404 });
    }

    if (!['solicitado', 'borrador'].includes(solicitud.estado)) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Solo se pueden rechazar solicitudes pendientes'
      }, { status: 400 });
    }

    await prisma.horarioAsignado.update({
      where: { id_asignacion: id },
      data: { 
        estado: 'cancelado',
        observaciones: motivo
      }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Solicitud rechazada'
    });
  } catch (error: any) {
    console.error('Error rechazando solicitud:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
