import { NextRequest, NextResponse } from 'next/server';
import { GestorVentanasAtencion } from '@/services/ventanas/GestorVentanasAtencion';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const cola = await GestorVentanasAtencion.obtenerColaDocentes(id);
    return NextResponse.json({ exito: true, datos: cola });
  } catch (error: any) {
    console.error('Error obteniendo cola:', error);
    return NextResponse.json({ exito: false, mensaje: error.message }, { status: 500 });
  }
}
