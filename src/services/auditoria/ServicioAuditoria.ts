import { prisma } from '@/lib/prisma';
import { AccionAuditoria } from '@/lib/tipos';

export class ServicioAuditoria {
  static async registrar(datos: {
    id_usuario: number;
    accion: AccionAuditoria;
    id_asignacion?: number;
    datos_anteriores?: any;
    datos_nuevos?: any;
    ip?: string;
    motivo?: string;
  }) {
    try {
      await prisma.auditoriaHorario.create({
        data: {
          usuario_id: datos.id_usuario,
          accion: datos.accion,
          id_asignacion: datos.id_asignacion,
          datos_anteriores: datos.datos_anteriores || null,
          datos_nuevos: datos.datos_nuevos || null,
          direccion_ip: datos.ip || null,
          motivo: datos.motivo || null,
          fecha_registro: new Date()
        }
      });
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }

  static async obtenerHistorial(filtros?: {
    id_usuario?: number;
    id_asignacion?: number;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    limite?: number;
  }) {
    return await prisma.auditoriaHorario.findMany({
      where: {
        ...(filtros?.id_usuario && { usuario_id: filtros.id_usuario }),
        ...(filtros?.id_asignacion && { id_asignacion: filtros.id_asignacion }),
        ...(filtros?.fecha_desde && { fecha_registro: { gte: filtros.fecha_desde } }),
        ...(filtros?.fecha_hasta && { fecha_registro: { lte: filtros.fecha_hasta } })
      },
      include: {
        usuario: {
          select: {
            codigo: true,
            nombres: true,
            apellidos: true
          }
        },
        asignacion: true
      },
      orderBy: { fecha_registro: 'desc' },
      take: filtros?.limite || 100
    });
  }
}
