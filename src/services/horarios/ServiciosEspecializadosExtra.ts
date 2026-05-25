import { prisma } from '@/lib/prisma';
import { ValidadorHorario } from './ValidadorHorario';

// Generador automático de horarios
export class GeneradorHorarios {
  static async generarAutomaticamente(idPeriodo: number, idCurso: number) {
    const curso = await prisma.curso.findUnique({
      where: { id_curso: idCurso },
      include: { grupos: true }
    });

    if (!curso) throw new Error('Curso no encontrado');

    const horariosSugeridos = [];
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    for (const grupo of curso.grupos) {
      const horasRequeridas = curso.horas_teoria + curso.horas_laboratorio + curso.horas_practica;
      let horasAsignadas = 0;

      for (let dia of dias) {
        if (horasAsignadas >= horasRequeridas) break;

        for (let bloque = 0; bloque < 10; bloque++) {
          if (horasAsignadas >= horasRequeridas) break;

          const horaInicio = this.calcularHora(bloque);
          const horaFin = this.calcularHora(bloque + 1);

          // Buscar ambiente disponible
          const ambiente = await this.buscarAmbienteDisponible(
            idPeriodo,
            dia,
            horaInicio,
            curso.horas_laboratorio > 0 ? 'laboratorio' : 'aula'
          );

          if (ambiente) {
            const validacion = await ValidadorHorario.validarHorario({
              id_periodo: idPeriodo,
              id_curso: idCurso,
              id_grupo: grupo.id_grupo,
              id_docente: grupo.id_docente,
              id_ambiente: ambiente.id_ambiente,
              dia_semana: dia,
              hora_inicio: horaInicio,
              hora_fin: horaFin
            });

            if (validacion.valido) {
              horariosSugeridos.push({
                id_grupo: grupo.id_grupo,
                id_ambiente: ambiente.id_ambiente,
                dia_semana: dia,
                hora_inicio: horaInicio,
                hora_fin: horaFin
              });

              horasAsignadas += 1.5;
            }
          }
        }
      }
    }

    return horariosSugeridos;
  }

  private static calcularHora(bloque: number): string {
    const hora = 7 + Math.floor(bloque * 1.5);
    const minutos = (bloque % 2) * 30;
    return `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }

  private static async buscarAmbienteDisponible(
    idPeriodo: number,
    dia: string,
    horaInicio: string,
    tipo: string
  ) {
    const ambientes = await prisma.ambiente.findMany({
      where: { tipo: tipo as any, activo: true }
    });

    for (const ambiente of ambientes) {
      const conflicto = await prisma.horarioAsignado.findFirst({
        where: {
          id_periodo: idPeriodo,
          id_ambiente: ambiente.id_ambiente,
          dia_semana: dia,
          hora_inicio: horaInicio,
          estado: { in: ['confirmado', 'publicado'] }
        }
      });

      if (!conflicto) return ambiente;
    }

    return null;
  }
}

// Optimizador de horarios
export class OptimizadorHorarios {
  static async optimizarDistribucion(idPeriodo: number) {
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: 'confirmado'
      },
      include: {
        docente: true,
        ambiente: true
      }
    });

    const sugerencias = [];

    // Detectar días con sobrecarga
    const distribucionPorDia = this.analizarDistribucion(horarios);
    
    for (const [dia, cantidad] of Object.entries(distribucionPorDia)) {
      if (cantidad > 15) {
        sugerencias.push({
          tipo: 'sobrecarga_dia',
          dia,
          cantidad,
          mensaje: `${dia} tiene ${cantidad} clases. Considere redistribuir a otros días.`
        });
      }
    }

    // Detectar docentes con carga excesiva
    const cargaPorDocente = this.analizarCargaDocentes(horarios);
    
    for (const [docente, horas] of Object.entries(cargaPorDocente)) {
      if (horas > 24) {
        sugerencias.push({
          tipo: 'sobrecarga_docente',
          docente,
          horas,
          mensaje: `${docente} tiene ${horas} horas. Máximo recomendado: 24 horas.`
        });
      }
    }

    // Detectar ambientes subutilizados
    const ocupacionAmbientes = await this.analizarOcupacionAmbientes(idPeriodo);
    
    for (const ambiente of ocupacionAmbientes) {
      if (ambiente.porcentaje < 30) {
        sugerencias.push({
          tipo: 'subutilizacion',
          ambiente: ambiente.nombre,
          porcentaje: ambiente.porcentaje,
          mensaje: `${ambiente.nombre} está al ${ambiente.porcentaje}% de ocupación.`
        });
      }
    }

    return sugerencias;
  }

  private static analizarDistribucion(horarios: any[]) {
    const distribucion: any = {
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0
    };

    for (const h of horarios) {
      distribucion[h.dia_semana] = (distribucion[h.dia_semana] || 0) + 1;
    }

    return distribucion;
  }

  private static analizarCargaDocentes(horarios: any[]) {
    const carga: any = {};

    for (const h of horarios) {
      const nombre = `${h.docente.apellidos}, ${h.docente.nombres}`;
      carga[nombre] = (carga[nombre] || 0) + 1.5; // 1.5 horas por bloque
    }

    return carga;
  }

  private static async analizarOcupacionAmbientes(idPeriodo: number) {
    const ambientes = await prisma.ambiente.findMany({
      where: { activo: true }
    });

    const ocupacion = await Promise.all(
      ambientes.map(async (ambiente) => {
        const ocupados = await prisma.horarioAsignado.count({
          where: {
            id_periodo: idPeriodo,
            id_ambiente: ambiente.id_ambiente,
            estado: { in: ['confirmado', 'publicado'] }
          }
        });

        return {
          nombre: ambiente.nombre,
          porcentaje: Math.round((ocupados / 50) * 100)
        };
      })
    );

    return ocupacion;
  }
}

// Exportador de horarios
export class ExportadorHorarios {
  static async exportarATXT(idPeriodo: number) {
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      },
      include: {
        curso: true,
        docente: true,
        grupo: true,
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    let contenido = 'HORARIOS - UNIVERSIDAD NACIONAL DE TRUJILLO\n';
    contenido += '='.repeat(60) + '\n\n';

    for (const h of horarios) {
      contenido += `Día: ${h.dia_semana.toUpperCase()}\n`;
      contenido += `Hora: ${h.hora_inicio} - ${h.hora_fin}\n`;
      contenido += `Curso: ${h.curso.nombre}\n`;
      contenido += `Docente: ${h.docente.apellidos}, ${h.docente.nombres}\n`;
      contenido += `Grupo: ${h.grupo.numero_grupo}\n`;
      contenido += `Ambiente: ${h.ambiente.nombre}\n`;
      contenido += '-'.repeat(60) + '\n\n';
    }

    return contenido;
  }

  static async exportarPorDocente(idDocente: number, idPeriodo: number) {
    const docente = await prisma.docente.findUnique({
      where: { id_docente: idDocente }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      },
      include: {
        curso: true,
        grupo: true,
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    let contenido = `HORARIO - ${docente?.apellidos}, ${docente?.nombres}\n`;
    contenido += '='.repeat(60) + '\n\n';

    for (const h of horarios) {
      contenido += `${h.dia_semana} ${h.hora_inicio}-${h.hora_fin} | `;
      contenido += `${h.curso.codigo_curso} | ${h.ambiente.nombre}\n`;
    }

    return contenido;
  }
}

// Estadísticas avanzadas
export class EstadisticasAvanzadas {
  static async obtenerResumenCompleto(idPeriodo: number) {
    const totalHorarios = await prisma.horarioAsignado.count({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      }
    });

    const totalDocentes = await prisma.docente.count({
      where: { activo: true }
    });

    const totalCursos = await prisma.curso.count({
      where: { activo: true }
    });

    const totalAmbientes = await prisma.ambiente.count({
      where: { activo: true }
    });

    const distribucionPorDia = await this.obtenerDistribucionPorDia(idPeriodo);
    const cargaPorCategoria = await this.obtenerCargaPorCategoria(idPeriodo);
    const ocupacionAmbientes = await this.obtenerOcupacionAmbientes(idPeriodo);

    return {
      totales: {
        horarios: totalHorarios,
        docentes: totalDocentes,
        cursos: totalCursos,
        ambientes: totalAmbientes
      },
      distribucionPorDia,
      cargaPorCategoria,
      ocupacionAmbientes
    };
  }

  private static async obtenerDistribucionPorDia(idPeriodo: number) {
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      }
    });

    const distribucion: any = {
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0
    };

    for (const h of horarios) {
      distribucion[h.dia_semana] = (distribucion[h.dia_semana] || 0) + 1;
    }

    return distribucion;
  }

  private static async obtenerCargaPorCategoria(idPeriodo: number) {
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      },
      include: { docente: true }
    });

    const carga: any = {
      principal: 0,
      asociado: 0,
      auxiliar: 0,
      jefe_practica: 0
    };

    for (const h of horarios) {
      carga[h.docente.categoria] = (carga[h.docente.categoria] || 0) + 1;
    }

    return carga;
  }

  private static async obtenerOcupacionAmbientes(idPeriodo: number) {
    const ambientes = await prisma.ambiente.findMany({
      where: { activo: true }
    });

    const ocupacion = await Promise.all(
      ambientes.map(async (ambiente) => {
        const ocupados = await prisma.horarioAsignado.count({
          where: {
            id_periodo: idPeriodo,
            id_ambiente: ambiente.id_ambiente,
            estado: { in: ['confirmado', 'publicado'] }
          }
        });

        return {
          nombre: ambiente.nombre,
          tipo: ambiente.tipo,
          porcentaje: Math.round((ocupados / 50) * 100)
        };
      })
    );

    return ocupacion;
  }
}
