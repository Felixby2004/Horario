import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validarAsignacionActividadNoLectiva } from '@/lib/cargaNoLectiva';

export const dynamic = 'force-dynamic';

// Función auxiliar para calcular todas las horas de una carga académica
async function actualizarHorasCargaAcademica(idCarga: number) {
  // Obtener la carga
  const carga = await prisma.cargaAcademica.findUnique({
    where: { id_carga: idCarga },
    include: { actividades_no_lectivas: true }
  });

  if (!carga) return;

  // Calcular horas lectivas
  const docenteCursos = await prisma.docenteCurso.findMany({
    where: {
      id_docente: carga.id_docente,
      activo: true
    }
  });
  const horasLectivas = docenteCursos.reduce((total, dc) => total + (dc.horas_asignadas || 0), 0);

  // Calcular horas no lectivas
  const horasNoLectivas = carga.actividades_no_lectivas.reduce(
    (sum, act) => sum + (act.horas_semanales || 0),
    0
  );

  // Calcular horas de preparación
  const horasPreparacion = Math.ceil(horasLectivas * 0.5);

  // Calcular horas totales
  const horasTotales = horasLectivas + horasPreparacion + horasNoLectivas;

  // Actualizar la carga
  await prisma.cargaAcademica.update({
    where: { id_carga: idCarga },
    data: {
      horas_lectivas: horasLectivas,
      horas_preparacion: horasPreparacion,
      horas_no_lectivas: horasNoLectivas,
      horas_totales: horasTotales
    }
  });
}

// Obtener una actividad por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const actividad = await prisma.actividadNoLectiva.findUnique({
      where: { id_actividad: id },
      include: { carga_academica: true }
    });

    if (!actividad) {
      return NextResponse.json(
        { exito: false, mensaje: 'Actividad no lectiva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exito: true, datos: actividad });
  } catch (error: any) {
    console.error('Error en GET actividad-no-lectiva/[id]:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Actualizar una actividad no lectiva
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const datos = await request.json();

    const actividadActual = await prisma.actividadNoLectiva.findUnique({
      where: { id_actividad: id },
      include: {
        carga_academica: {
          include: {
            docente: {
              include: {
                departamento: true
              }
            },
            actividades_no_lectivas: true
          }
        }
      }
    });

    if (!actividadActual) {
      return NextResponse.json(
        { exito: false, mensaje: 'Actividad no lectiva no encontrada' },
        { status: 404 }
      );
    }

    const validacion = validarAsignacionActividadNoLectiva({
      docente: actividadActual.carga_academica?.docente,
      actividad: {
        id_actividad: id,
        tipo_actividad:
          datos.tipo_actividad !== undefined ? datos.tipo_actividad : actividadActual.tipo_actividad,
        horas_semanales:
          datos.horas_semanales !== undefined ? datos.horas_semanales : actividadActual.horas_semanales,
        datos_sustento:
          datos.datos_sustento !== undefined ? datos.datos_sustento : actividadActual.datos_sustento
      },
      actividadesExistentes: actividadActual.carga_academica?.actividades_no_lectivas || [],
      horasLectivas: actividadActual.carga_academica?.horas_lectivas
    });

    if (!validacion.valido) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: validacion.mensaje,
          limite: validacion.limite,
          horas_acumuladas: validacion.horasAcumuladas,
          horas_disponibles: validacion.horasDisponibles,
          modalidad: validacion.modalidad
        },
        { status: 400 }
      );
    }

    const actividad = await prisma.actividadNoLectiva.update({
      where: { id_actividad: id },
      data: {
        tipo_actividad: datos.tipo_actividad !== undefined ? datos.tipo_actividad : undefined,
        nombre: datos.nombre !== undefined ? datos.nombre : undefined,
        descripcion: datos.descripcion !== undefined ? datos.descripcion : undefined,
        horas_semanales: datos.horas_semanales !== undefined ? datos.horas_semanales : undefined,
        dias_semana: datos.dias_semana !== undefined ? datos.dias_semana : undefined,
        fecha_inicio: datos.fecha_inicio !== undefined ? (datos.fecha_inicio ? new Date(datos.fecha_inicio) : null) : undefined,
        fecha_fin: datos.fecha_fin !== undefined ? (datos.fecha_fin ? new Date(datos.fecha_fin) : null) : undefined,
        datos_adicionales: datos.datos_adicionales !== undefined ? datos.datos_adicionales : undefined,
        datos_sustento: datos.datos_sustento !== undefined ? datos.datos_sustento : undefined,
        horarios_actividad: datos.horarios_actividad !== undefined ? datos.horarios_actividad : undefined
      }
    });

    // Recalcular todas las horas en carga académica
    await actualizarHorasCargaAcademica(actividad.id_carga);

    return NextResponse.json({
      exito: true,
      datos: actividad,
      mensaje: 'Actividad no lectiva actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en PUT actividad-no-lectiva/[id]:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || 'Error al actualizar actividad no lectiva' },
      { status: 500 }
    );
  }
}

// Eliminar una actividad no lectiva
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const actividad = await prisma.actividadNoLectiva.findUnique({
      where: { id_actividad: id }
    });

    if (!actividad) {
      return NextResponse.json(
        { exito: false, mensaje: 'Actividad no lectiva no encontrada' },
        { status: 404 }
      );
    }

    const idCarga = actividad.id_carga;

    await prisma.actividadNoLectiva.delete({
      where: { id_actividad: id }
    });

    // Recalcular todas las horas en carga académica
    await actualizarHorasCargaAcademica(idCarga);

    return NextResponse.json({
      exito: true,
      mensaje: 'Actividad no lectiva eliminada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en DELETE actividad-no-lectiva/[id]:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || 'Error al eliminar actividad no lectiva' },
      { status: 500 }
    );
  }
}
