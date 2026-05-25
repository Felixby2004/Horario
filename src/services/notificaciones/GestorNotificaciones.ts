import { prisma } from '@/lib/prisma';

export class GestorNotificaciones {
  static async procesarColaNotificaciones(): Promise<{
    procesadas: number;
    exitosas: number;
    fallidas: number;
  }> {
    const ahora = new Date();
    
    const pendientes = await prisma.colaNotificaciones.findMany({
      where: {
        estado: 'pendiente',
        fecha_programada: { lte: ahora },
        intentos: { lt: 3 }
      },
      orderBy: [
        { prioridad: 'asc' },
        { fecha_programada: 'asc' }
      ],
      take: 50
    });

    let exitosas = 0;
    let fallidas = 0;

    for (const pendiente of pendientes) {
      try {
        await prisma.colaNotificaciones.update({
          where: { id_cola: pendiente.id_cola },
          data: { estado: 'procesando', fecha_procesamiento: new Date() }
        });

        // Aquí iría la lógica real de envío
        // Por ahora simulamos el éxito
        await prisma.colaNotificaciones.update({
          where: { id_cola: pendiente.id_cola },
          data: { estado: 'completado' }
        });
        exitosas++;
      } catch (error: any) {
        await prisma.colaNotificaciones.update({
          where: { id_cola: pendiente.id_cola },
          data: {
            estado: pendiente.intentos + 1 >= 3 ? 'fallido' : 'pendiente',
            intentos: { increment: 1 }
          }
        });
        fallidas++;
      }
    }

    return { procesadas: pendientes.length, exitosas, fallidas };
  }
}
