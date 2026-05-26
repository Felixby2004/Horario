import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    const ambientes = await prisma.ambiente.findMany({
      where: {
        activo: true,
        ...(tipo && { tipo: tipo as any })
      },
      orderBy: { codigo: 'asc' }
    });

    return NextResponse.json({
      exito: true,
      datos: ambientes
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    const ambiente = await prisma.ambiente.create({
      data: {
        codigo: datos.codigo,
        nombre: datos.nombre,
        tipo: datos.tipo,
        capacidad: datos.capacidad,
        piso: datos.piso,
        pabellon: datos.pabellon,
        equipamiento: datos.equipamiento
      }
    });

    return NextResponse.json({
      exito: true,
      datos: ambiente
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
