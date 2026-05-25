import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datos = await request.json();
    const id = parseInt(params.id);

    // Si el período está finalizado, no permitir cambios de estado
    const periodoActual = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: id }
    });

    if (periodoActual?.estado === 'finalizado' && datos.estado && datos.estado !== 'finalizado') {
      return NextResponse.json(
        { 
          exito: false, 
          mensaje: 'No se puede cambiar el estado de un período finalizado' 
        },
        { status: 400 }
      );
    }

    const periodo = await prisma.periodoAcademico.update({
      where: { id_periodo: id },
      data: datos
    });

    return NextResponse.json({
      exito: true,
      datos: periodo,
      mensaje: 'Período actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando período:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
