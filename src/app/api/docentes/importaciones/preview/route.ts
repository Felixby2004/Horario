import { NextRequest, NextResponse } from 'next/server';
import { ImportadorDocentes } from '@/services/importacion/ServiciosImportacion';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const archivo = formData.get('archivo');

      if (!(archivo instanceof File)) {
        return NextResponse.json(
          {
            exito: false,
            mensaje: 'Debes adjuntar un archivo válido.'
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await archivo.arrayBuffer());
      const vistaPrevia = await ImportadorDocentes.generarVistaPreviaDesdeArchivo(
        buffer,
        archivo.name
      );

      return NextResponse.json({
        exito: true,
        datos: vistaPrevia
      });
    }

    const body = await request.json();
    const vistaPrevia = await ImportadorDocentes.generarVistaPreviaDesdeRegistros(
      body.registros || [],
      body.nombre_archivo || 'revalidacion-manual',
      body.formato || 'manual'
    );

    return NextResponse.json({
      exito: true,
      datos: vistaPrevia
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        exito: false,
        mensaje: error.message || 'No se pudo generar la vista previa de importación.'
      },
      { status: 500 }
    );
  }
}
