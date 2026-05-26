import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const docente = await prisma.docente.findUnique({
      where: { id_docente: id },
      include: {
        usuario: true
      }
    });

    if (!docente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Docente no encontrado'
      }, { status: 404 });
    }

    // Recalcular antigüedad dinámicamente
    if (docente.fecha_ingreso) {
      docente.antiguedad = utilidadesFecha.calcularAntiguedad(docente.fecha_ingreso);
    }

    return NextResponse.json({
      exito: true,
      datos: docente
    });
  } catch (error: any) {
    console.error('Error obteniendo docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Si se actualiza la fecha de ingreso, recalculamos la antigüedad
    if (body.fecha_ingreso) {
      body.antiguedad = utilidadesFecha.calcularAntiguedad(body.fecha_ingreso);
      body.fecha_ingreso = new Date(body.fecha_ingreso);
    }

    const docente = await prisma.docente.update({
      where: { id_docente: id },
      data: body
    });

    return NextResponse.json({
      exito: true,
      datos: docente
    });
  } catch (error: any) {
    console.error('Error actualizando docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.docente.delete({
      where: { id_docente: id }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Docente eliminado'
    });
  } catch (error: any) {
    console.error('Error eliminando docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
