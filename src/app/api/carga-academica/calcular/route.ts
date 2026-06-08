import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Función auxiliar para calcular las horas de una carga académica
async function calcularHorasCarga(id_docente: number, carga: any) {
  // Calcular horas lectivas
  const docenteCursos = await prisma.docenteCurso.findMany({
    where: {
      id_docente: id_docente,
      activo: true
    }
  });
  const horasLectivas = docenteCursos.reduce((total, dc) => total + (dc.horas_asignadas || 0), 0);

  // Calcular horas no lectivas
  const horasNoLectivas = carga.actividades_no_lectivas.reduce(
    (sum: number, act: any) => sum + (act.horas_semanales || 0),
    0
  );

  // Calcular horas de preparación
  const horasPreparacion = Math.ceil(horasLectivas * 0.5);

  // Calcular horas totales
  const horasTotales = horasLectivas + horasPreparacion + horasNoLectivas;

  return {
    horasLectivas,
    horasNoLectivas,
    horasPreparacion,
    horasTotales
  };
}

// Calcular carga académica para un docente y período
export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const { id_docente, id_periodo } = datos;

    if (!id_docente || !id_periodo) {
      return NextResponse.json(
        { 
          exito: false, 
          mensaje: 'Faltan campos requeridos: id_docente, id_periodo' 
        },
        { status: 400 }
      );
    }

    // Obtener docente
    const docente = await prisma.docente.findUnique({
      where: { id_docente: parseInt(id_docente) }
    });

    if (!docente) {
      return NextResponse.json(
        { exito: false, mensaje: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    // Paso 1: Obtener o crear carga académica
    let carga = await prisma.cargaAcademica.findFirst({
      where: {
        id_docente: parseInt(id_docente),
        id_periodo: parseInt(id_periodo)
      },
      include: { actividades_no_lectivas: true }
    });

    if (!carga) {
      carga = await prisma.cargaAcademica.create({
        data: {
          id_docente: parseInt(id_docente),
          id_periodo: parseInt(id_periodo)
        },
        include: { actividades_no_lectivas: true }
      });
    }

    // Paso 2: Calcular horas
    const horas = await calcularHorasCarga(carga.id_docente, carga);

    // Paso 3: Actualizar la carga académica
    const cargaActualizada = await prisma.cargaAcademica.update({
      where: { id_carga: carga.id_carga },
      data: {
        horas_lectivas: horas.horasLectivas,
        horas_preparacion: horas.horasPreparacion,
        horas_no_lectivas: horas.horasNoLectivas,
        horas_totales: horas.horasTotales
      },
      include: {
        docente: true,
        periodo: true,
        actividades_no_lectivas: true,
        historial: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: {
        carga: cargaActualizada,
        calculos: horas
      },
      mensaje: 'Carga académica calculada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en POST carga-academica/calcular:', error);
    return NextResponse.json(
      { 
        exito: false, 
        mensaje: error.message || 'Error al calcular carga académica' 
      },
      { status: 500 }
    );
  }
}
