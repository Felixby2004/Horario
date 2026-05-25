import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPDF } from '@/services/reportes/GeneradorPDF';

export async function POST(request: NextRequest) {
  try {
    const { id_ambiente, id_periodo, formato = 'pdf' } = await request.json();

    if (!id_ambiente || !id_periodo) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: id_ambiente, id_periodo' },
        { status: 400 }
      );
    }

    if (formato === 'excel') {
      const buffer = await GeneradorPDF.generarExcelAula(id_ambiente, id_periodo);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-aula-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    const pdf = await GeneradorPDF.generarReporteAula(id_ambiente, id_periodo);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-aula-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Error generando reporte aula:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando reporte' },
      { status: 500 }
    );
  }
}
