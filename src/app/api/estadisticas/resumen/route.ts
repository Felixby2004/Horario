import { NextRequest, NextResponse } from 'next/server';
import { ServicioEstadisticas } from '@/services/estadisticas/ServicioEstadisticas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '1');

    const resumen = await ServicioEstadisticas.obtenerResumenPeriodo(idPeriodo);

    return NextResponse.json({
      exito: true,
      datos: resumen
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
