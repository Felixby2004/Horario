import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/estadisticas/mapa-calor/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const config = await prisma.configuracionSistema.findFirst();
    const duracionBloque = config?.duracion_bloque || 90;
    const [hIniConfig, mIniConfig] = (config?.hora_inicio || '07:00').split(':').map(Number);
    const minutosInicioConfig = hIniConfig * 60 + mIniConfig;

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const bloques = config?.bloques_horarios || 10;
    const matriz: number[][] = Array(bloques).fill(0).map(() => Array(5).fill(0));

    // Calcular ocupación por bloque y día
    for (let b = 0; b < bloques; b++) {
      for (let d = 0; d < dias.length; d++) {
        const minInicioBloque = minutosInicioConfig + (b * duracionBloque);
        const minFinBloque = minInicioBloque + duracionBloque;

        const hInicio = `${Math.floor(minInicioBloque / 60).toString().padStart(2, '0')}:${(minInicioBloque % 60).toString().padStart(2, '0')}`;
        const hFin = `${Math.floor(minFinBloque / 60).toString().padStart(2, '0')}:${(minFinBloque % 60).toString().padStart(2, '0')}`;

        const ocupados = await prisma.horarioAsignado.count({
          where: {
            id_periodo: idPeriodo,
            dia_semana: d, // dia_semana es INTEGER en la BD
            hora_inicio: { lte: hFin },
            hora_fin: { gte: hInicio },
            estado: { in: ['confirmado', 'publicado'] }
          }
        });

        const totalAmbientes = await prisma.ambiente.count({
          where: { activo: true }
        });

        matriz[b][d] = totalAmbientes > 0 
          ? Math.round((ocupados / totalAmbientes) * 100)
          : 0;
      }
    }

    return NextResponse.json({ exito: true, datos: matriz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
