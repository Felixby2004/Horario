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

  // Calcular horas de preparación: mitad truncada (sin aproximar)
  const horasPreparacion = Math.floor(horasLectivas * 0.5);

  // Calcular horas totales: sólo lectivas + no lectivas
  const horasTotales = horasLectivas + horasNoLectivas;

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

// Obtener actividades no lectivas (filtrar por carga académica o periodo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cargaId = searchParams.get('cargaId');
    const periodoId = searchParams.get('periodo');

    const where: any = {};
    if (cargaId) where.id_carga = parseInt(cargaId);
    if (periodoId) where.carga_academica = { id_periodo: parseInt(periodoId) };

    const actividades = await prisma.actividadNoLectiva.findMany({
      where,
      include: { carga_academica: { include: { docente: true } } },
      orderBy: { fecha_creacion: 'desc' }
    });

    return NextResponse.json({ exito: true, datos: actividades });
  } catch (error: any) {
    console.error('Error en GET actividad-no-lectiva:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Crear nueva actividad no lectiva
export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    if (!datos.id_carga || !datos.tipo_actividad || !datos.nombre) {
      return NextResponse.json(
        { 
          exito: false, 
          mensaje: 'Faltan campos requeridos: id_carga, tipo_actividad, nombre' 
        },
        { status: 400 }
      );
    }

    const idCarga = parseInt(datos.id_carga);
    const carga = await prisma.cargaAcademica.findUnique({
      where: { id_carga: idCarga },
      include: {
        docente: {
          include: {
            departamento: true
          }
        },
        actividades_no_lectivas: true
      }
    });

    if (!carga) {
      return NextResponse.json(
        { exito: false, mensaje: 'La carga académica no existe.' },
        { status: 404 }
      );
    }

    const validacion = validarAsignacionActividadNoLectiva({
      docente: carga.docente,
      actividad: {
        tipo_actividad: datos.tipo_actividad,
        horas_semanales: datos.horas_semanales,
        datos_sustento: datos.datos_sustento || null
      },
      actividadesExistentes: carga.actividades_no_lectivas || [],
      horasLectivas: carga.horas_lectivas
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

    const actividad = await prisma.actividadNoLectiva.create({
      data: {
        id_carga: idCarga,
        tipo_actividad: datos.tipo_actividad,
        nombre: datos.nombre,
        descripcion: datos.descripcion || null,
        horas_semanales: datos.horas_semanales || 0,
        dias_semana: datos.dias_semana || null,
        fecha_inicio: datos.fecha_inicio ? new Date(datos.fecha_inicio) : null,
        fecha_fin: datos.fecha_fin ? new Date(datos.fecha_fin) : null,
        datos_adicionales: datos.datos_adicionales || null,
        datos_sustento: datos.datos_sustento || null,
        horarios_actividad: datos.horarios_actividad || null
      }
    });

    // Recalcular todas las horas en carga académica
    await actualizarHorasCargaAcademica(parseInt(datos.id_carga));

    return NextResponse.json({
      exito: true,
      datos: actividad,
      mensaje: 'Actividad no lectiva creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en POST actividad-no-lectiva:', error);
    return NextResponse.json(
      { 
        exito: false, 
        mensaje: error.message || 'Error al crear actividad no lectiva' 
      },
      { status: 500 }
    );
  }
}
