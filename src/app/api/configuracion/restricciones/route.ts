import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// /api/configuracion/restricciones/route.ts
export async function GET(request: NextRequest) {
  try {
    const restricciones = await prisma.restriccionHoraria.findMany({
      where: { activo: true },
      orderBy: { prioridad: 'desc' }
    });

    return NextResponse.json({ exito: true, datos: restricciones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    
    const restriccion = await prisma.restriccionHoraria.create({
      data: {
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        dias_aplicables: datos.dias_aplicables,
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin,
        prioridad: datos.prioridad || 1,
        activo: true
      }
    });

    return NextResponse.json({ exito: true, datos: restriccion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
