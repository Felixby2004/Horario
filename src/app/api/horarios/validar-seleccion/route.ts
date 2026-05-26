import { NextRequest, NextResponse } from 'next/server';
import { ValidadorHorario } from '@/services/horarios/ValidadorHorario';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    const validaciones = await ValidadorHorario.validarSeleccion(
      datos.id_docente,
      datos.id_curso,
      datos.id_ambiente,
      datos.dia,
      datos.hora_inicio,
      datos.hora_fin,
      datos.id_periodo
    );

    const valido = validaciones.every(v => v.valido);

    return NextResponse.json({
      exito: true,
      valido,
      validaciones
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
