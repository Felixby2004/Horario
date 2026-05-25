import { prisma } from '@/lib/prisma';

export class ServicioAuditoria {
  static async registrar(datos: {
    id_usuario: number;
    accion: string;
    tabla_afectada: string;
    id_registro?: number;
    valores_anteriores?: any;
    valores_nuevos?: any;
    ip?: string;
  }) {
    try {
      await prisma.auditoriaHorario.create({
        data: {
          id_usuario: datos.id_usuario,
          accion: datos.accion,
          tabla_afectada: datos.tabla_afectada,
          id_registro: datos.id_registro,
          valores_anteriores: datos.valores_anteriores ? JSON.stringify(datos.valores_anteriores) : null,
          valores_nuevos: datos.valores_nuevos ? JSON.stringify(datos.valores_nuevos) : null,
          ip_address: datos.ip || null,
          fecha_hora: new Date()
        }
      });
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }

  static async obtenerHistorial(filtros?: {
    id_usuario?: number;
    tabla?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    limite?: number;
  }) {
    return await prisma.auditoriaHorario.findMany({
      where: {
        ...(filtros?.id_usuario && { id_usuario: filtros.id_usuario }),
        ...(filtros?.tabla && { tabla_afectada: filtros.tabla }),
        ...(filtros?.fecha_desde && { fecha_hora: { gte: filtros.fecha_desde } }),
        ...(filtros?.fecha_hasta && { fecha_hora: { lte: filtros.fecha_hasta } })
      },
      include: {
        usuario: {
          select: {
            codigo: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: { fecha_hora: 'desc' },
      take: filtros?.limite || 100
    });
  }
}
