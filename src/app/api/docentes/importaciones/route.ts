import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ImportadorDocentes } from '@/services/importacion/ServiciosImportacion';
import { obtenerUsuarioAutenticadoOpcional } from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const historial = await prisma.historialImportacionDocente.findMany({
      include: {
        usuario_responsable: {
          select: {
            id_usuario: true,
            nombres: true,
            apellidos: true,
            codigo: true
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 20
    });

    return NextResponse.json({
      exito: true,
      datos: historial
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        exito: false,
        mensaje: error.message || 'No se pudo obtener el historial de importaciones.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuario = await obtenerUsuarioAutenticadoOpcional(request);

    const resultado = await ImportadorDocentes.importarRegistrosConfirmados({
      registros: body.registros || [],
      nombreArchivo: body.nombre_archivo || 'importacion-manual',
      formato: body.formato || 'manual',
      idUsuarioResponsable: usuario?.id_usuario || null
    });

    return NextResponse.json({
      exito: true,
      datos: resultado
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        exito: false,
        mensaje: error.message || 'No se pudo completar la importación.'
      },
      { status: 500 }
    );
  }
}
