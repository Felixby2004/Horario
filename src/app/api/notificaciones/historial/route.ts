import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    const historial = await prisma.historialNotificaciones.findMany({
      where: estado && estado !== 'todas' ? { estado: estado as any } : {},
      orderBy: { fecha_envio: 'desc' },
      take: 100
    });

    return NextResponse.json({ exito: true, datos: historial });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
