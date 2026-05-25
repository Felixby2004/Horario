import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ServicioReportes } from '@/services/ServiciosEspecializados';

// /api/reportes/aula/route.ts
export async function POST_aula(request: NextRequest) {
  try {
    const { id_periodo, id_ambiente } = await request.json();

    const ambiente = await prisma.ambiente.findUnique({
      where: { id_ambiente }
    });

    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo,
        id_ambiente,
        estado: { in: ['confirmado', 'publicado'] }
      },
      include: {
        curso: true,
        docente: true,
        grupo: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo }
    });

    const pdf = await ServicioReportes.generarPDF('aula', {
      nombreAula: ambiente?.nombre,
      periodo: periodo?.nombre,
      horarios
    });

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="horario-${ambiente?.nombre}.pdf"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/reportes/gestion/route.ts
export async function POST_gestion(request: NextRequest) {
  try {
    const { id_periodo } = await request.json();

    const estadisticas = await obtenerEstadisticas(id_periodo);

    const pdf = await ServicioReportes.generarPDF('gestion', {
      periodo: estadisticas.periodo,
      ...estadisticas
    });

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-gestion.pdf"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/reportes/conflictos/route.ts
export async function POST_conflictos(request: NextRequest) {
  try {
    const { id_periodo } = await request.json();

    const conflictos = await detectarConflictos(id_periodo);

    const pdf = await ServicioReportes.generarPDF('conflictos', {
      conflictos,
      total: conflictos.length
    });

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-conflictos.pdf"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function obtenerEstadisticas(idPeriodo: number) {
  const periodo = await prisma.periodoAcademico.findUnique({
    where: { id_periodo: idPeriodo }
  });

  const totalHorarios = await prisma.horarioAsignado.count({
    where: {
      id_periodo: idPeriodo,
      estado: { in: ['confirmado', 'publicado'] }
    }
  });

  const totalDocentes = await prisma.docente.count({
    where: { activo: true }
  });

  const ocupacionAmbientes = await calcularOcupacionAmbientes(idPeriodo);

  return {
    periodo: periodo?.nombre,
    totalHorarios,
    totalDocentes,
    ocupacionAmbientes
  };
}

async function calcularOcupacionAmbientes(idPeriodo: number) {
  const ambientes = await prisma.ambiente.findMany({
    where: { activo: true }
  });

  const bloquesPorAmbiente = 50; // 10 bloques × 5 días

  const ocupacion = await Promise.all(
    ambientes.map(async (ambiente) => {
      const ocupados = await prisma.horarioAsignado.count({
        where: {
          id_periodo: idPeriodo,
          id_ambiente: ambiente.id_ambiente,
          estado: { in: ['confirmado', 'publicado'] }
        }
      });

      return {
        nombre: ambiente.nombre,
        porcentaje: Math.round((ocupados / bloquesPorAmbiente) * 100)
      };
    })
  );

  return ocupacion;
}

async function detectarConflictos(idPeriodo: number) {
  const { ValidadorConflictos } = await import('@/services/horarios/ServiciosAvanzados');
  return await ValidadorConflictos.detectarTodosConflictos(idPeriodo);
}

export { POST_aula, POST_gestion, POST_conflictos };
