import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function calcularHorasCarga(id_docente: number, carga: any) {
  const docenteCursos = await prisma.docenteCurso.findMany({
    where: {
      id_docente,
      activo: true
    }
  });
  const horasLectivas = docenteCursos.reduce((total, dc) => total + (dc.horas_asignadas || 0), 0);

  const horasNoLectivas = carga.actividades_no_lectivas.reduce(
    (sum: number, act: any) => sum + (act.horas_semanales || 0),
    0
  );

  const horasPreparacion = Math.ceil(horasLectivas * 0.5);
  const horasTotales = horasLectivas + horasPreparacion + horasNoLectivas;

  return {
    horasLectivas,
    horasNoLectivas,
    horasPreparacion,
    horasTotales
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docenteId = searchParams.get('docenteId');
    const periodoId = searchParams.get('periodoId');

    const where: any = {};
    if (docenteId) where.id_docente = parseInt(docenteId);
    if (periodoId) where.id_periodo = parseInt(periodoId);

    let cargas = await prisma.cargaAcademica.findMany({
      where,
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
                curso: true,
                ambiente: true
              }
            },
            cursos: {
              where: { activo: true },
              include: { curso: true }
            }
          }
        },
        periodo: true,
        actividades_no_lectivas: true,
        historial: true
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    for (const carga of cargas) {
      const horas = await calcularHorasCarga(carga.id_docente, carga);
      
      await prisma.cargaAcademica.update({
        where: { id_carga: carga.id_carga },
        data: {
          horas_lectivas: horas.horasLectivas,
          horas_no_lectivas: horas.horasNoLectivas,
          horas_preparacion: horas.horasPreparacion,
          horas_totales: horas.horasTotales
        }
      });
    }

    cargas = await prisma.cargaAcademica.findMany({
      where,
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
                curso: true,
                ambiente: true
              }
            },
            cursos: {
              where: { activo: true },
              include: { curso: true }
            }
          }
        },
        periodo: true,
        actividades_no_lectivas: true,
        historial: true
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    return NextResponse.json({ exito: true, datos: cargas });
  } catch (error: any) {
    console.error('Error en GET carga-academica:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    if (!datos.id_docente || !datos.id_periodo) {
      return NextResponse.json(
        { 
          exito: false, 
          mensaje: 'Faltan campos requeridos: id_docente, id_periodo' 
        },
        { status: 400 }
      );
    }

    let carga = await prisma.cargaAcademica.create({
      data: {
        id_docente: parseInt(datos.id_docente),
        id_periodo: parseInt(datos.id_periodo),
        estado: datos.estado || 'borrador',
        observaciones: datos.observaciones || null
      },
      include: { actividades_no_lectivas: true }
    });

    const horas = await calcularHorasCarga(carga.id_docente, carga);

    carga = await prisma.cargaAcademica.update({
      where: { id_carga: carga.id_carga },
      data: {
        horas_lectivas: horas.horasLectivas,
        horas_no_lectivas: horas.horasNoLectivas,
        horas_preparacion: horas.horasPreparacion,
        horas_totales: horas.horasTotales
      },
      include: { actividades_no_lectivas: true }
    });

    return NextResponse.json({
      exito: true,
      datos: carga,
      mensaje: 'Carga académica creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en POST carga-academica:', error);
    return NextResponse.json(
      { 
        exito: false, 
        mensaje: error.message || 'Error al crear carga académica' 
      },
      { status: 500 }
    );
  }
}
