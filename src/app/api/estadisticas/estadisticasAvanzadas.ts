import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/estadisticas/distribucion-dia/route.ts
export async function GET_distribucionDia(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const datos = [];

    for (const dia of dias) {
      const cantidad = await prisma.horarioAsignado.count({
        where: {
          id_periodo: idPeriodo,
          dia_semana: dia as any,
          estado: { in: ['confirmado', 'publicado'] }
        }
      });

      datos.push({
        dia: dia.charAt(0).toUpperCase() + dia.slice(1, 3),
        cantidad
      });
    }

    return NextResponse.json({ exito: true, datos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/estadisticas/carga-docente/route.ts
export async function GET_cargaDocente(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      },
      include: {
        docente: true
      }
    });

    const cargaPorDocente = new Map<number, { nombre: string; horas: number }>();

    horarios.forEach(h => {
      const [h1, m1] = h.hora_inicio.split(':').map(Number);
      const [h2, m2] = h.hora_fin.split(':').map(Number);
      const horas = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;

      if (!cargaPorDocente.has(h.id_docente)) {
        cargaPorDocente.set(h.id_docente, {
          nombre: `${h.docente.apellidos}, ${h.docente.nombres}`,
          horas: 0
        });
      }

      const actual = cargaPorDocente.get(h.id_docente)!;
      actual.horas += horas;
    });

    const datos = Array.from(cargaPorDocente.values())
      .sort((a, b) => b.horas - a.horas);

    return NextResponse.json({ exito: true, datos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Exportar funciones
export { GET_distribucionDia as GET_dist, GET_cargaDocente as GET_carga };
