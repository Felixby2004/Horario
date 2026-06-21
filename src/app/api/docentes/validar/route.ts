import { NextRequest, NextResponse } from 'next/server';
import {
  construirErroresFormularioDocente,
  fusionarErroresDocente,
  validarUnicidadDocente
} from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const excludeId = body.excludeId ? parseInt(String(body.excludeId), 10) : undefined;

    const errores = fusionarErroresDocente(
      construirErroresFormularioDocente(body),
      await validarUnicidadDocente(body, { excludeId })
    );

    return NextResponse.json({
      exito: true,
      valido: Object.keys(errores).length === 0,
      errores
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        exito: false,
        mensaje: error.message || 'No se pudo validar el docente.'
      },
      { status: 500 }
    );
  }
}
