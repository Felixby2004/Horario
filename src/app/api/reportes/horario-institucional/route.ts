import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPDF } from '@/services/reportes/GeneradorPDF';

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

export async function POST(request: NextRequest) {
  try {
    const { id_periodo } = await request.json();

    if (!id_periodo) {
      return NextResponse.json({ error: 'Parámetro requerido: id_periodo' }, { status: 400 });
    }

    const pdf = await GeneradorPDF.generarHorarioInstitucional(id_periodo);

    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="horario-institucional-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Error generando horario institucional:', error);
    return NextResponse.json({ error: error.message || 'Error generando reporte' }, { status: 500 });
  }
}
