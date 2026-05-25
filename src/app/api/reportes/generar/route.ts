import { NextRequest, NextResponse } from 'next/server';
import { GeneradorPDF } from '@/services/reportes/GeneradorPDF';

export async function POST(request: NextRequest) {
  try {
    const { tipo, id_entidad, id_periodo } = await request.json();

    let pdf: Buffer;

    switch (tipo) {
      case 'aula':
      case 'laboratorio':
        pdf = await GeneradorPDF.generarReporteAula(id_entidad, id_periodo);
        break;
      case 'ciclo':
        pdf = await GeneradorPDF.generarReporteCiclo(id_periodo, id_entidad);
        break;
      case 'docente':
        pdf = await GeneradorPDF.generarReporteDocente(id_entidad, id_periodo);
        break;
      default:
        return NextResponse.json({ error: 'Tipo de reporte inválido' }, { status: 400 });
    }

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=reporte-${tipo}-${Date.now()}.pdf`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
