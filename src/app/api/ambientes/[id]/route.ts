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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const ambiente = await prisma.ambiente.findUnique({
      where: { id_ambiente: id }
    });

    if (!ambiente) {
      return NextResponse.json(
        { exito: false, mensaje: 'Ambiente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      datos: ambiente
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const datos = await request.json();
    const capacidad = datos.capacidad !== undefined ? parseCapacidad(datos.capacidad) : undefined;

    if (datos.tipo !== undefined && !TIPOS_AMBIENTE_VALIDOS.has(normalizarTexto(datos.tipo))) {
      return NextResponse.json(
        { exito: false, mensaje: 'El tipo de ambiente no es válido.' },
        { status: 400 }
      );
    }

    if (datos.capacidad !== undefined && (!Number.isFinite(capacidad) || Number(capacidad) <= 0)) {
      return NextResponse.json(
        { exito: false, mensaje: 'La capacidad debe ser un número entero mayor que cero.' },
        { status: 400 }
      );
    }

    const ambiente = await prisma.ambiente.update({
      where: { id_ambiente: id },
      data: {
        ...(datos.codigo !== undefined && { codigo: normalizarTexto(datos.codigo).toUpperCase() }),
        ...(datos.nombre !== undefined && { nombre: normalizarTexto(datos.nombre) }),
        ...(datos.tipo !== undefined && { tipo: normalizarTexto(datos.tipo) as any }),
        ...(datos.capacidad !== undefined && { capacidad }),
        ...(datos.piso !== undefined && { piso: normalizarTexto(datos.piso) || null }),
        ...(datos.pabellon !== undefined && { pabellon: normalizarTexto(datos.pabellon) || null }),
        ...(datos.equipamiento !== undefined && { equipamiento: normalizarTexto(datos.equipamiento) || null }),
        ...(datos.caracteristicas !== undefined && { caracteristicas: datos.caracteristicas }),
        ...(datos.observaciones !== undefined && { observaciones: normalizarTexto(datos.observaciones) || null }),
        ...(datos.activo !== undefined && { activo: datos.activo })
      }
    });

    return NextResponse.json({
      exito: true,
      datos: ambiente,
      mensaje: 'Ambiente actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando ambiente:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Soft delete: marcar como inactivo
    await prisma.ambiente.update({
      where: { id_ambiente: id },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Ambiente desactivado exitosamente'
    });
  } catch (error: any) {
    console.error('Error desactivando ambiente:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
