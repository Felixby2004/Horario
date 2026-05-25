import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/horarios/guardar-generados
 * 
 * Guarda los horarios generados por el algoritmo genético en la tabla HorarioAsignado
 * 
 * Body:
 * {
 *   id_periodo: number,
 *   sesion_id: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_periodo, sesion_id } = body;

    if (!id_periodo || !sesion_id) {
      return NextResponse.json(
        { exito: false, mensaje: 'Período y sesión son requeridos' },
        { status: 400 }
      );
    }

    // Obtener los horarios temporales generados
    const horariosTemporales = await prisma.seleccionTemporalHorario.findMany({
      where: {
        id_periodo,
        sesion_id
      }
    });

    if (horariosTemporales.length === 0) {
      return NextResponse.json(
        { exito: false, mensaje: 'No se encontraron horarios generados' },
        { status: 404 }
      );
    }

    // Verificar que no haya conflictos críticos
    const conflictosDetectados = detectarConflictos(horariosTemporales);

    if (conflictosDetectados.length > 0) {
      console.warn(`[API] Se detectaron ${conflictosDetectados.length} conflictos al guardar`);
      // No bloqueamos, solo advertimos - el usuario decidirá si continuar
    }

    // Guardar cada horario temporal como horario asignado definitivo
    let cantidadGuardada = 0;
    const horariosCombinados: any[] = [];

    for (const horarioTemp of horariosTemporales) {
      try {
        // Validar que todas las referencias existan
        const [docente, curso, grupo, ambiente] = await Promise.all([
          prisma.docente.findUnique({ where: { id_docente: horarioTemp.id_docente } }),
          prisma.curso.findUnique({ where: { id_curso: horarioTemp.id_curso } }),
          prisma.grupo.findUnique({ where: { id_grupo: horarioTemp.id_grupo } }),
          prisma.ambiente.findUnique({ where: { id_ambiente: horarioTemp.id_ambiente } })
        ]);

        if (!docente || !curso || !grupo || !ambiente) {
          console.warn(`[API] Referencias inválidas para horario temporal ${horarioTemp.id_seleccion}`);
          continue;
        }

        // Crear el horario asignado definitivo
        const horarioCreado = await prisma.horarioAsignado.create({
          data: {
            id_docente: horarioTemp.id_docente,
            id_curso: horarioTemp.id_curso,
            id_grupo: horarioTemp.id_grupo,
            id_ambiente: horarioTemp.id_ambiente,
            dia_semana: horarioTemp.dia_semana,
            hora_inicio: horarioTemp.hora_inicio,
            hora_fin: horarioTemp.hora_fin,
            id_periodo,
            tipo_clase: horarioTemp.tipo_clase,
            estado: 'borrador',
            observaciones: `Generado automáticamente por algoritmo genético (sesión: ${sesion_id})`
          }
        });

        horariosCombinados.push(horarioCreado);
        cantidadGuardada++;

      } catch (error) {
        console.error(`[API] Error guardando horario ${horarioTemp.id_seleccion}:`, error);
      }
    }

    if (cantidadGuardada === 0) {
      return NextResponse.json(
        { exito: false, mensaje: 'No se pudieron guardar los horarios' },
        { status: 500 }
      );
    }

    // Limpiar los horarios temporales
    await prisma.seleccionTemporalHorario.deleteMany({
      where: {
        id_periodo,
        sesion_id
      }
    });

    return NextResponse.json({
      exito: true,
      datos: {
        cantidad_guardada: cantidadGuardada,
        conflictos_detectados: conflictosDetectados.length,
        horarios: horariosCombinados.slice(0, 10) // Retornar muestra
      },
      mensaje: `Se guardaron ${cantidadGuardada} horarios exitosamente`
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al guardar horarios'
      },
      { status: 500 }
    );
  }
}

/**
 * Detecta conflictos en los horarios
 */
function detectarConflictos(horarios: any[]): any[] {
  const conflictos: any[] = [];

  for (let i = 0; i < horarios.length; i++) {
    for (let j = i + 1; j < horarios.length; j++) {
      const h1 = horarios[i];
      const h2 = horarios[j];

      // Conflicto de docente
      if (h1.id_docente === h2.id_docente &&
          h1.dia_semana === h2.dia_semana &&
          tiemposSeSuperponen(h1.hora_inicio, h1.hora_fin, h2.hora_inicio, h2.hora_fin)) {
        conflictos.push({
          tipo: 'docente',
          detalle: `Docente ${h1.id_docente} con conflicto de horario`,
          horario1: h1.id_seleccion,
          horario2: h2.id_seleccion
        });
      }

      // Conflicto de ambiente
      if (h1.id_ambiente === h2.id_ambiente &&
          h1.dia_semana === h2.dia_semana &&
          tiemposSeSuperponen(h1.hora_inicio, h1.hora_fin, h2.hora_inicio, h2.hora_fin)) {
        conflictos.push({
          tipo: 'ambiente',
          detalle: `Ambiente ${h1.id_ambiente} reservado dos veces`,
          horario1: h1.id_seleccion,
          horario2: h2.id_seleccion
        });
      }
    }
  }

  return conflictos;
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
