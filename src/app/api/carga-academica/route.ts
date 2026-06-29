import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerHorasMetaDocente } from '@/lib/cargaAcademica';

export const dynamic = 'force-dynamic';

function parsearEnteroSeguro(valor: unknown) {
  const numero = Number.parseInt(String(valor), 10);
  return Number.isFinite(numero) ? numero : null;
}

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

  const horasPreparacion = Math.floor(horasLectivas * 0.5);
  const horasTotales = horasLectivas + horasNoLectivas;

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
    const docenteIdNumero = docenteId ? parsearEnteroSeguro(docenteId) : null;
    const periodoIdNumero = periodoId ? parsearEnteroSeguro(periodoId) : null;

    if (docenteId && docenteIdNumero === null) {
      return NextResponse.json(
        { exito: false, mensaje: 'El id del docente no es válido' },
        { status: 400 }
      );
    }

    if (periodoId && periodoIdNumero === null) {
      return NextResponse.json(
        { exito: false, mensaje: 'El id del período no es válido' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (docenteIdNumero !== null) where.id_docente = docenteIdNumero;
    if (periodoIdNumero !== null) where.id_periodo = periodoIdNumero;

    // First, check if we need to update the horas (only for single docente + periodo)
    if (docenteIdNumero && periodoIdNumero) {
      let carga = await prisma.cargaAcademica.findFirst({
        where,
        include: {
          docente: {
            include: {
              facultad: { select: { id_facultad: true, nombre: true } },
              departamento: { select: { id_departamento: true, nombre: true } },
              cursos: {
                where: { activo: true },
                include: { curso: true }
              }
            }
          },
          periodo: true,
          actividades_no_lectivas: true
        }
      });

      if (carga) {
        const horas = await calcularHorasCarga(carga.id_docente, carga);
        
        await prisma.cargaAcademica.update({
          where: { id_carga: carga.id_carga },
          data: {
            horas_lectivas: horas.horasLectivas,
            horas_no_lectivas: horas.horasNoLectivas,
            horas_preparacion: horas.horasPreparacion,
            horas_totales: horas.horasTotales,
            horas_meta: obtenerHorasMetaDocente(carga.docente, carga)
          }
        });
      }
    }

    // Fetch final data with only necessary fields
    const cargas = await prisma.cargaAcademica.findMany({
      where,
      include: {
        docente: {
          include: {
            facultad: { select: { id_facultad: true, nombre: true } },
            departamento: { select: { id_departamento: true, nombre: true } },
            cursos: {
              where: { activo: true },
              include: { curso: true }
            }
          }
        },
        periodo: true,
        actividades_no_lectivas: true
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
    const idDocente = parsearEnteroSeguro(datos.id_docente);
    const idPeriodo = parsearEnteroSeguro(datos.id_periodo);

    if (idDocente === null || idPeriodo === null) {
      return NextResponse.json(
        { 
          exito: false, 
          mensaje: 'Los campos id_docente e id_periodo deben ser válidos' 
        },
        { status: 400 }
      );
    }

    const docente = await prisma.docente.findUnique({
      where: { id_docente: idDocente },
      select: {
        id_docente: true,
        horas_maximas_semanales: true
      }
    });

    if (!docente) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'Docente no encontrado'
        },
        { status: 404 }
      );
    }

    let cargaExistente = await prisma.cargaAcademica.findFirst({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo
      },
      include: {
        actividades_no_lectivas: true
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    if (cargaExistente) {
      const horasExistentes = await calcularHorasCarga(cargaExistente.id_docente, cargaExistente);
      cargaExistente = await prisma.cargaAcademica.update({
        where: { id_carga: cargaExistente.id_carga },
        data: {
          horas_lectivas: horasExistentes.horasLectivas,
          horas_no_lectivas: horasExistentes.horasNoLectivas,
          horas_preparacion: horasExistentes.horasPreparacion,
          horas_totales: horasExistentes.horasTotales,
          horas_meta: docente.horas_maximas_semanales || cargaExistente.horas_meta || 40
        },
        include: { actividades_no_lectivas: true }
      });

      return NextResponse.json({
        exito: true,
        datos: cargaExistente,
        mensaje: 'La carga académica ya existía y fue actualizada.'
      });
    }

    let carga = await prisma.cargaAcademica.create({
      data: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: datos.estado || 'borrador',
        observaciones: datos.observaciones || null,
        horas_meta: docente.horas_maximas_semanales || 40
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
        horas_totales: horas.horasTotales,
        horas_meta: docente.horas_maximas_semanales || carga.horas_meta || 40
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
