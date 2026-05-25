import { prisma } from '@/lib/prisma';

// Validador de conflictos
export class ValidadorConflictos {
  static async detectarConflictosDocente(
    idDocente: number,
    dia: string,
    horaInicio: string,
    horaFin: string,
    idPeriodo: number
  ): Promise<any[]> {
    const conflictos = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        dia_semana: dia as any,
        estado: { in: ['confirmado', 'publicado'] },
        OR: [
          {
            hora_inicio: { lt: horaFin },
            hora_fin: { gt: horaInicio }
          }
        ]
      },
      include: {
        curso: true,
        ambiente: true
      }
    });

    return conflictos;
  }

  static async detectarConflictosAmbiente(
    idAmbiente: number,
    dia: string,
    horaInicio: string,
    horaFin: string,
    idPeriodo: number
  ): Promise<any[]> {
    const conflictos = await prisma.horarioAsignado.findMany({
      where: {
        id_ambiente: idAmbiente,
        id_periodo: idPeriodo,
        dia_semana: dia as any,
        estado: { in: ['confirmado', 'publicado'] },
        OR: [
          {
            hora_inicio: { lt: horaFin },
            hora_fin: { gt: horaInicio }
          }
        ]
      },
      include: {
        curso: true,
        docente: true
      }
    });

    return conflictos;
  }

  static async detectarTodosConflictos(idPeriodo: number): Promise<any[]> {
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      },
      include: {
        curso: true,
        docente: true,
        ambiente: true
      }
    });

    const conflictos: any[] = [];

    // Agrupar por docente
    const porDocente = new Map<number, any[]>();
    horarios.forEach(h => {
      if (!porDocente.has(h.id_docente)) {
        porDocente.set(h.id_docente, []);
      }
      porDocente.get(h.id_docente)!.push(h);
    });

    // Detectar conflictos por docente
    porDocente.forEach((horariosDocente, idDocente) => {
      for (let i = 0; i < horariosDocente.length; i++) {
        for (let j = i + 1; j < horariosDocente.length; j++) {
          const h1 = horariosDocente[i];
          const h2 = horariosDocente[j];

          if (h1.dia_semana === h2.dia_semana) {
            if (h1.hora_inicio < h2.hora_fin && h2.hora_inicio < h1.hora_fin) {
              conflictos.push({
                tipo: 'Conflicto de Docente',
                descripcion: `El docente ${h1.docente.apellidos} tiene clases simultáneas`,
                horario1: h1,
                horario2: h2
              });
            }
          }
        }
      }
    });

    return conflictos;
  }
}

// Motor de asignación automática
export class MotorAsignacion {
  static async asignarAutomaticamente(
    idCurso: number,
    idGrupo: number,
    idPeriodo: number
  ): Promise<any> {
    const grupo = await prisma.grupoCurso.findUnique({
      where: { id_grupo: idGrupo },
      include: {
        curso: true,
        docente: true
      }
    });

    if (!grupo) throw new Error('Grupo no encontrado');

    const curso = grupo.curso;
    const horasRequeridas = curso.horas_teoria + curso.horas_laboratorio + curso.horas_practica;

    // Buscar bloques disponibles
    const bloquesDisponibles = await this.buscarBloquesDisponibles(
      grupo.id_docente,
      horasRequeridas,
      idPeriodo
    );

    if (bloquesDisponibles.length === 0) {
      throw new Error('No hay bloques disponibles');
    }

    // Asignar los bloques
    const asignaciones = [];
    for (const bloque of bloquesDisponibles.slice(0, Math.ceil(horasRequeridas / 1.5))) {
      const ambiente = await this.buscarAmbienteDisponible(
        bloque.dia,
        bloque.horaInicio,
        bloque.horaFin,
        curso.horas_laboratorio > 0 ? 'laboratorio' : 'aula',
        idPeriodo
      );

      if (ambiente) {
        const horario = await prisma.horarioAsignado.create({
          data: {
            id_periodo: idPeriodo,
            id_curso: idCurso,
            id_grupo: idGrupo,
            id_docente: grupo.id_docente,
            id_ambiente: ambiente.id_ambiente,
            dia_semana: bloque.dia,
            hora_inicio: bloque.horaInicio,
            hora_fin: bloque.horaFin,
            estado: 'temporal'
          }
        });

        asignaciones.push(horario);
      }
    }

    return asignaciones;
  }

  private static async buscarBloquesDisponibles(
    idDocente: number,
    horasRequeridas: number,
    idPeriodo: number
  ): Promise<any[]> {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const bloques = [];
    const bloquesPorDia = 10;

    for (const dia of dias) {
      for (let bloque = 0; bloque < bloquesPorDia; bloque++) {
        const horaInicio = `${7 + Math.floor(bloque * 1.5)}:${(bloque % 2) * 30}`;
        const horaFin = `${7 + Math.floor((bloque + 1) * 1.5)}:${((bloque + 1) % 2) * 30}`;

        const conflictos = await ValidadorConflictos.detectarConflictosDocente(
          idDocente,
          dia,
          horaInicio,
          horaFin,
          idPeriodo
        );

        if (conflictos.length === 0) {
          bloques.push({ dia, horaInicio, horaFin });
        }
      }
    }

    return bloques;
  }

  private static async buscarAmbienteDisponible(
    dia: string,
    horaInicio: string,
    horaFin: string,
    tipo: string,
    idPeriodo: number
  ): Promise<any> {
    const ambientes = await prisma.ambiente.findMany({
      where: {
        tipo: tipo as any,
        activo: true
      }
    });

    for (const ambiente of ambientes) {
      const conflictos = await ValidadorConflictos.detectarConflictosAmbiente(
        ambiente.id_ambiente,
        dia,
        horaInicio,
        horaFin,
        idPeriodo
      );

      if (conflictos.length === 0) {
        return ambiente;
      }
    }

    return null;
  }
}

// Publicador de horarios
export class PublicadorHorarios {
  static async publicarTodos(idPeriodo: number): Promise<number> {
    const resultado = await prisma.horarioAsignado.updateMany({
      where: {
        id_periodo: idPeriodo,
        estado: 'confirmado'
      },
      data: {
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });

    return resultado.count;
  }

  static async despublicar(idPeriodo: number): Promise<number> {
    const resultado = await prisma.horarioAsignado.updateMany({
      where: {
        id_periodo: idPeriodo,
        estado: 'publicado'
      },
      data: {
        estado: 'confirmado',
        fecha_publicacion: null
      }
    });

    return resultado.count;
  }

  static async publicarPorDocente(idDocente: number, idPeriodo: number): Promise<number> {
    const resultado = await prisma.horarioAsignado.updateMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: 'confirmado'
      },
      data: {
        estado: 'publicado',
        fecha_publicacion: new Date()
      }
    });

    return resultado.count;
  }
}
