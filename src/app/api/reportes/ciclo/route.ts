import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPDF } from '@/services/reportes/GeneradorPDF';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { id_periodo, ciclo, formato = 'pdf' } = await request.json();

    if (!id_periodo || !ciclo) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: id_periodo, ciclo' },
        { status: 400 }
      );
    }

    if (formato === 'excel') {
      const buffer = await GeneradorPDF.generarExcelCiclo(id_periodo, ciclo);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-ciclo-${ciclo}-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    const pdf = await GeneradorPDF.generarReporteCiclo(id_periodo, ciclo);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-ciclo-${ciclo}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Error generando reporte ciclo:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando reporte' },
      { status: 500 }
    );
  }
}
