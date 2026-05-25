import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ValidadorConflictos } from '@/services/horarios/ServiciosAvanzados';

// /api/horarios/validar-todo/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    if (!idPeriodo) {
      return NextResponse.json({ error: 'Período requerido' }, { status: 400 });
    }

    // Obtener todos los horarios del período
    const horarios = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: idPeriodo,
        estado: { in: ['confirmado', 'publicado'] }
      }
    });

    // Detectar conflictos
    const conflictos = await ValidadorConflictos.detectarTodosConflictos(idPeriodo);

    // Calcular estadísticas
    const total = horarios.length;
    const errores = conflictos.filter(c => c.tipo.includes('Conflicto')).length;
    const advertencias = conflictos.filter(c => !c.tipo.includes('Conflicto')).length;
    const validos = total - errores;

    return NextResponse.json({
      exito: true,
      resultados: {
        total,
        validos,
        errores,
        advertencias,
        conflictos
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
