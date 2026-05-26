import { NextRequest, NextResponse } from 'next/server';
import { ServicioEstadisticas } from '@/services/estadisticas/ServicioEstadisticas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '1');

    const datos = await ServicioEstadisticas.obtenerAvancePorCategoria(idPeriodo);

    return NextResponse.json({
      exito: true,
      datos
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
