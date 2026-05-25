import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: parseInt(params.id) },
      include: {
        curso: true,
        periodo: true
      }
    });

    if (!grupo) {
      return NextResponse.json(
        { exito: false, mensaje: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      datos: grupo
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
    const datos = await request.json();

    const grupo = await prisma.grupo.update({
      where: { id_grupo: parseInt(params.id) },
      data: {
        ...(datos.codigo_grupo && { codigo_grupo: datos.codigo_grupo }),
        ...(datos.capacidad_maxima && { capacidad_maxima: datos.capacidad_maxima }),
        ...(datos.cantidad_matriculados !== undefined && { cantidad_matriculados: datos.cantidad_matriculados }),
        ...(datos.observaciones !== undefined && { observaciones: datos.observaciones }),
        ...(datos.activo !== undefined && { activo: datos.activo })
      },
      include: {
        curso: true,
        periodo: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: grupo,
      mensaje: 'Grupo actualizado exitosamente'
    });
  } catch (error: any) {
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
    // Soft delete: marcar como inactivo en lugar de eliminar
    await prisma.grupo.update({
      where: { id_grupo: parseInt(params.id) },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Grupo desactivado exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
