import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ventanaAtencion.delete({
      where: { id_ventana: parseInt(params.id) }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Ventana eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando ventana:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
