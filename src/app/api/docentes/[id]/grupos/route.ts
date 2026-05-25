import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = searchParams.get('id_periodo');

    const grupos = await prisma.grupo.findMany({
      where: {
        horarios: {
          some: {
            docente: {
              id_docente: parseInt(params.id)
            }
          }
        },
        ...(idPeriodo && { id_periodo: parseInt(idPeriodo) })
      },
      include: {
        curso: {
          select: {
            nombre: true,
            codigo: true
          }
        },
        periodo: {
          select: {
            nombre: true
          }
        }
      }
    });

    return NextResponse.json({
      exito: true,
      datos: grupos
    });
  } catch (error: any) {
    console.error('Error obteniendo grupos del docente:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
