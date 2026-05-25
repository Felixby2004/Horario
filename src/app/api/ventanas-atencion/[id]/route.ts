import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ventana = await prisma.ventanaAtencion.findUnique({
      where: { id_ventana: id },
      include: { periodo: true }
    });

    if (!ventana) {
      return NextResponse.json({ exito: false, mensaje: 'Ventana no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ exito: true, datos: ventana });
  } catch (error: any) {
    console.error('Error obteniendo ventana:', error);
    return NextResponse.json({ exito: false, mensaje: error.message }, { status: 500 });
  }
}
