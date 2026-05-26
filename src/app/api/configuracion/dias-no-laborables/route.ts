import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// /api/configuracion/dias-no-laborables/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anio = searchParams.get('anio');

    const dias = await prisma.diaNoLaborable.findMany({
      where: anio ? {
        fecha: {
          gte: new Date(`${anio}-01-01`),
          lte: new Date(`${anio}-12-31`)
        }
      } : {},
      orderBy: { fecha: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: dias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    
    const dia = await prisma.diaNoLaborable.create({
      data: {
        fecha: new Date(datos.fecha),
        descripcion: datos.descripcion,
        tipo: datos.tipo || 'feriado',
        recurrente: datos.recurrente || false
      }
    });

    return NextResponse.json({ exito: true, datos: dia });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.diaNoLaborable.delete({
      where: { id_dia: parseInt(id) }
    });

    return NextResponse.json({ exito: true, mensaje: 'Día eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
