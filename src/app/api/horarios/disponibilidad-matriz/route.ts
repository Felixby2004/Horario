import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idDocente = parseInt(searchParams.get('docente') || '0');
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');
    const idAmbiente = parseInt(searchParams.get('ambiente') || '0');

    const [horariosDocente, horariosAmbiente, config] = await Promise.all([
      prisma.horarioAsignado.findMany({
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
      }),
      idAmbiente ? prisma.horarioAsignado.findMany({
        where: {
          id_ambiente: idAmbiente,
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
          ambiente: { select: { nombre: true } },
          docente: { select: { apellidos: true, nombres: true } }
        }
      }) : [],
      prisma.configuracionSistema.findFirst()
    ]);

    const duracionBloque = config?.duracion_bloque || 90;
    const [hInicio, mInicio] = (config?.hora_inicio || '07:00').split(':').map(Number);
    const minutosInicioConfig = hInicio * 60 + mInicio;

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const procesarHorario = (h: any) => {
      const [hi, mi] = h.hora_inicio.split(':').map(Number);
      const minutosInicioActual = hi * 60 + mi;
      const bloque = Math.floor((minutosInicioActual - minutosInicioConfig) / duracionBloque) + 1;

      return {
        id: h.id_asignacion,
        dia: dias[h.dia_semana] || 'Lunes',
        bloque,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        tipo_clase: h.tipo_clase,
        curso: h.curso?.nombre,
        ciclo: h.curso?.ciclo,
        ambiente: h.ambiente?.nombre,
        docente: h.docente ? `${h.docente.apellidos}, ${h.docente.nombres}` : undefined
      };
    };

    return NextResponse.json({
      exito: true,
      datos: {
        docente: horariosDocente.map(procesarHorario),
        ambiente: horariosAmbiente.map(procesarHorario)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
