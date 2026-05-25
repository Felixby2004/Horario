import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { SeleccionCelda } from '@/lib/tipos';

export class GestorSeleccionTemporal {
  private static readonly TIEMPO_EXPIRACION_MINUTOS = 30;

  static async seleccionarCelda(datos: SeleccionCelda): Promise<{ exito: boolean; mensaje: string }> {
    await this.limpiarSeleccionesExpiradas();

    const seleccionExistente = await prisma.seleccionTemporalHorario.findFirst({
      where: {
        sesion_id: datos.sesionId,
        dia_semana: datos.diaSemana,
        hora_inicio: datos.horaInicio
      }
    });

    if (seleccionExistente) {
      return { exito: false, mensaje: 'Ya tienes una selección en este horario' };
    }

    await prisma.seleccionTemporalHorario.create({
      data: {
        id_docente: datos.docenteId,
        id_curso: datos.cursoId,
        id_grupo: datos.grupoId,
        tipo_clase: datos.tipoClase,
        id_ambiente: datos.ambienteId,
        dia_semana: datos.diaSemana,
        hora_inicio: datos.horaInicio,
        hora_fin: datos.horaFin,
        id_periodo: datos.periodoId,
        sesion_id: datos.sesionId,
        fecha_expiracion: new Date(Date.now() + this.TIEMPO_EXPIRACION_MINUTOS * 60000)
      }
    });

    await redis.publish('canal:disponibilidad', JSON.stringify({
      tipo: 'actualizacion_disponibilidad',
      ambienteId: datos.ambienteId,
      dia: datos.diaSemana,
      horaInicio: datos.horaInicio
    }));

    return { exito: true, mensaje: 'Celda seleccionada correctamente' };
  }

  static async confirmarSelecciones(sesionId: string, periodoId: number): Promise<{
    exito: boolean;
    mensaje: string;
    asignaciones?: number;
  }> {
    const selecciones = await prisma.seleccionTemporalHorario.findMany({
      where: { sesion_id: sesionId, id_periodo: periodoId }
    });

    if (selecciones.length === 0) {
      return { exito: false, mensaje: 'No hay selecciones para confirmar' };
    }

    const resultado = await prisma.$transaction(async (tx) => {
      let creadas = 0;
      for (const sel of selecciones) {
        await tx.horarioAsignado.create({
          data: {
            id_docente: sel.id_docente,
            id_curso: sel.id_curso,
            id_grupo: sel.id_grupo,
            tipo_clase: sel.tipo_clase,
            id_ambiente: sel.id_ambiente,
            dia_semana: sel.dia_semana,
            hora_inicio: sel.hora_inicio,
            hora_fin: sel.hora_fin,
            id_periodo: periodoId,
            estado: 'confirmado'
          }
        });
        creadas++;
      }
      await tx.seleccionTemporalHorario.deleteMany({
        where: { sesion_id: sesionId }
      });
      return creadas;
    });

    return {
      exito: true,
      mensaje: `Horario confirmado exitosamente`,
      asignaciones: resultado
    };
  }

  static async limpiarSeleccionesExpiradas(): Promise<number> {
    const resultado = await prisma.seleccionTemporalHorario.deleteMany({
      where: { fecha_expiracion: { lt: new Date() } }
    });
    return resultado.count;
  }
}
