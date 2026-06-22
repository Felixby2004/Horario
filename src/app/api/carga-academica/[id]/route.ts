import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerHorasMetaDocente, validarEnvioCargaAcademica } from '@/lib/cargaAcademica';

export const dynamic = 'force-dynamic';

// Obtener una carga académica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const carga = await prisma.cargaAcademica.findUnique({
      where: { id_carga: id },
      include: {
        docente: {
          include: {
            facultad: true,
            departamento: true,
            horarios: {
              include: {
                grupo: {
                  include: {
                    curso: true
                  }
                },
                ambiente: true
              }
            }
          }
        },
        periodo: true,
        actividades_no_lectivas: true,
        historial: {
          orderBy: { fecha_creacion: 'desc' },
          include: { usuario: true }
        }
      }
    });

    if (!carga) {
      return NextResponse.json(
        { exito: false, mensaje: 'Carga académica no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exito: true, datos: carga });
  } catch (error: any) {
    console.error('Error en GET carga-academica/[id]:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Actualizar una carga académica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const datos = await request.json();

    const cargaAnterior = await prisma.cargaAcademica.findUnique({
      where: { id_carga: id },
      include: {
        docente: {
          include: {
            departamento: true
          }
        },
        actividades_no_lectivas: true
      }
    });

    if (!cargaAnterior) {
      return NextResponse.json(
        { exito: false, mensaje: 'Carga académica no encontrada' },
        { status: 404 }
      );
    }

    const horasLectivas = datos.horas_lectivas !== undefined ? Number(datos.horas_lectivas) : cargaAnterior.horas_lectivas;
    const horasNoLectivas =
      datos.horas_no_lectivas !== undefined ? Number(datos.horas_no_lectivas) : cargaAnterior.horas_no_lectivas;
    const horasPreparacion =
      datos.horas_preparacion !== undefined ? Number(datos.horas_preparacion) : cargaAnterior.horas_preparacion;
    const horasTotales =
      datos.horas_totales !== undefined
        ? Number(datos.horas_totales)
        : horasLectivas + horasNoLectivas;
    const horasMeta =
      datos.horas_meta !== undefined
        ? Number(datos.horas_meta)
        : obtenerHorasMetaDocente(cargaAnterior.docente, cargaAnterior);

    if (datos.estado === 'enviado') {
      const validacionEnvio = validarEnvioCargaAcademica({
        docente: cargaAnterior.docente,
        carga: {
          horas_lectivas: horasLectivas,
          horas_no_lectivas: horasNoLectivas,
          horas_preparacion: horasPreparacion,
          horas_totales: horasTotales,
          horas_meta: horasMeta
        },
        actividades: cargaAnterior.actividades_no_lectivas || []
      });

      if (!validacionEnvio.valido) {
        return NextResponse.json(
          {
            exito: false,
            mensaje: validacionEnvio.mensaje,
            modalidad: validacionEnvio.modalidad,
            rubros_faltantes: validacionEnvio.rubrosFaltantes,
            horas_meta: validacionEnvio.horasMeta,
            horas_totales: validacionEnvio.horasTotales
          },
          { status: 400 }
        );
      }
    }

    const carga = await prisma.cargaAcademica.update({
      where: { id_carga: id },
      data: {
        horas_lectivas: datos.horas_lectivas !== undefined ? horasLectivas : undefined,
        horas_no_lectivas: datos.horas_no_lectivas !== undefined ? horasNoLectivas : undefined,
        horas_preparacion: datos.horas_preparacion !== undefined ? horasPreparacion : undefined,
        horas_totales: datos.horas_totales !== undefined ? horasTotales : undefined,
        horas_meta: horasMeta,
        estado: datos.estado !== undefined ? datos.estado : undefined,
        observaciones: datos.observaciones !== undefined ? datos.observaciones : undefined,
        observaciones_generales: datos.observaciones_generales !== undefined ? datos.observaciones_generales : undefined,
        fecha_envio: datos.fecha_envio !== undefined ? (datos.fecha_envio ? new Date(datos.fecha_envio) : null) : undefined,
        fecha_aprobacion: datos.fecha_aprobacion !== undefined ? (datos.fecha_aprobacion ? new Date(datos.fecha_aprobacion) : null) : undefined,
        aprobado_por: datos.aprobado_por !== undefined ? datos.aprobado_por : undefined
      }
    });

    // Registrar en historial
    if (datos.estado && datos.usuario_id) {
      await prisma.historialCargaAcademica.create({
        data: {
          id_carga: id,
          id_usuario: datos.usuario_id,
          estado_anterior: cargaAnterior.estado,
          estado_nuevo: datos.estado,
          observaciones: datos.observaciones || null
        }
      });
    }

    return NextResponse.json({
      exito: true,
      datos: carga,
      mensaje: 'Carga académica actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en PUT carga-academica/[id]:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || 'Error al actualizar carga académica' },
      { status: 500 }
    );
  }
}

// Eliminar una carga académica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.cargaAcademica.delete({
      where: { id_carga: id }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Carga académica eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en DELETE carga-academica/[id]:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || 'Error al eliminar carga académica' },
      { status: 500 }
    );
  }
}
