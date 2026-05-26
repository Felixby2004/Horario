import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { verificarAutenticacion, verificarRol } from '@/lib/auth';
import { notificarCambioEstadoCitacion } from '@/lib/notificaciones';

/**
 * PATCH /api/citaciones/[id]
 * Actualiza una citación específica
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await verificarAutenticacion(request);
    await verificarRol(usuario.id_usuario, [
      'administrador_sistema',
      'coordinador_academico',
      'operador_horarios'
    ]);

    const id = parseInt(params.id);
    const body = await request.json();
    const { estado, observaciones, fecha_citacion, hora_inicio, hora_fin } = body;

    const citacionActualizada = await prisma.citacionDocente.update({
      where: { id_citacion: id },
      data: {
        estado: estado || undefined,
        observaciones: observaciones || undefined,
        fecha_citacion: fecha_citacion ? new Date(fecha_citacion) : undefined,
        hora_inicio: hora_inicio || undefined,
        hora_fin: hora_fin || undefined,
        fecha_actualizacion: new Date()
      }
    });

    // Notificar al docente si el estado cambió
    if (estado) {
      await notificarCambioEstadoCitacion(id, estado).catch(err => 
        console.error('Error enviando notificación de cambio de estado:', err)
      );
    }

    return NextResponse.json(citacionActualizada);
  } catch (error) {
    console.error('Error en PATCH /api/citaciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar citación' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/citaciones/[id]
 * Elimina una citación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await verificarAutenticacion(request);
    await verificarRol(usuario.id_usuario, [
      'administrador_sistema',
      'coordinador_academico',
      'operador_horarios'
    ]);

    const id = parseInt(params.id);

    await prisma.citacionDocente.delete({
      where: { id_citacion: id }
    });

    return NextResponse.json({ message: 'Citación eliminada correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/citaciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar citación' },
      { status: 500 }
    );
  }
}
