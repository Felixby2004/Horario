import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enviarRecordatorioCitacion } from '@/lib/notificaciones';

/**
 * POST /api/citaciones/recordatorios
 * Envía recordatorios a docentes 24 horas antes de su citación
 * Puede ser llamado por un cron job o manualmente
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'test-token';

    // Verificar token de autorización (simple)
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener citaciones que necesitan recordatorio
    const ahora = new Date();
    const mañana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    // Buscar citaciones para mañana que aún no han tenido recordatorio
    const citacionesPorRecordar = await prisma.citacionDocente.findMany({
      where: {
        fecha_citacion: {
          gte: ahora,
          lt: mañana
        },
        recordatorio_enviado: false,
        estado: {
          in: ['programada', 'confirmada_docente']
        }
      }
    });

    let recordatoriosEnviados = 0;
    const errores: string[] = [];

    for (const citacion of citacionesPorRecordar) {
      try {
        await enviarRecordatorioCitacion(citacion.id_citacion);
        recordatoriosEnviados++;
      } catch (error) {
        console.error(`Error enviando recordatorio para citación ${citacion.id_citacion}:`, error);
        errores.push(`Citación ${citacion.id_citacion}: ${String(error)}`);
      }
    }

    return NextResponse.json({
      mensaje: 'Recordatorios procesados',
      recordatoriosEnviados,
      citacionesProcesadas: citacionesPorRecordar.length,
      errores
    });
  } catch (error) {
    console.error('Error en POST /api/citaciones/recordatorios:', error);
    return NextResponse.json(
      { error: 'Error procesando recordatorios' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/citaciones/recordatorios/pendientes
 * Obtiene información sobre recordatorios pendientes
 */
export async function GET(request: NextRequest) {
  try {
    const ahora = new Date();
    const mañana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    // Contar citaciones que necesitan recordatorio
    const pendientes = await prisma.citacionDocente.count({
      where: {
        fecha_citacion: {
          gte: ahora,
          lt: mañana
        },
        recordatorio_enviado: false,
        estado: {
          in: ['programada', 'confirmada_docente']
        }
      }
    });

    return NextResponse.json({
      recordatoriosPendientes: pendientes
    });
  } catch (error) {
    console.error('Error en GET /api/citaciones/recordatorios:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información de recordatorios' },
      { status: 500 }
    );
  }
}
