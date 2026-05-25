import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ambiente = await prisma.ambiente.findUnique({
      where: { id_ambiente: id }
    });

    if (!ambiente) {
      return NextResponse.json(
        { exito: false, mensaje: 'Ambiente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      datos: ambiente
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const datos = await request.json();

    const ambiente = await prisma.ambiente.update({
      where: { id_ambiente: id },
      data: {
        ...(datos.codigo && { codigo: datos.codigo }),
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.tipo && { tipo: datos.tipo }),
        ...(datos.capacidad && { capacidad: datos.capacidad }),
        ...(datos.piso !== undefined && { piso: datos.piso }),
        ...(datos.pabellon !== undefined && { pabellon: datos.pabellon }),
        ...(datos.equipamiento !== undefined && { equipamiento: datos.equipamiento }),
        ...(datos.caracteristicas !== undefined && { caracteristicas: datos.caracteristicas }),
        ...(datos.observaciones !== undefined && { observaciones: datos.observaciones }),
        ...(datos.activo !== undefined && { activo: datos.activo })
      }
    });

    return NextResponse.json({
      exito: true,
      datos: ambiente,
      mensaje: 'Ambiente actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando ambiente:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Soft delete: marcar como inactivo
    await prisma.ambiente.update({
      where: { id_ambiente: id },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Ambiente desactivado exitosamente'
    });
  } catch (error: any) {
    console.error('Error desactivando ambiente:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
