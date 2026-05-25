import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacion, verificarRol } from '@/lib/auth';
import { procesarDisponibilidadYGenerarCitaciones } from '@/lib/disponibilidad';

/**
 * POST /api/disponibilidad/procesar
 * Procesa los registros de disponibilidad y genera las citaciones escalonadas
 * Body: {
 *   idFase: number,
 *   criterioOrdenamiento: 'antiguedad' | 'categoria' | 'combinado'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);
    await verificarRol(usuario.id_usuario, [
      'administrador_sistema',
      'coordinador_academico',
      'operador_horarios'
    ]);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
    }

    const { idFase, criterioOrdenamiento = 'combinado', convocatoria } = body;

    if (!idFase) {
      return NextResponse.json(
        { error: 'El parámetro idFase es requerido' },
        { status: 400 }
      );
    }

    const idFaseNum = parseInt(String(idFase));
    if (isNaN(idFaseNum)) {
      return NextResponse.json({ error: 'idFase inválido' }, { status: 400 });
    }

    // Obtener fase
    const fase = await prisma.faseDisponibilidad.findUnique({
      where: { id_fase_disponibilidad: idFaseNum },
      include: { periodo: true }
    });

    if (!fase) {
      return NextResponse.json(
        { error: 'Fase no encontrada' },
        { status: 404 }
      );
    }

    if (fase.estado !== 'cerrada') {
      return NextResponse.json(
        { error: 'La fase debe estar cerrada antes de procesar' },
        { status: 400 }
      );
    }

    // Procesar disponibilidad
    const force = body.force === true;
    const resultado = await procesarDisponibilidadYGenerarCitaciones(
      idFaseNum,
      fase.id_periodo,
      criterioOrdenamiento,
      convocatoria,
      force
    );

    // Actualizar estado de la fase a procesada
    await prisma.faseDisponibilidad.update({
      where: { id_fase_disponibilidad: idFaseNum },
      data: { estado: 'procesada' }
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error en POST /api/disponibilidad/procesar:', error);
    let status = 500;
    if (error.message === 'No autorizado' || error.message === 'Token inválido') status = 401;
    if (error.message === 'No tiene permisos suficientes') status = 403;

    return NextResponse.json(
      { 
        error: 'Error al procesar disponibilidad',
        mensaje: error.message
      },
      { status }
    );
  }
}

/**
 * GET /api/disponibilidad/procesar/estado
 * Obtiene el estado de procesamiento de una fase
 */
export async function GET(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);

    const { searchParams } = new URL(request.url);
    const idFase = searchParams.get('idFase');

    if (!idFase) {
      return NextResponse.json(
        { error: 'El parámetro idFase es requerido' },
        { status: 400 }
      );
    }

    const idFaseNum = parseInt(idFase);
    if (isNaN(idFaseNum)) {
      return NextResponse.json({ error: 'idFase debe ser un número' }, { status: 400 });
    }

    const fase = await prisma.faseDisponibilidad.findUnique({
      where: { id_fase_disponibilidad: idFaseNum },
      include: {
        registros_disponibilidad: {
          select: {
            id_registro: true,
            completado: true,
            docente: {
              select: {
                id_docente: true,
                codigo_docente: true,
                nombres: true,
                apellidos: true
              }
            }
          }
        }
      }
    });

    if (!fase) {
      return NextResponse.json(
        { error: 'Fase no encontrada' },
        { status: 404 }
      );
    }

    const totalDocentes = fase.registros_disponibilidad.length;
    const docentesCompletados = fase.registros_disponibilidad.filter(r => r.completado).length;

    return NextResponse.json({
      fase: {
        id_fase_disponibilidad: fase.id_fase_disponibilidad,
        estado: fase.estado,
        fecha_inicio: fase.fecha_inicio,
        fecha_fin: fase.fecha_fin
      },
      estadisticas: {
        totalDocentes,
        docentesCompletados,
        docentesPendientes: totalDocentes - docentesCompletados,
        porcentajeCompletacion: totalDocentes > 0 ? ((docentesCompletados / totalDocentes) * 100).toFixed(2) : 0
      },
      registros: fase.registros_disponibilidad
    });
  } catch (error: any) {
    console.error('Error en GET /api/disponibilidad/procesar:', error);
    let status = 500;
    if (error.message === 'No autorizado' || error.message === 'Token inválido') status = 401;

    return NextResponse.json(
      { 
        error: 'Error al obtener estado de procesamiento',
        mensaje: error.message
      },
      { status }
    );
  }
}
