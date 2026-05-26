import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/horarios/obtener-generados
 * Obtiene los horarios generados de una sesión (temporales o ya guardados)
 * 
 * Query params:
 * - sesion_id: string (ID de la sesión de generación)
 * - periodo: number (opcional, ID del período)
 * - tipo: 'temporal' | 'definitivo' (opcional, tipo a obtener)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sesion_id = searchParams.get('sesion_id');
    const id_periodo = searchParams.get('periodo');
    const tipo = searchParams.get('tipo') || 'temporal'; // 'temporal' o 'definitivo'

    if (!sesion_id) {
      return NextResponse.json(
        { exito: false, error: 'sesion_id es requerido' },
        { status: 400 }
      );
    }

    let horarios = [];

    if (tipo === 'temporal') {
      // Obtener horarios temporales
      horarios = await prisma.seleccionTemporalHorario.findMany({
        where: {
          sesion_id,
          ...(id_periodo && { id_periodo: parseInt(id_periodo) })
        },
        include: {
          docente: { select: { id_docente: true, nombres: true, apellidos: true, codigo_docente: true } },
          curso: { select: { id_curso: true, codigo: true, nombre: true, ciclo: true } },
          grupo: { select: { id_grupo: true, codigo_grupo: true } },
          ambiente: { select: { id_ambiente: true, codigo: true, nombre: true, capacidad: true } },
          periodo: { select: { id_periodo: true, nombre: true } }
        },
        orderBy: [
          { id_periodo: 'asc' },
          { dia_semana: 'asc' },
          { hora_inicio: 'asc' }
        ]
      });
    } else {
      // Obtener horarios definitivos (ya guardados)
      horarios = await prisma.horarioAsignado.findMany({
        where: {
          ...(id_periodo && { id_periodo: parseInt(id_periodo) })
        },
        include: {
          docente: { select: { id_docente: true, nombres: true, apellidos: true, codigo_docente: true } },
          curso: { select: { id_curso: true, codigo: true, nombre: true, ciclo: true } },
          grupo: { select: { id_grupo: true, codigo_grupo: true, id_curso: true } },
          ambiente: { select: { id_ambiente: true, codigo: true, nombre: true, capacidad: true } },
          periodo: { select: { id_periodo: true, nombre: true, codigo: true } }
        },
        orderBy: [
          { id_periodo: 'asc' },
          { dia_semana: 'asc' },
          { hora_inicio: 'asc' }
        ]
      });
    }

    return NextResponse.json({
      exito: true,
      datos: {
        horarios,
        total: horarios.length,
        agrupados: {
          ciclo: agruparPorCiclo(horarios),
          aula: agruparPorAula(horarios),
          laboratorio: agruparPorLaboratorio(horarios),
          docente: agruparPorDocente(horarios)
        }
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo horarios generados:', error);
    return NextResponse.json(
      { exito: false, error: 'Error al obtener horarios' },
      { status: 500 }
    );
  }
}

function agruparPorCiclo(horarios: any[]) {
  const grupos = new Map<number, any[]>();
  horarios.forEach(h => {
    const ciclo = h.curso?.ciclo ?? 0;
    if (!grupos.has(ciclo)) grupos.set(ciclo, []);
    grupos.get(ciclo)!.push(h);
  });
  return Array.from(grupos.entries()).map(([ciclo, items]) => ({ ciclo, items }));
}

function agruparPorAula(horarios: any[]) {
  const grupos = new Map<string, any[]>();
  horarios.forEach(h => {
    if (h.tipo_clase === 'teoria') {
      const key = h.ambiente?.codigo || 'SIN_AULA';
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(h);
    }
  });
  return Array.from(grupos.entries()).map(([aula, items]) => ({ aula, items }));
}

function agruparPorLaboratorio(horarios: any[]) {
  const grupos = new Map<string, any[]>();
  horarios.forEach(h => {
    if (h.tipo_clase === 'laboratorio') {
      const key = h.ambiente?.codigo || 'SIN_LAB';
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(h);
    }
  });
  return Array.from(grupos.entries()).map(([lab, items]) => ({ lab, items }));
}

function agruparPorDocente(horarios: any[]) {
  const grupos = new Map<number, any[]>();
  horarios.forEach(h => {
    const key = h.docente?.id_docente || 0;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(h);
  });
  return Array.from(grupos.entries()).map(([id_docente, items]) => ({
    docente: items[0]?.docente || { id_docente },
    items
  }));
}
