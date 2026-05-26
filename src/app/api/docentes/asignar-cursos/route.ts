import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/docentes/asignar-cursos
 * Obtiene los cursos asignados a un docente específico
 * Parámetros:
 * - id_docente: ID del docente (requerido)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_docente = searchParams.get('id_docente');

    if (!id_docente) {
      return NextResponse.json(
        { exito: false, error: 'id_docente es requerido' },
        { status: 400 }
      );
    }

    const cursos = await prisma.docenteCurso.findMany({
      where: {
        id_docente: parseInt(id_docente),
        activo: true
      },
      include: {
        curso: {
          select: {
            id_curso: true,
            codigo: true,
            nombre: true,
            horas_teoria: true,
            horas_laboratorio: true,
            horas_practica: true,
            creditos: true,
            ciclo: true
          }
        }
      },
      orderBy: { fecha_asignacion: 'desc' }
    });

    // Calcular horas totales basándose en horas_asignadas de cada DocenteCurso
    const horasTotales = cursos.reduce((total, dc) => {
      return total + (dc.horas_asignadas || 0);
    }, 0);

    return NextResponse.json({
      exito: true,
      datos: cursos,
      horas_totales: horasTotales,
      total: cursos.length
    });
  } catch (error: any) {
    console.error('Error obteniendo cursos asignados:', error);
    return NextResponse.json(
      { 
        exito: false,
        error: error.message || 'Error al obtener cursos'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/docentes/asignar-cursos
 * Asigna un curso a un docente con horas específicas
 * Body:
 * {
 *   id_docente: number,
 *   id_curso: number,
 *   tipo_clase: "teoria" | "laboratorio" | "practica",
 *   horas_asignadas: number,  // Cuántas horas enseña este docente
 *   experiencia_anios?: number,
 *   prioridad?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const { id_docente, id_curso, tipo_clase, horas_asignadas, experiencia_anios, prioridad } = datos;

    // Validaciones
    if (!id_docente || !id_curso || !tipo_clase || !horas_asignadas) {
      return NextResponse.json(
        { exito: false, error: 'id_docente, id_curso, tipo_clase y horas_asignadas son requeridos' },
        { status: 400 }
      );
    }

    if (horas_asignadas < 1 || horas_asignadas > 40) {
      return NextResponse.json(
        { exito: false, error: 'Las horas asignadas deben estar entre 1 y 40' },
        { status: 400 }
      );
    }

    // Obtener docente
    const docente = await prisma.docente.findUnique({
      where: { id_docente }
    });

    if (!docente) {
      return NextResponse.json(
        { exito: false, error: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener curso
    const curso = await prisma.curso.findUnique({
      where: { id_curso }
    });

    if (!curso) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Obtener horas totales actuales del docente (SUM de horas_asignadas)
    const cursosAsignados = await prisma.docenteCurso.findMany({
      where: {
        id_docente,
        activo: true
      },
      select: {
        horas_asignadas: true
      }
    });

    const horasActuales = cursosAsignados.reduce((total, dc) => total + (dc.horas_asignadas || 0), 0);
    const horasTotalesNuevas = horasActuales + horas_asignadas;

    // Validar que no exceda horas máximas
    if (horasTotalesNuevas > docente.horas_maximas_semanales) {
      return NextResponse.json(
        {
          exito: false,
          error: `Exceso de horas. Horas actuales: ${horasActuales}, Horas a asignar: ${horas_asignadas}, Total: ${horasTotalesNuevas}, Máximo permitido: ${docente.horas_maximas_semanales}`,
          horas_actuales: horasActuales,
          horas_a_asignar: horas_asignadas,
          horas_totales: horasTotalesNuevas,
          horas_maximas: docente.horas_maximas_semanales
        },
        { status: 400 }
      );
    }

    // Crear o actualizar la asignación de docente-curso
    const docenteCurso = await prisma.docenteCurso.upsert({
      where: {
        id_docente_id_curso_tipo_clase: {
          id_docente,
          id_curso,
          tipo_clase: tipo_clase as any
        }
      },
      update: {
        horas_asignadas,
        experiencia_anios: experiencia_anios || 0,
        prioridad: prioridad || 1,
        activo: true
      },
      create: {
        id_docente,
        id_curso,
        tipo_clase: tipo_clase as any,
        horas_asignadas,
        experiencia_anios: experiencia_anios || 0,
        prioridad: prioridad || 1
      },
      include: {
        curso: {
          select: {
            id_curso: true,
            codigo: true,
            nombre: true,
            horas_teoria: true,
            horas_laboratorio: true,
            horas_practica: true
          }
        }
      }
    });

    // Actualizar horas totales del docente
    await prisma.docente.update({
      where: { id_docente },
      data: { 
        horas_totales_asignadas: horasTotalesNuevas 
      }
    });

    return NextResponse.json({
      exito: true,
      datos: docenteCurso,
      horas_totales_asignadas: horasTotalesNuevas,
      mensaje: `Curso asignado exitosamente. Docente enseñará ${horas_asignadas} horas en este curso.`
    });
  } catch (error: any) {
    console.error('Error asignando curso:', error);
    return NextResponse.json(
      { 
        exito: false,
        error: error.message || 'Error al asignar curso',
        detalles: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/docentes/asignar-cursos
 * Desasigna un curso de un docente
 * Body:
 * {
 *   id_docente: number,
 *   id_curso: number
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const datos = await request.json();
    const { id_docente, id_curso } = datos;

    if (!id_docente || !id_curso) {
      return NextResponse.json(
        { exito: false, error: 'id_docente e id_curso son requeridos' },
        { status: 400 }
      );
    }

    // Desasignar todos los tipos de clase de este curso del docente
    await prisma.docenteCurso.deleteMany({
      where: {
        id_docente,
        id_curso
      }
    });

    // Recalcular horas totales del docente basándose en horas_asignadas
    const cursosAsignados = await prisma.docenteCurso.findMany({
      where: { id_docente, activo: true }
    });

    const horasTotales = cursosAsignados.reduce((total, dc) => {
      return total + (dc.horas_asignadas || 0);
    }, 0);

    // Actualizar horas totales del docente
    await prisma.docente.update({
      where: { id_docente },
      data: { horas_totales_asignadas: horasTotales }
    });

    return NextResponse.json({
      exito: true,
      horas_totales_asignadas: horasTotales,
      mensaje: 'Curso desasignado exitosamente'
    });
  } catch (error: any) {
    console.error('Error desasignando curso:', error);
    return NextResponse.json(
      { 
        exito: false,
        error: error.message || 'Error al desasignar curso',
        detalles: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}
