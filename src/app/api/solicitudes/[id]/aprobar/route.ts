import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar que la solicitud existe
    const solicitud = await prisma.horarioAsignado.findUnique({
      where: { id_asignacion: id },
      include: {
        curso: true
      }
    });

    if (!solicitud) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Solicitud no encontrada'
      }, { status: 404 });
    }

    if (!['solicitado', 'borrador'].includes(solicitud.estado)) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Solo se pueden aprobar solicitudes pendientes'
      }, { status: 400 });
    }

    // Validar conflictos finales
    const conflictos = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: solicitud.id_periodo,
        dia_semana: solicitud.dia_semana,
        estado: {
          in: ['aprobado', 'confirmado']
        },
        AND: [
          { hora_inicio: { lt: solicitud.hora_fin } },
          { hora_fin: { gt: solicitud.hora_inicio } }
        ],
        NOT: {
          id_asignacion: id
        }
      },
      include: {
        curso: true
      }
    });

    // Validar conflictos básicos (docente, ambiente, grupo)
    for (const conflicto of conflictos) {
      if (conflicto.id_docente === solicitud.id_docente ||
          conflicto.id_ambiente === solicitud.id_ambiente ||
          conflicto.id_grupo === solicitud.id_grupo) {
        return NextResponse.json({
          exito: false,
          mensaje: 'Hay un conflicto con otro horario ya aprobado'
        }, { status: 400 });
      }
    }

    // VALIDACIÓN POR TIPO DE CLASE Y CICLO
    const gruposMismoCiclo = conflictos.filter(h => h.curso.ciclo === solicitud.curso.ciclo);

    if (gruposMismoCiclo.length > 0) {
      if (solicitud.tipo_clase === 'teoria') {
        // TEORÍA: Solo 1 grupo
        const hayTeoria = gruposMismoCiclo.some(h => h.tipo_clase === 'teoria');
        if (hayTeoria) {
          return NextResponse.json({
            exito: false,
            mensaje: 'Ya existe una clase de teoría en este horario'
          }, { status: 400 });
        }
      } else if (solicitud.tipo_clase === 'laboratorio' || solicitud.tipo_clase === 'practica') {
        // LABORATORIO/PRÁCTICA: Máximo 2 grupos
        const gruposLabPractica = gruposMismoCiclo.filter(h => 
          h.tipo_clase === 'laboratorio' || h.tipo_clase === 'practica'
        );
        
        if (gruposLabPractica.length >= 2) {
          return NextResponse.json({
            exito: false,
            mensaje: 'Ya existen 2 grupos de laboratorio/práctica en este horario'
          }, { status: 400 });
        }
      }
    }

    // Aprobar solicitud
    await prisma.horarioAsignado.update({
      where: { id_asignacion: id },
      data: { estado: 'aprobado' }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Solicitud aprobada exitosamente'
    });
  } catch (error: any) {
    console.error('Error aprobando solicitud:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
