import { prisma } from '@/lib/prisma';

// Servicio de Cursos
export class ServicioCurso {
  static async listar() {
    return await prisma.curso.findMany({
      where: { activo: true },
      orderBy: [{ ciclo: 'asc' }, { nombre: 'asc' }]
    });
  }

  static async obtenerPorId(id: number) {
    return await prisma.curso.findUnique({
      where: { id_curso: id },
      include: { grupos: true }
    });
  }

  static async crear(datos: any) {
    return await prisma.curso.create({
      data: {
        codigo_curso: datos.codigo_curso,
        nombre: datos.nombre,
        horas_teoria: datos.horas_teoria,
        horas_laboratorio: datos.horas_laboratorio,
        horas_practica: datos.horas_practica || 0,
        creditos: datos.creditos,
        ciclo: datos.ciclo
      }
    });
  }

  static async actualizar(id: number, datos: any) {
    return await prisma.curso.update({
      where: { id_curso: id },
      data: datos
    });
  }
}

// Servicio de Ambientes
export class ServicioAmbiente {
  static async listar(tipo?: string) {
    return await prisma.ambiente.findMany({
      where: {
        activo: true,
        ...(tipo && { tipo: tipo as any })
      },
      orderBy: { nombre: 'asc' }
    });
  }

  static async obtenerPorId(id: number) {
    return await prisma.ambiente.findUnique({
      where: { id_ambiente: id }
    });
  }

  static async crear(datos: any) {
    return await prisma.ambiente.create({
      data: {
        nombre: datos.nombre,
        tipo: datos.tipo,
        capacidad: datos.capacidad,
        ubicacion: datos.ubicacion,
        equipamiento: datos.equipamiento
      }
    });
  }

  static async verificarDisponibilidad(
    idAmbiente: number,
    dia: string,
    horaInicio: string,
    horaFin: string,
    idPeriodo: number
  ) {
    const conflictos = await prisma.horarioAsignado.count({
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
      }
    });

    return conflictos === 0;
  }
}
