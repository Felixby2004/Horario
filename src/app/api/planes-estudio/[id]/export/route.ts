import { NextRequest, NextResponse } from 'next/server';
import { generarExcelPlanEstudio, generarPdfPlanEstudio } from '@/services/planesEstudioExport';

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idPlan = Number.parseInt(params.id, 10);
    if (!Number.isFinite(idPlan) || idPlan <= 0) {
      return NextResponse.json(
        { exito: false, error: 'El identificador del plan no es válido.' },
        { status: 400 }
      );
    }

    const formato = request.nextUrl.searchParams.get('formato') || 'pdf';
    const fecha = new Date().toISOString().slice(0, 10);

    if (formato === 'xlsx' || formato === 'excel') {
      const buffer = await generarExcelPlanEstudio(idPlan);
      return new NextResponse(buffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="plan-estudios-${fecha}.xlsx"`
        }
      });
    }

    const pdf = await generarPdfPlanEstudio(idPlan);
    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="plan-estudios-${fecha}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Error exportando plan de estudio:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'No se pudo exportar el plan de estudio.' },
      { status: 500 }
    );
  }
}
