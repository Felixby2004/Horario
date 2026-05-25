import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Obtener horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const horario = await prisma.horarioAsignado.findUnique({
      where: { id_asignacion: id },
      include: {
        docente: { select: { id_docente: true, nombres: true, apellidos: true, codigo_docente: true } },
        curso: { select: { id_curso: true, codigo: true, nombre: true } },
        grupo: { select: { id_grupo: true, codigo_grupo: true, capacidad_maxima: true } },
        ambiente: { select: { id_ambiente: true, codigo: true, nombre: true, capacidad: true } }
      }
    });

    if (!horario) {
      return NextResponse.json(
        { exito: false, error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      datos: horario
    });
  } catch (error: any) {
    console.error('Error obteniendo horario:', error);
    return NextResponse.json(
      { exito: false, error: 'Error al obtener horario' },
      { status: 500 }
    );
  }
}

// PUT: Editar horario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const { dia_semana, hora_inicio, hora_fin, id_ambiente, observaciones } = body;

    // Validar que existe
    const horarioExistente = await prisma.horarioAsignado.findUnique({
      where: { id_asignacion: id }
    });

    if (!horarioExistente) {
      return NextResponse.json(
        { exito: false, error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar
    const horarioActualizado = await prisma.horarioAsignado.update({
      where: { id_asignacion: id },
      data: {
        ...(dia_semana !== undefined && { dia_semana }),
        ...(hora_inicio && { hora_inicio }),
        ...(hora_fin && { hora_fin }),
        ...(id_ambiente && { id_ambiente }),
        ...(observaciones !== undefined && { observaciones })
      },
      include: {
        docente: { select: { id_docente: true, nombres: true, apellidos: true, codigo_docente: true } },
        curso: { select: { id_curso: true, codigo: true, nombre: true } },
        grupo: { select: { id_grupo: true, codigo_grupo: true } },
        ambiente: { select: { id_ambiente: true, codigo: true, nombre: true } }
      }
    });

    return NextResponse.json({
      exito: true,
      datos: horarioActualizado,
      mensaje: 'Horario actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando horario:', error);
    return NextResponse.json(
      { exito: false, error: 'Error al actualizar horario' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar que el horario existe antes de intentar eliminar
    const horario = await prisma.horarioAsignado.findUnique({
      where: { id_asignacion: id },
      include: {
        auditorias: true
      }
    });

    if (!horario) {
      return NextResponse.json({
        exito: false,
        mensaje: 'El horario no existe o ya fue eliminado'
      }, { status: 404 });
    }

    // Usar transacción para eliminar referencias antes que el horario
    await prisma.$transaction(async (tx) => {
      // Eliminar auditorías asociadas si existen
      if (horario.auditorias && horario.auditorias.length > 0) {
        await tx.auditoriaHorario.deleteMany({
          where: { id_asignacion: id }
        });
      }

      // Finalmente, eliminar el horario
      await tx.horarioAsignado.delete({
        where: { id_asignacion: id }
      });
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Horario eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error eliminando horario:', error);
    return NextResponse.json({
      exito: false,
      mensaje: `Error al eliminar: ${error.message}`
    }, { status: 500 });
  }
}
