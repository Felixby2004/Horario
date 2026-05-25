import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/docentes/asistencia/route.ts
export async function GET_asistencia(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0];

    const docentes = await prisma.docente.findMany({
      where: { activo: true }
    });

    const asistencias = await Promise.all(
      docentes.map(async (docente) => {
        const registro = await prisma.asistenciaDocente.findFirst({
          where: {
            id_docente: docente.id_docente,
            fecha: new Date(fecha)
          }
        });

        return {
          ...docente,
          presente: registro?.presente || false
        };
      })
    );

    return NextResponse.json({ exito: true, datos: asistencias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_asistencia(request: NextRequest) {
  try {
    const { id_docente, fecha, presente } = await request.json();

    const asistencia = await prisma.asistenciaDocente.upsert({
      where: {
        id_docente_fecha: {
          id_docente,
          fecha: new Date(fecha)
        }
      },
      update: { presente },
      create: {
        id_docente,
        fecha: new Date(fecha),
        presente
      }
    });

    return NextResponse.json({ exito: true, datos: asistencia });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/docentes/evaluacion/route.ts
export async function POST_evaluacion(request: NextRequest) {
  try {
    const { id_docente, puntualidad, desempeño, comentarios } = await request.json();

    const evaluacion = await prisma.evaluacionDocente.create({
      data: {
        id_docente,
        puntualidad,
        desempeño,
        comentarios,
        fecha_evaluacion: new Date()
      }
    });

    return NextResponse.json({ exito: true, datos: evaluacion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/docentes/licencias/route.ts
export async function GET_licencias(request: NextRequest) {
  try {
    const licencias = await prisma.licenciaPermiso.findMany({
      include: {
        docente: true
      },
      orderBy: { fecha_inicio: 'desc' }
    });

    return NextResponse.json({ exito: true, datos: licencias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_licencia(request: NextRequest) {
  try {
    const datos = await request.json();

    const licencia = await prisma.licenciaPermiso.create({
      data: {
        id_docente: datos.id_docente,
        tipo: datos.tipo,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: new Date(datos.fecha_fin),
        motivo: datos.motivo,
        aprobado: false
      }
    });

    return NextResponse.json({ exito: true, datos: licencia });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/docentes/capacitaciones/route.ts
export async function GET_capacitaciones(request: NextRequest) {
  try {
    const capacitaciones = await prisma.capacitacion.findMany({
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json({ exito: true, datos: capacitaciones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_inscripcionCapacitacion(request: NextRequest) {
  try {
    const { id_capacitacion, id_docente } = await request.json();

    const inscripcion = await prisma.inscripcionCapacitacion.create({
      data: {
        id_capacitacion,
        id_docente,
        fecha_inscripcion: new Date()
      }
    });

    return NextResponse.json({ exito: true, datos: inscripcion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/docentes/estadisticas/route.ts
export async function GET_estadisticasDocentes(request: NextRequest) {
  try {
    const totalDocentes = await prisma.docente.count({
      where: { activo: true }
    });

    const porCategoria = await prisma.docente.groupBy({
      by: ['categoria'],
      where: { activo: true },
      _count: true
    });

    const porModalidad = await prisma.docente.groupBy({
      by: ['modalidad'],
      where: { activo: true },
      _count: true
    });

    return NextResponse.json({
      exito: true,
      datos: {
        total: totalDocentes,
        porCategoria,
        porModalidad
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/docentes/historial/route.ts
export async function GET_historialDocente(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idDocente = parseInt(params.id);

    const horarios = await prisma.horarioAsignado.findMany({
      where: { id_docente: idDocente },
      include: {
        curso: true,
        periodo: true,
        ambiente: true
      },
      orderBy: { creado_en: 'desc' },
      take: 50
    });

    const evaluaciones = await prisma.evaluacionDocente.findMany({
      where: { id_docente: idDocente },
      orderBy: { fecha_evaluacion: 'desc' }
    });

    const licencias = await prisma.licenciaPermiso.findMany({
      where: { id_docente: idDocente },
      orderBy: { fecha_inicio: 'desc' }
    });

    return NextResponse.json({
      exito: true,
      datos: {
        horarios,
        evaluaciones,
        licencias
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export {
  GET_asistencia,
  POST_asistencia,
  POST_evaluacion,
  GET_licencias,
  POST_licencia,
  GET_capacitaciones,
  POST_inscripcionCapacitacion,
  GET_estadisticasDocentes,
  GET_historialDocente
};
