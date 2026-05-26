import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { verificarAutenticacion, verificarRol, obtenerDocenteDelUsuario } from '@/lib/auth';
import { enviarNotificacionCitacion } from '@/lib/notificaciones';

/**
 * GET /api/citaciones
 * Obtiene citaciones según el contexto:
 * - Docente: sus propias citaciones
 * - Admin: todas las citaciones de un período
 */
export async function GET(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);

    const { searchParams } = new URL(request.url);
    const idPeriodo = searchParams.get('idPeriodo');
    const idDocente = searchParams.get('idDocente');
    const estado = searchParams.get('estado');

    // Construir filtro
    const where: any = {};

    if (idPeriodo) {
      where.id_periodo = parseInt(idPeriodo);
    }

    // Si es docente, solo ver sus propias citaciones
    const docente = await obtenerDocenteDelUsuario(usuario);

    if (docente) {
      where.id_docente = docente.id_docente;
    } else if (idDocente) {
      // Solo admin/coordinador puede ver citaciones de otros
      await verificarRol(usuario.id_usuario, [
        'administrador_sistema',
        'coordinador_academico',
        'operador_horarios'
      ]);
      where.id_docente = parseInt(idDocente);
    }

    if (estado) {
      where.estado = estado;
    }

    const citaciones = await prisma.citacionDocente.findMany({
      where,
      include: {
        docente: {
          select: {
            id_docente: true,
            codigo_docente: true,
            nombres: true,
            apellidos: true,
            categoria: true,
            modalidad: true,
            antiguedad: true
          }
        },
        ventana: {
          select: {
            id_ventana: true,
            fecha: true,
            hora_inicio: true,
            hora_fin: true
          }
        }
      },
      orderBy: [
        { fecha_citacion: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    return NextResponse.json(citaciones);
  } catch (error: any) {
    console.error('Error en GET /api/citaciones:', error);
    const respuesta: any = { error: 'Error al obtener citaciones' };
    if (process.env.NODE_ENV !== 'production') {
      respuesta.detalle = error.message;
    }
    return NextResponse.json(respuesta, { status: 500 });
  }
}

/**
 * POST /api/citaciones
 * Crea citaciones escalonadas para docentes (solo admin)
 * Body: {
 *   idVentana: number,
 *   docentes: { id_docente, numero_orden_turno }[], // Array de docentes a citar
 *   observaciones: string?
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);
    await verificarRol(usuario.id_usuario, [
      'administrador_sistema',
      'operador_horarios',
      'coordinador_academico'
    ]);

    const body = await request.json();
    const { idVentana, docentes, observaciones } = body;

    if (!idVentana || !docentes || !Array.isArray(docentes)) {
      return NextResponse.json(
        { error: 'Parámetros requeridos faltantes' },
        { status: 400 }
      );
    }

    // Obtener información de la ventana
    const ventana = await prisma.ventanaAtencion.findUnique({
      where: { id_ventana: idVentana },
      include: { periodo: true }
    });

    if (!ventana) {
      return NextResponse.json(
        { error: 'Ventana de atención no encontrada' },
        { status: 404 }
      );
    }

    // Crear citaciones
    const citacionesCreadas = [];

    for (const docente of docentes) {
      // Calcular hora de la cita basada en el número de turno
      const bloquesTiempo = parseInt(ventana.intervalo_minutos as any);
      const [horaInicio, minutoInicio] = ventana.hora_inicio.split(':').map(Number);
      
      const minutosCita = minutoInicio + (docente.numero_orden_turno - 1) * bloquesTiempo;
      const minutosEnteros = minutosCita % 60;
      const horasAdicionales = Math.floor(minutosCita / 60);
      const horaFinal = horaInicio + horasAdicionales;

      const horaCitacion = `${String(horaFinal).padStart(2, '0')}:${String(minutosEnteros).padStart(2, '0')}`;
      const horaFin = `${String(horaFinal).padStart(2, '0')}:${String(minutosEnteros + bloquesTiempo).padStart(2, '0')}`;

      try {
        const citacion = await prisma.citacionDocente.create({
          data: {
            id_docente: docente.id_docente,
            id_periodo: ventana.id_periodo,
            id_ventana: idVentana,
            fecha_citacion: ventana.fecha,
            hora_inicio: horaCitacion,
            hora_fin: horaFin,
            numero_orden_turno: docente.numero_orden_turno,
            estado: 'programada',
            observaciones,
            notificacion_enviada: false
          },
          include: {
            docente: true,
            ventana: true
          }
        });

        citacionesCreadas.push(citacion);

        // Enviar notificación al docente (async)
        await enviarNotificacionCitacion(
          docente.id_docente,
          citacion,
          ventana.periodo
        ).catch(err => console.error('Error enviando notificación:', err));

      } catch (error: any) {
        // Si ya existe una citación para este docente, actualizar
        if (error.code === 'P2002') {
          const citacionExistente = await prisma.citacionDocente.update({
            where: {
              id_docente_id_periodo_id_ventana: {
                id_docente: docente.id_docente,
                id_periodo: ventana.id_periodo,
                id_ventana: idVentana
              }
            },
            data: {
              numero_orden_turno: docente.numero_orden_turno,
              hora_inicio: horaCitacion,
              hora_fin: horaFin,
              estado: 'programada',
              observaciones
            },
            include: {
              docente: true,
              ventana: true
            }
          });

          citacionesCreadas.push(citacionExistente);
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json(
      {
        message: `${citacionesCreadas.length} citaciones creadas exitosamente`,
        citaciones: citacionesCreadas
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/citaciones:', error);
    return NextResponse.json(
      { error: 'Error al crear citaciones' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/citaciones
 * Actualiza el estado de una citación
 * Body: {
 *   idCitacion: number,
 *   estado: 'confirmada_docente' | 'rechazada' | 'cancelada',
 *   razonRechazo?: string,
 *   confirmadoDocente?: boolean
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);
    const body = await request.json();
    const { idCitacion, estado, razonRechazo, confirmadoDocente } = body;

    if (!idCitacion) {
      return NextResponse.json(
        { error: 'El parámetro idCitacion es requerido' },
        { status: 400 }
      );
    }

    // Obtener citación actual
    const citacion = await prisma.citacionDocente.findUnique({
      where: { id_citacion: idCitacion }
    });

    if (!citacion) {
      return NextResponse.json(
        { error: 'Citación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos: docente solo puede confirmar/rechazar su propia citación
    const docente = await obtenerDocenteDelUsuario(usuario);

    if (docente && docente.id_docente !== citacion.id_docente) {
      return NextResponse.json(
        { error: 'No tiene permiso para modificar esta citación' },
        { status: 403 }
      );
    }

    // Preparar datos a actualizar
    const dataActualizar: any = {
      fecha_actualizacion: new Date()
    };

    if (estado) {
      dataActualizar.estado = estado;
    }

    if (confirmadoDocente !== undefined) {
      dataActualizar.confirmado_docente = confirmadoDocente;
      if (confirmadoDocente) {
        dataActualizar.fecha_confirmacion = new Date();
        dataActualizar.estado = 'confirmada_docente';
      }
    }

    if (razonRechazo) {
      dataActualizar.razon_rechazo = razonRechazo;
      dataActualizar.estado = 'rechazada';
    }

    // Actualizar citación
    const citacionActualizada = await prisma.citacionDocente.update({
      where: { id_citacion: idCitacion },
      data: dataActualizar,
      include: {
        docente: true,
        ventana: true
      }
    });

    // Registrar en historial
    await prisma.historialCitacion.create({
      data: {
        id_citacion: idCitacion,
        accion: estado === 'confirmada_docente' ? 'confirmar' : estado === 'rechazada' ? 'rechazar' : 'actualizar',
        estado_anterior: citacion.estado,
        estado_nuevo: dataActualizar.estado || citacion.estado,
        razon: razonRechazo,
        usuario_id: usuario.id_usuario
      }
    });

    return NextResponse.json(citacionActualizada);
  } catch (error) {
    console.error('Error en PUT /api/citaciones:', error);
    const respuesta: any = { error: 'Error al actualizar citación' };
    if (process.env.NODE_ENV !== 'production') respuesta.detalle = (error as any).message;
    return NextResponse.json(respuesta, { status: 500 });
  }
}
