import { NextRequest, NextResponse } from 'next/server';
import GeneradorHorariosAG from '@/services/horarios/AlgoritmoGenetico';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/horarios/generar-algoritmico
 * 
 * Genera horarios automáticamente usando un algoritmo genético.
 * 
 * Body:
 * {
 *   id_periodo: number,
 *   tamanio_poblacion?: number (default: 50),
 *   generaciones?: number (default: 100),
 *   probabilidad_cruzamiento?: number (default: 0.8),
 *   probabilidad_mutacion?: number (default: 0.1)
 * }
 * 
 * Response:
 * {
 *   exito: boolean,
 *   datos: {
 *     id_horario_generado: string,
 *     cantidad_asignaciones: number,
 *     aptitud: number,
 *     resumen: {
 *       docentes_cubiertos: number,
 *       grupos_cubiertos: number,
 *       conflictos_detectados: number
 *     }
 *   },
 *   mensaje: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id_periodo,
      tamanio_poblacion = 50,
      generaciones = 100,
      probabilidad_cruzamiento = 0.8,
      probabilidad_mutacion = 0.1,
      criterio_ordenamiento = 'combinado'
    } = body;

    // Validar parámetros
    if (!id_periodo) {
      return NextResponse.json(
        { exito: false, mensaje: 'El período académico es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el período existe
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo }
    });

    if (!periodo) {
      return NextResponse.json(
        { exito: false, mensaje: `Período ${id_periodo} no encontrado` },
        { status: 404 }
      );
    }

    console.log(`[API] Iniciando generación de horarios para período ${id_periodo}`);

    // Ejecutar algoritmo genético
    const generador = new GeneradorHorariosAG();
    const mejorCromosoma = await generador.ejecutar({
      id_periodo,
      tamanio_poblacion,
      generaciones,
      probabilidad_cruzamiento,
      probabilidad_mutacion,
      criterio_ordenamiento
    });

    const horariosGenerados = generador.obtenerHorarios(mejorCromosoma);

    if (horariosGenerados.length === 0) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: 'El algoritmo no pudo generar horarios válidos. Verifica que tengas docentes, cursos y ambientes configurados.'
        },
        { status: 400 }
      );
    }

    // Guardar horarios generados como borrador
    const idSesion = `AG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Limpiar selecciones temporales anteriores
    await prisma.seleccionTemporalHorario.deleteMany({
      where: {
        id_periodo,
        sesion_id: idSesion
      }
    });

    // Guardar las selecciones temporales con vencimiento de 24 horas
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    for (const horario of horariosGenerados) {
      await prisma.seleccionTemporalHorario.create({
        data: {
          id_docente: horario.id_docente,
          id_curso: horario.id_curso,
          id_grupo: horario.id_grupo,
          tipo_clase: horario.tipo_clase,
          id_ambiente: horario.id_ambiente,
          dia_semana: horario.dia_semana,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          id_periodo,
          sesion_id: idSesion,
          fecha_expiracion: fechaExpiracion
        }
      });
    }

    // Calcular estadísticas
    const docentesUnicos = new Set(horariosGenerados.map(h => h.id_docente));
    const gruposUnicos = new Set(horariosGenerados.map(h => h.id_grupo));
    const ambientesUnicos = new Set(horariosGenerados.map(h => h.id_ambiente));

    // Detectar conflictos potenciales
    let conflictosDetectados = 0;
    for (let i = 0; i < horariosGenerados.length; i++) {
      for (let j = i + 1; j < horariosGenerados.length; j++) {
        const h1 = horariosGenerados[i];
        const h2 = horariosGenerados[j];

        // Conflicto de docente
        if (h1.id_docente === h2.id_docente && 
            h1.dia_semana === h2.dia_semana &&
            tiemposSeSuperponen(h1.hora_inicio, h1.hora_fin, h2.hora_inicio, h2.hora_fin)) {
          conflictosDetectados++;
          continue;
        }

        // Conflicto de ambiente
        if (h1.id_ambiente === h2.id_ambiente && 
            h1.dia_semana === h2.dia_semana &&
            tiemposSeSuperponen(h1.hora_inicio, h1.hora_fin, h2.hora_inicio, h2.hora_fin)) {
          conflictosDetectados++;
        }
      }
    }

    const respuesta = {
      exito: true,
      datos: {
        id_sesion_generacion: idSesion,
        cantidad_asignaciones: horariosGenerados.length,
        aptitud: mejorCromosoma.aptitud.toFixed(2),
        resumen: {
          docentes_cubiertos: docentesUnicos.size,
          grupos_cubiertos: gruposUnicos.size,
          ambientes_utilizados: ambientesUnicos.size,
          conflictos_detectados: conflictosDetectados,
          porcentaje_aptitud: ((mejorCromosoma.aptitud / 100) * 100).toFixed(1)
        },
        instrucciones: {
          paso_1: 'Se ha generado un horario provisional que vence en 24 horas',
          paso_2: 'Revisa los conflictos detectados en la interfaz de visualización',
          paso_3: 'Haz ajustes manuales si es necesario',
          paso_4: 'Haz clic en "Guardar Definitivo" para guardar los horarios'
        }
      },
      mensaje: `Horarios generados exitosamente. ${horariosGenerados.length} asignaciones creadas con aptitud ${mejorCromosoma.aptitud.toFixed(2)}/100`
    };

    return NextResponse.json(respuesta, { status: 201 });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al generar horarios',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/horarios/generar-algoritmico
 * 
 * Obtiene el estado de las generaciones anteriores
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_periodo = searchParams.get('id_periodo');
    const sesion_id = searchParams.get('sesion_id');

    if (!id_periodo) {
      return NextResponse.json(
        { exito: false, mensaje: 'El período es requerido' },
        { status: 400 }
      );
    }

    // Si se proporciona sesión, retornar ese generación
    if (sesion_id) {
      const horarios = await prisma.seleccionTemporalHorario.findMany({
        where: {
          id_periodo: parseInt(id_periodo),
          sesion_id
        },
        include: {
          docente: true,
          curso: true,
          grupo: true,
          ambiente: true
        }
      });

      if (horarios.length === 0) {
        return NextResponse.json(
          { exito: false, mensaje: 'Sesión no encontrada o expirada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        exito: true,
        datos: {
          sesion_id,
          cantidad_horarios: horarios.length,
          horarios,
          fecha_expiracion: horarios[0].fecha_expiracion
        }
      });
    }

    // Retornar últimas sesiones de generación para este período
    const sesiones = await prisma.seleccionTemporalHorario.groupBy({
      by: ['sesion_id'],
      where: {
        id_periodo: parseInt(id_periodo),
        fecha_expiracion: {
          gt: new Date() // Solo sesiones no expiradas
        }
      },
      _count: true
    });

    return NextResponse.json({
      exito: true,
      datos: {
        sesiones_activas: sesiones.length,
        sesiones: sesiones
      }
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { exito: false, mensaje: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
}

/**
 * Verifica si dos rangos de tiempo se superponen
 */
function tiemposSeSuperponen(inicio1: string, fin1: string, inicio2: string, fin2: string): boolean {
  const minutos1 = horaAMinutos(inicio1);
  const minutos2 = horaAMinutos(fin1);
  const minutos3 = horaAMinutos(inicio2);
  const minutos4 = horaAMinutos(fin2);

  return minutos1 < minutos4 && minutos3 < minutos2;
}

/**
 * Convierte una hora "HH:MM" a minutos desde medianoche
 */
function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
