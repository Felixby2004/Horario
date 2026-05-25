import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/estadisticas/mapa-calor/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const bloques = 10;
    const matriz: number[][] = Array(bloques).fill(0).map(() => Array(5).fill(0));

    // Calcular ocupación por bloque y día
    for (let b = 0; b < bloques; b++) {
      for (let d = 0; d < dias.length; d++) {
        const horaInicio = `${7 + Math.floor(b * 1.5)}:${(b % 2) * 30}`;
        const horaFin = `${7 + Math.floor((b + 1) * 1.5)}:${((b + 1) % 2) * 30}`;

        const ocupados = await prisma.horarioAsignado.count({
          where: {
            id_periodo: idPeriodo,
            dia_semana: dias[d] as any,
            hora_inicio: { lte: horaFin },
            hora_fin: { gte: horaInicio },
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
