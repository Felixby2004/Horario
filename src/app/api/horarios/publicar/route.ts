import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id_periodo } = await request.json();

    const resultado = await prisma.horarioAsignado.updateMany({
      where: {
        id_periodo,
        estado: 'confirmado'
      },
      data: {
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });

    return NextResponse.json({
      exito: true,
      mensaje: `${resultado.count} horarios publicados exitosamente`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
