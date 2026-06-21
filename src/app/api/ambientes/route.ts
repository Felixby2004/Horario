import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const TIPOS_AMBIENTE_VALIDOS = new Set(['aula', 'laboratorio', 'auditorio', 'sala_reuniones']);

function normalizarTexto(valor: unknown) {
  return String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseCapacidad(valor: unknown) {
  const capacidad = Number.parseInt(String(valor), 10);
  return Number.isFinite(capacidad) ? capacidad : NaN;
}

function validarAmbiente(datos: any, parcial = false) {
  const errores: Record<string, string> = {};
  const codigo = normalizarTexto(datos?.codigo);
  const nombre = normalizarTexto(datos?.nombre);
  const tipo = normalizarTexto(datos?.tipo);
  const capacidad = parseCapacidad(datos?.capacidad);

  if (!parcial || datos?.codigo !== undefined) {
    if (!codigo) errores.codigo = 'El código es obligatorio.';
  }

  if (!parcial || datos?.nombre !== undefined) {
    if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  }

  if (!parcial || datos?.tipo !== undefined) {
    if (!tipo) {
      errores.tipo = 'El tipo es obligatorio.';
    } else if (!TIPOS_AMBIENTE_VALIDOS.has(tipo)) {
      errores.tipo = 'El tipo de ambiente no es válido.';
    }
  }

  if (!parcial || datos?.capacidad !== undefined) {
    if (!Number.isFinite(capacidad) || capacidad <= 0) {
      errores.capacidad = 'La capacidad debe ser un número entero mayor que cero.';
    }
  }

  return errores;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    const ambientes = await prisma.ambiente.findMany({
      where: {
        activo: true,
        ...(tipo && { tipo: tipo as any })
      },
      orderBy: { codigo: 'asc' }
    });

    return NextResponse.json({
      exito: true,
      datos: ambientes
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const errores = validarAmbiente(datos);

    if (Object.keys(errores).length > 0) {
      return NextResponse.json(
        { exito: false, mensaje: 'Los datos del ambiente no son válidos.', errores },
        { status: 400 }
      );
    }

    const codigoNormalizado = normalizarTexto(datos.codigo).toUpperCase();
    const nombreNormalizado = normalizarTexto(datos.nombre);
    const tipoNormalizado = normalizarTexto(datos.tipo) as any;
    const capacidadNormalizada = parseCapacidad(datos.capacidad);
    const pisoNormalizado = normalizarTexto(datos.piso) || null;
    const pabellonNormalizado = normalizarTexto(datos.pabellon) || null;
    const equipamientoNormalizado = normalizarTexto(datos.equipamiento) || null;

    const existente = await prisma.ambiente.findUnique({
      where: {
        codigo: codigoNormalizado
      }
    });

    if (existente?.activo) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: `Ya existe un ambiente activo con el código "${codigoNormalizado}".`
        },
        { status: 409 }
      );
    }

    if (existente && !existente.activo) {
      const reactivado = await prisma.ambiente.update({
        where: {
          id_ambiente: existente.id_ambiente
        },
        data: {
          codigo: codigoNormalizado,
          nombre: nombreNormalizado,
          tipo: tipoNormalizado,
          capacidad: capacidadNormalizada,
          piso: pisoNormalizado,
          pabellon: pabellonNormalizado,
          equipamiento: equipamientoNormalizado,
          activo: true
        }
      });

      return NextResponse.json({
        exito: true,
        datos: reactivado,
        mensaje: `Se reactivó el ambiente existente con el código "${codigoNormalizado}".`
      });
    }

    const ambiente = await prisma.ambiente.create({
      data: {
        codigo: codigoNormalizado,
        nombre: nombreNormalizado,
        tipo: tipoNormalizado,
        capacidad: capacidadNormalizada,
        piso: pisoNormalizado,
        pabellon: pabellonNormalizado,
        equipamiento: equipamientoNormalizado
      }
    });

    return NextResponse.json({
      exito: true,
      datos: ambiente,
      mensaje: 'Ambiente creado correctamente.'
    });
  } catch (error: any) {
    const target = Array.isArray(error?.meta?.target)
      ? error.meta.target.join(', ')
      : String(error?.meta?.target || '');
    const mensaje =
      error?.code === 'P2002'
        ? target.includes('codigo')
          ? 'Ya existe un ambiente con ese código.'
          : target.includes('id_ambiente')
            ? 'No se pudo registrar el ambiente por una inconsistencia interna de numeración. Intenta nuevamente.'
            : 'No se pudo registrar el ambiente por un conflicto de datos únicos.'
        : error?.message || 'No se pudo registrar el ambiente.';

    return NextResponse.json({ exito: false, mensaje }, { status: 500 });
  }
}
