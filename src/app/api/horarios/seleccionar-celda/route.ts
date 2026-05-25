import { NextRequest, NextResponse } from 'next/server';
import { GestorSeleccionTemporal } from '@/services/horarios/GestorSeleccionTemporal';
import { ValidadorHorario } from '@/services/horarios/ValidadorHorario';

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    
    const camposRequeridos = [
      'sesionId', 'docenteId', 'cursoId', 'grupoId', 
      'tipoClase', 'ambienteId', 'diaSemana', 
      'horaInicio', 'horaFin', 'periodo'
    ];

    for (const campo of camposRequeridos) {
      if (!datos[campo]) {
        return NextResponse.json(
          { error: `Campo requerido: ${campo}` },
          { status: 400 }
        );
      }
    }

    const resultadoValidacion = await ValidadorHorario.validarAsignacion({
      sesionId: datos.sesionId,
      docenteId: datos.docenteId,
      cursoId: datos.cursoId,
      grupoId: datos.grupoId,
      tipoClase: datos.tipoClase,
      ambienteId: datos.ambienteId,
      diaSemana: datos.diaSemana,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      periodoId: datos.periodo
    });

    if (!resultadoValidacion.valido) {
      return NextResponse.json({
        exito: false,
        conflictos: resultadoValidacion.conflictos
      });
    }

    const resultado = await GestorSeleccionTemporal.seleccionarCelda({
      sesionId: datos.sesionId,
      docenteId: datos.docenteId,
      cursoId: datos.cursoId,
      grupoId: datos.grupoId,
      tipoClase: datos.tipoClase,
      ambienteId: datos.ambienteId,
      diaSemana: datos.diaSemana,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      periodoId: datos.periodo
    });

    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Error en selección de celda:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
