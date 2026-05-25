import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idDocente = parseInt(searchParams.get('docente') || '0');
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const horariosAsignados = await prisma.horarioAsignado.findMany({
      where: {
        id_docente: idDocente,
        id_periodo: idPeriodo,
        estado: { in: ['borrador', 'solicitado', 'aprobado', 'confirmado', 'publicado'] }
      },
      select: {
        id_asignacion: true,
        dia_semana: true,
        hora_inicio: true,
        hora_fin: true,
        tipo_clase: true,
        curso: { select: { nombre: true, ciclo: true } },
        ambiente: { select: { nombre: true } }
      }
    });

    const bloques = horariosAsignados.map(h => {
      const [hi, mi] = h.hora_inicio.split(':').map(Number);
      const minutosInicio = hi * 60 + mi;
      const bloque = Math.floor((minutosInicio - 420) / 90) + 1;

      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

      return {
        id: h.id_asignacion,
        dia: dias[h.dia_semana] || 'Lunes',
        bloque,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        tipo_clase: h.tipo_clase,
        curso: h.curso?.nombre,
        ciclo: h.curso?.ciclo,
        ambiente: h.ambiente?.nombre
      };
    });

    return NextResponse.json({
      exito: true,
      datos: bloques
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
