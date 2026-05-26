import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPDF } from '@/services/reportes/GeneradorPDF';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { id_periodo, dia_semana, formato = 'pdf' } = await request.json();

    if (!id_periodo || dia_semana === undefined || dia_semana === null) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: id_periodo, dia_semana' },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4, 5, 6].includes(dia_semana)) {
      return NextResponse.json(
        { error: 'día_semana debe ser entre 1 (Lunes) y 6 (Sábado)' },
        { status: 400 }
      );
    }

    if (formato === 'excel') {
      const buffer = await GeneradorPDF.generarExcelDia(id_periodo, dia_semana);
      const nombreDia = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dia_semana - 1];
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-auditoria-${nombreDia}-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    const pdf = await GeneradorPDF.generarReporteDia(id_periodo, dia_semana);
    const nombreDia = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dia_semana - 1];

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-auditoria-${nombreDia}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Error generando reporte de día:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando reporte' },
      { status: 500 }
    );
  }
}
