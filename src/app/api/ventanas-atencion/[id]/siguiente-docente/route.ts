import { NextRequest, NextResponse } from 'next/server';
import { GestorVentanasAtencion } from '@/services/ventanas/GestorVentanasAtencion';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const docente = await GestorVentanasAtencion.siguienteDocente(id);
    return NextResponse.json({ exito: true, docente });
  } catch (error: any) {
    console.error('Error avanzando cola:', error);
    return NextResponse.json({ exito: false, mensaje: error.message }, { status: 500 });
  }
}
