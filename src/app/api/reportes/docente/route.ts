import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPDF } from '@/services/reportes/GeneradorPDF';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { id_docente, id_periodo, tipo = 'horario', formato = 'pdf' } = await request.json();

    if (!id_docente || !id_periodo) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: id_docente, id_periodo' },
        { status: 400 }
      );
    }

    if (formato === 'excel') {
      const buffer = await GeneradorPDF.generarExcelDocente(id_docente, id_periodo);
      const nombreReporte = tipo === 'carga' ? 'carga-horaria' : 'horario-docente';
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-${nombreReporte}-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    }

    let pdf: Buffer;
    if (tipo === 'carga') {
      pdf = await GeneradorPDF.generarReporteCargaHoraria(id_docente, id_periodo);
    } else {
      pdf = await GeneradorPDF.generarReporteDocenteHorario(id_docente, id_periodo);
    }

    const nombreReporte = tipo === 'carga' ? 'carga-horaria' : 'horario-docente';

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-${nombreReporte}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Error generando reporte docente:', error);
    return NextResponse.json(
      { error: error.message || 'Error generando reporte' },
      { status: 500 }
    );
  }
}
