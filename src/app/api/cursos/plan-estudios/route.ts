import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      orderBy: [
        { ciclo: 'asc' },
        { codigo: 'asc' }
      ]
    });

    return NextResponse.json({ exito: true, datos: cursos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
