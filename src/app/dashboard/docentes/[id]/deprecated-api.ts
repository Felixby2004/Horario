// DEPRECATED: This file's functionality has been moved to /api/docentes/[id]/route.ts
// Keeping this as reference only - do not use

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docente = await prisma.docente.findUnique({
      where: { id_docente: parseInt(params.id) },
      include: {
        usuario: true
      }
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exito: true, datos: docente });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datos = await request.json();

    const docente = await prisma.docente.update({
      where: { id_docente: parseInt(params.id) },
      data: {
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        modalidad: datos.modalidad,
        categoria: datos.categoria,
        antiguedad: datos.antiguedad,
        correo_electronico: datos.correo_electronico,
        telefono: datos.telefono,
        grado_academico: datos.grado_academico,
        especialidad: datos.especialidad
      }
    });

    return NextResponse.json({
      exito: true,
      datos: docente,
      mensaje: 'Docente actualizado exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.docente.update({
      where: { id_docente: parseInt(params.id) },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Docente desactivado exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
