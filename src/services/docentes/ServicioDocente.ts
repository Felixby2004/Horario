import { prisma } from '@/lib/prisma';

export class ServicioDocente {
  static async obtenerPorId(id: number) {
    return await prisma.docente.findUnique({
      where: { id_docente: id },
      include: {
        usuario: true,
        horarios_asignados: {
          include: {
            curso: true,
            grupo: true,
            ambiente: true
          }
        }
      }
    });
  }

  static async listar(filtros?: {
    modalidad?: string;
    categoria?: string;
    activo?: boolean;
  }) {
    return await prisma.docente.findMany({
      where: {
        ...(filtros?.modalidad && { modalidad: filtros.modalidad as any }),
        ...(filtros?.categoria && { categoria: filtros.categoria as any }),
        ...(filtros?.activo !== undefined && { activo: filtros.activo })
      },
      orderBy: [
        { modalidad: 'asc' },
        { categoria: 'asc' },
        { antiguedad: 'desc' }
      ]
    });
  }

  static async crear(datos: any) {
    return await prisma.docente.create({
      data: {
        codigo_docente: datos.codigo_docente,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        modalidad: datos.modalidad,
        categoria: datos.categoria,
        antiguedad: datos.antiguedad || 0,
        correo_electronico: datos.correo_electronico,
        telefono: datos.telefono,
        grado_academico: datos.grado_academico,
        especialidad: datos.especialidad,
        dedicacion: datos.dedicacion || 'tiempo_completo'
      }
    });
  }

  static async actualizar(id: number, datos: any) {
    return await prisma.docente.update({
      where: { id_docente: id },
      data: datos
    });
  }

  static async desactivar(id: number) {
    return await prisma.docente.update({
      where: { id_docente: id },
      data: { activo: false }
    });
  }

  static async obtenerCargaHoraria(id: number, idPeriodo: number) {
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: id,
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      }
    });

    const totalHoras = horarios.reduce((sum, h) => {
      const [h1, m1] = h.hora_inicio.split(':').map(Number);
      const [h2, m2] = h.hora_fin.split(':').map(Number);
      return sum + ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
    }, 0);

    return {
      total_bloques: horarios.length,
      total_horas: totalHoras,
      cursos_diferentes: new Set(horarios.map(h => h.id_curso)).size
    };
  }
}
