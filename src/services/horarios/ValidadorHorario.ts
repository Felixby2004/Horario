import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { ResultadoValidacion, Conflicto, Sugerencia, SeleccionCelda } from '@/lib/tipos';

export class ValidadorHorario {
  private static readonly FRANJA_INICIO = '07:00';
  private static readonly FRANJA_FIN = '22:00';
  private static readonly MAX_HORAS_DIARIAS = 8;
  private static readonly BLOQUEO_ALMUERZO_INICIO = '12:00';
  private static readonly BLOQUEO_ALMUERZO_FIN = '13:00';

  /**
   * Validar asignación completa
   */
  static async validarAsignacion(solicitud: SeleccionCelda): Promise<ResultadoValidacion> {
    const inicio = performance.now();
    const conflictos: Conflicto[] = [];

    try {
      const [
        resultadoFranja,
        resultadoDocente,
        resultadoGrupo,
        resultadoAmbiente,
        resultadoCarga,
        resultadoCursoAsignable,
        resultadoAmbienteValido,
        resultadoHorasCompletadas,
      ] = await Promise.all([
        this.validarFranjaHoraria(solicitud),
        this.validarCruceDocente(solicitud),
        this.validarCruceGrupo(solicitud),
        this.validarOcupacionAmbiente(solicitud),
        this.validarExcesoCargaDiaria(solicitud),
        this.validarCursoAsignable(solicitud),
        this.validarAmbienteValido(solicitud),
        this.validarHorasCompletadas(solicitud),
      ]);

      conflictos.push(
        ...resultadoFranja,
        ...resultadoDocente,
        ...resultadoGrupo,
        ...resultadoAmbiente,
        ...resultadoCarga,
        ...resultadoCursoAsignable,
        ...resultadoAmbienteValido,
        ...resultadoHorasCompletadas
      );

      const tiempoValidacion = Math.round(performance.now() - inicio);

      let sugerencias: Sugerencia[] | undefined;
      if (conflictos.filter((c) => c.severidad === 'ERROR').length === 0) {
        sugerencias = await this.generarSugerencias(solicitud);
      }

      return {
        valido: conflictos.filter((c) => c.severidad === 'ERROR').length === 0,
        conflictos,
        sugerencias,
        tiempoValidacion,
      };
    } catch (error) {
      console.error('Error en validación:', error);
      return {
        valido: false,
        conflictos: [
          {
            tipo: 'FUERA_FRANJA',
            mensaje: 'Error interno en la validación',
            severidad: 'ERROR',
          },
        ],
        tiempoValidacion: Math.round(performance.now() - inicio),
      };
    }
  }

  private static async validarFranjaHoraria(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    if (solicitud.horaInicio < this.FRANJA_INICIO || solicitud.horaFin > this.FRANJA_FIN) {
      return [
        {
          tipo: 'FUERA_FRANJA',
          mensaje: `El horario debe estar entre ${this.FRANJA_INICIO} y ${this.FRANJA_FIN}`,
          severidad: 'ERROR',
        },
      ];
    }

    if (
      solicitud.horaInicio >= this.BLOQUEO_ALMUERZO_INICIO &&
      solicitud.horaInicio < this.BLOQUEO_ALMUERZO_FIN
    ) {
      return [
        {
          tipo: 'FUERA_FRANJA',
          mensaje: 'No se pueden programar clases durante el bloque de almuerzo (12:00-13:00)',
          severidad: 'ADVERTENCIA',
        },
      ];
    }

    return [];
  }

  private static async validarCruceDocente(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const cruce = await prisma.$queryRaw<Array<{ id: number; curso: string }>>`
      SELECT ha.id_asignacion as id, c.nombre as curso
      FROM horario_asignado ha
      JOIN curso c ON ha.id_curso = c.id_curso
      WHERE ha.id_docente = ${solicitud.docenteId}
        AND ha.dia_semana = ${solicitud.diaSemana}
        AND ha.id_periodo = ${solicitud.periodoId}
        AND ha.estado IN ('borrador', 'confirmado', 'publicado')
        AND (
          (ha.hora_inicio <= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin > ${solicitud.horaInicio}::VARCHAR)
          OR
          (ha.hora_inicio < ${solicitud.horaFin}::VARCHAR
           AND ha.hora_fin >= ${solicitud.horaFin}::VARCHAR)
          OR
          (ha.hora_inicio >= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin <= ${solicitud.horaFin}::VARCHAR)
        )
      LIMIT 1
    `;

    if (cruce && cruce.length > 0) {
      return [
        {
          tipo: 'CRUCE_DOCENTE',
          mensaje: `❌ El docente ya tiene asignado el curso "${cruce[0].curso}" en este horario`,
          severidad: 'ERROR',
          detalle: { asignacionExistente: cruce[0] },
        },
      ];
    }

    return [];
  }

  private static async validarCruceGrupo(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const cruce = await prisma.$queryRaw<
      Array<{ id: number; curso: string; docente: string }>
    >`
      SELECT ha.id_asignacion as id, c.nombre as curso,
             d.apellidos || ', ' || d.nombres as docente
      FROM horario_asignado ha
      JOIN curso c ON ha.id_curso = c.id_curso
      JOIN docente d ON ha.id_docente = d.id_docente
      WHERE ha.id_grupo = ${solicitud.grupoId}
        AND ha.dia_semana = ${solicitud.diaSemana}
        AND ha.id_periodo = ${solicitud.periodoId}
        AND ha.estado IN ('borrador', 'confirmado', 'publicado')
        AND (
          (ha.hora_inicio <= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin > ${solicitud.horaInicio}::VARCHAR)
          OR
          (ha.hora_inicio < ${solicitud.horaFin}::VARCHAR
           AND ha.hora_fin >= ${solicitud.horaFin}::VARCHAR)
          OR
          (ha.hora_inicio >= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin <= ${solicitud.horaFin}::VARCHAR)
        )
      LIMIT 1
    `;

    if (cruce && cruce.length > 0) {
      return [
        {
          tipo: 'CRUCE_GRUPO',
          mensaje: `❌ El grupo ya tiene clase de "${cruce[0].curso}" con ${cruce[0].docente} en este horario`,
          severidad: 'ERROR',
        },
      ];
    }

    return [];
  }

  private static async validarOcupacionAmbiente(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const cacheKey = `ambiente:${solicitud.ambienteId}:dia:${solicitud.diaSemana}:ocupado`;

    try {
      const slotsOcupados = await redis.smembers(cacheKey);
      const slotBuscado = `${solicitud.horaInicio}-${solicitud.horaFin}`;

      if (slotsOcupados.includes(slotBuscado)) {
        return [
          {
            tipo: 'OCUPACION_AMBIENTE',
            mensaje: '⚠️ El ambiente ya está ocupado en este horario',
            severidad: 'ERROR',
          },
        ];
      }
    } catch (error) {
      console.error('Error verificando caché:', error);
    }

    const ocupacion = await prisma.$queryRaw<Array<{ id: number; curso: string }>>`
      SELECT ha.id_asignacion as id, c.nombre as curso
      FROM horario_asignado ha
      JOIN curso c ON ha.id_curso = c.id_curso
      WHERE ha.id_ambiente = ${solicitud.ambienteId}
        AND ha.dia_semana = ${solicitud.diaSemana}
        AND ha.id_periodo = ${solicitud.periodoId}
        AND ha.estado IN ('borrador', 'confirmado', 'publicado')
        AND (
          (ha.hora_inicio <= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin > ${solicitud.horaInicio}::VARCHAR)
          OR
          (ha.hora_inicio < ${solicitud.horaFin}::VARCHAR
           AND ha.hora_fin >= ${solicitud.horaFin}::VARCHAR)
          OR
          (ha.hora_inicio >= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin <= ${solicitud.horaFin}::VARCHAR)
        )
      LIMIT 1
    `;

    if (ocupacion && ocupacion.length > 0) {
      return [
        {
          tipo: 'OCUPACION_AMBIENTE',
          mensaje: `⚠️ Conflicto: El ambiente está ocupado por "${ocupacion[0].curso}"`,
          severidad: 'ERROR',
        },
      ];
    }

    return [];
  }

  private static async validarExcesoCargaDiaria(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const resultado = await prisma.$queryRaw<Array<{ horas_diarias: number }>>`
      SELECT COALESCE(
        SUM(EXTRACT(EPOCH FROM (ha.hora_fin::TIME - ha.hora_inicio::TIME)) / 3600), 0
      ) as horas_diarias
      FROM horario_asignado ha
      WHERE ha.id_docente = ${solicitud.docenteId}
        AND ha.dia_semana = ${solicitud.diaSemana}
        AND ha.id_periodo = ${solicitud.periodoId}
        AND ha.estado IN ('borrador', 'confirmado', 'publicado')
    `;

    const horasActuales = Number(resultado[0]?.horas_diarias || 0);
    const horasNuevoBloque = this.calcularDuracion(solicitud.horaInicio, solicitud.horaFin);
    const totalHoras = horasActuales + horasNuevoBloque;

    if (totalHoras > this.MAX_HORAS_DIARIAS) {
      return [
        {
          tipo: 'EXCESO_HORAS',
          mensaje: `⚠️ El docente tendría ${totalHoras}h en este día (máximo: ${this.MAX_HORAS_DIARIAS}h). Actualmente tiene ${horasActuales}h.`,
          severidad: 'ADVERTENCIA',
        },
      ];
    }

    return [];
  }

  private static async validarCursoAsignable(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const asignable = await prisma.docenteCurso.findFirst({
      where: {
        id_docente: solicitud.docenteId,
        id_curso: solicitud.cursoId,
        tipo_clase: solicitud.tipoClase,
        activo: true,
      },
    });

    if (!asignable) {
      return [
        {
          tipo: 'CURSO_NO_ASIGNABLE',
          mensaje: '❌ El docente no está habilitado para dictar este curso en esta modalidad',
          severidad: 'ERROR',
        },
      ];
    }

    return [];
  }

  private static async validarAmbienteValido(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const valido = await prisma.cursoAmbiente.findFirst({
      where: {
        id_curso: solicitud.cursoId,
        id_ambiente: solicitud.ambienteId,
        tipo_clase: solicitud.tipoClase,
      },
    });

    if (!valido) {
      return [
        {
          tipo: 'AMBIENTE_NO_VALIDO',
          mensaje: '❌ El ambiente seleccionado no está configurado para este curso/tipo de clase',
          severidad: 'ERROR',
        },
      ];
    }

    return [];
  }

  private static async validarHorasCompletadas(solicitud: SeleccionCelda): Promise<Conflicto[]> {
    const curso = await prisma.curso.findUnique({
      where: { id_curso: solicitud.cursoId },
      select: {
        horas_teoria: true,
        horas_laboratorio: true,
      },
    });

    if (!curso) return [];

    const horasRequeridas =
      solicitud.tipoClase === 'teoria' ? curso.horas_teoria : curso.horas_laboratorio;

    const resultado = await prisma.$queryRaw<Array<{ horas_asignadas: number }>>`
      SELECT COALESCE(
        SUM(EXTRACT(EPOCH FROM (ha.hora_fin::TIME - ha.hora_inicio::TIME)) / 3600), 0
      ) as horas_asignadas
      FROM horario_asignado ha
      WHERE ha.id_docente = ${solicitud.docenteId}
        AND ha.id_curso = ${solicitud.cursoId}
        AND ha.tipo_clase = ${solicitud.tipoClase}
        AND ha.id_periodo = ${solicitud.periodoId}
        AND ha.estado IN ('borrador', 'confirmado', 'publicado')
    `;

    const horasAsignadas = Number(resultado[0]?.horas_asignadas || 0);
    const horasNuevoBloque = this.calcularDuracion(solicitud.horaInicio, solicitud.horaFin);

    if (horasAsignadas + horasNuevoBloque > horasRequeridas) {
      return [
        {
          tipo: 'HORAS_COMPLETADAS',
          mensaje: `⚠️ Se excederían las horas requeridas. Actual: ${horasAsignadas}h, Requeridas: ${horasRequeridas}h`,
          severidad: 'ADVERTENCIA',
        },
      ];
    }

    return [];
  }

  private static async generarSugerencias(solicitud: SeleccionCelda): Promise<Sugerencia[]> {
    const sugerencias: Sugerencia[] = [];

    const alternativas = await prisma.$queryRaw<
      Array<{ codigo: string; capacidad: number; ocupacion: number }>
    >`
      SELECT a.codigo, a.capacidad, COUNT(ha.id_asignacion) as ocupacion
      FROM ambiente a
      JOIN curso_ambiente ca ON a.id_ambiente = ca.id_ambiente
      LEFT JOIN horario_asignado ha
        ON a.id_ambiente = ha.id_ambiente
        AND ha.dia_semana = ${solicitud.diaSemana}
        AND ha.id_periodo = ${solicitud.periodoId}
        AND (
          (ha.hora_inicio <= ${solicitud.horaInicio}::VARCHAR
           AND ha.hora_fin > ${solicitud.horaInicio}::VARCHAR)
          OR
          (ha.hora_inicio < ${solicitud.horaFin}::VARCHAR
           AND ha.hora_fin >= ${solicitud.horaFin}::VARCHAR)
        )
      WHERE ca.id_curso = ${solicitud.cursoId}
        AND ca.tipo_clase = ${solicitud.tipoClase}
        AND a.id_ambiente != ${solicitud.ambienteId}
        AND a.activo = TRUE
      GROUP BY a.id_ambiente, a.codigo, a.capacidad
      HAVING COUNT(ha.id_asignacion) = 0
      ORDER BY a.capacidad DESC
      LIMIT 3
    `;

    if (alternativas.length > 0) {
      sugerencias.push({
        tipo: 'AMBIENTE_ALTERNATIVO',
        mensaje: '💡 Ambientes alternativos disponibles en este horario:',
        opciones: alternativas.map((a) => ({
          codigo: a.codigo,
          capacidad: a.capacidad,
          disponible: true,
        })),
      });
    }

    return sugerencias;
  }

  private static calcularDuracion(horaInicio: string, horaFin: string): number {
    const [hi, mi] = horaInicio.split(':').map(Number);
    const [hf, mf] = horaFin.split(':').map(Number);
    return hf - hi + (mf - mi) / 60;
  }
}
