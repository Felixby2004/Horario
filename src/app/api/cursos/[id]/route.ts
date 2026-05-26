import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id_curso: parseInt(params.id) },
      include: {
        grupos: {
          include: {
            docente: true
          }
        }
      }
    });

    if (!curso) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exito: true, datos: curso });
  } catch (error: any) {
    console.error('Error obteniendo curso:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_curso = parseInt(params.id);
    const datos = await request.json();

    // Validar que el curso existe
    const cursoExistente = await prisma.curso.findUnique({
      where: { id_curso }
    });

    if (!cursoExistente) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Validar datos
    if (datos.nombre && !datos.nombre.trim()) {
      return NextResponse.json(
        { exito: false, error: 'El nombre no puede estar vacío' },
        { status: 400 }
      );
    }

    if (
      (datos.horas_teoria !== undefined && datos.horas_teoria < 0) ||
      (datos.horas_laboratorio !== undefined && datos.horas_laboratorio < 0) ||
      (datos.horas_practica !== undefined && datos.horas_practica < 0)
    ) {
      return NextResponse.json(
        { exito: false, error: 'Las horas no pueden ser negativas' },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.update({
      where: { id_curso },
      data: {
        nombre: datos.nombre || cursoExistente.nombre,
        horas_teoria: datos.horas_teoria ?? cursoExistente.horas_teoria,
        horas_laboratorio: datos.horas_laboratorio ?? cursoExistente.horas_laboratorio,
        horas_practica: datos.horas_practica ?? cursoExistente.horas_practica,
        creditos: datos.creditos ?? cursoExistente.creditos,
        ciclo: datos.ciclo ?? cursoExistente.ciclo
      }
    });

    return NextResponse.json({
      exito: true,
      datos: curso,
      mensaje: 'Curso actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando curso:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'Error al actualizar el curso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_curso = parseInt(params.id);

    // Validar que el curso existe
    const curso = await prisma.curso.findUnique({
      where: { id_curso }
    });

    if (!curso) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Cambiar estado a inactivo
    await prisma.curso.update({
      where: { id_curso },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Curso "${curso.nombre}" eliminado exitosamente`
    });
  } catch (error: any) {
    console.error('Error eliminando curso:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'Error al eliminar el curso' },
      { status: 500 }
    );
  }
}
