import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacion, verificarRol } from '@/lib/auth';

/**
 * GET /api/disponibilidad/fase
 * Obtiene información de la fase de disponibilidad de un período
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validar inicialización de Prisma
    if (!prisma) {
      console.error('Error crítico: Cliente Prisma no inicializado');
      return NextResponse.json(
        { error: 'Error interno de conexión a la base de datos' },
        { status: 500 }
      );
    }

    // 2. Validar que el modelo existe en el cliente (evitar error 500 por cliente desactualizado)
    if (!(prisma as any).faseDisponibilidad) {
      console.error('Error crítico: El modelo FaseDisponibilidad no existe en el cliente Prisma');
      return NextResponse.json(
        { error: 'El servicio de disponibilidad no está correctamente configurado' },
        { status: 500 }
      );
    }

    // Intentar verificar autenticación, pero no bloquear si falla
    let usuario;
    try {
      usuario = await verificarAutenticacion(request);
    } catch (authError) {
      console.warn('Petición a /api/disponibilidad/fase sin autenticación válida');
    }
    
    const { searchParams } = new URL(request.url);
    const idPeriodo = searchParams.get('idPeriodo');

    // 3. Validar existencia y formato de idPeriodo
    if (!idPeriodo || idPeriodo === 'undefined' || idPeriodo === 'null') {
      return NextResponse.json(
        { error: 'El parámetro idPeriodo es obligatorio' },
        { status: 400 }
      );
    }

    const idPeriodoNum = parseInt(idPeriodo);
    if (isNaN(idPeriodoNum)) {
      return NextResponse.json(
        { error: 'El parámetro idPeriodo debe ser un número válido' },
        { status: 400 }
      );
    }

    // 4. Ejecutar consulta con manejo de errores específico
    let fase;
    try {
      fase = await prisma.faseDisponibilidad.findUnique({
        where: { id_periodo: idPeriodoNum },
        include: {
          periodo: {
            select: { id_periodo: true, nombre: true, codigo: true }
          }
        }
      });
    } catch (dbError: any) {
      console.error('Error de base de datos en findUnique faseDisponibilidad:', dbError);
      return NextResponse.json(
        { 
          error: 'Error al consultar la base de datos',
          mensaje: dbError.message,
          ayuda: 'Verifique si la tabla fase_disponibilidad existe en la base de datos.'
        },
        { status: 500 }
      );
    }

    if (!fase) {
      return NextResponse.json(
        { 
          error: 'Fase no encontrada',
          mensaje: `No se encontró una fase de disponibilidad para el período ID: ${idPeriodoNum}`,
          periodo_id: idPeriodoNum
        },
        { status: 404 }
      );
    }

    return NextResponse.json(fase);
  } catch (error: any) {
    console.error('Error fatal en GET /api/disponibilidad/fase:', error);
    const status = error.message === 'No autorizado' || error.message === 'Token inválido' ? 401 : 500;
    return NextResponse.json(
      { 
        error: 'Ocurrió un error inesperado al obtener la fase de disponibilidad',
        mensaje: error.message
      },
      { status }
    );
  }
}

/**
 * POST /api/disponibilidad/fase
 * Crea una nueva fase de disponibilidad (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);
    await verificarRol(usuario.id_usuario, ['administrador_sistema', 'coordinador_academico']);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
    }

    const {
      idPeriodo,
      fechaInicio,
      fechaFin,
      bloquestiempo = 30,
      instrucciones
    } = body;

    // Validaciones
    if (!idPeriodo || !fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    const idPeriodoNum = parseInt(String(idPeriodo));
    if (isNaN(idPeriodoNum)) {
      return NextResponse.json({ error: 'idPeriodo inválido' }, { status: 400 });
    }

    // Verificar que no exista una fase ya creada
    const faseExistente = await prisma.faseDisponibilidad.findUnique({
      where: { id_periodo: idPeriodoNum }
    });

    if (faseExistente) {
      return NextResponse.json(
        { error: 'Ya existe una fase de disponibilidad para este período' },
        { status: 400 }
      );
    }

    // Verificar que el período exista
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id_periodo: idPeriodoNum }
    });

    if (!periodo) {
      return NextResponse.json(
        { error: 'Período no encontrado' },
        { status: 404 }
      );
    }

    const fase = await prisma.faseDisponibilidad.create({
      data: {
        id_periodo: idPeriodoNum,
        fecha_inicio: new Date(fechaInicio),
        fecha_fin: new Date(fechaFin),
        bloques_tiempo: String(bloquestiempo),
        instrucciones,
        estado: 'no_iniciada'
      },
      include: {
        periodo: {
          select: { id_periodo: true, nombre: true, codigo: true }
        }
      }
    });

    return NextResponse.json(fase, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/disponibilidad/fase:', error);
    let status = 500;
    if (error.message === 'No autorizado' || error.message === 'Token inválido') status = 401;
    if (error.message === 'No tiene permisos suficientes') status = 403;
    
    return NextResponse.json(
      { 
        error: 'Error al crear la fase de disponibilidad',
        mensaje: error.message
      },
      { status }
    );
  }
}

/**
 * PUT /api/disponibilidad/fase
 * Actualiza la fase de disponibilidad (estado, fechas, etc)
 */
export async function PUT(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);
    await verificarRol(usuario.id_usuario, ['administrador_sistema', 'coordinador_academico']);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
    }

    const {
      idFase,
      estado,
      fechaInicio,
      fechaFin,
      instrucciones,
      activo
    } = body;

    if (!idFase) {
      return NextResponse.json(
        { error: 'El parámetro idFase es requerido' },
        { status: 400 }
      );
    }

    const idFaseNum = parseInt(String(idFase));
    if (isNaN(idFaseNum)) {
      return NextResponse.json(
        { error: 'El parámetro idFase debe ser un número válido' },
        { status: 400 }
      );
    }

    // Verificar que la fase exista
    const faseExistente = await prisma.faseDisponibilidad.findUnique({
      where: { id_fase_disponibilidad: idFaseNum }
    });

    if (!faseExistente) {
      return NextResponse.json(
        { error: 'Fase no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const dataActualizar: any = {
      fecha_actualizacion: new Date()
    };

    if (estado) dataActualizar.estado = estado;
    
    if (fechaInicio) {
      const dInicio = new Date(fechaInicio);
      if (isNaN(dInicio.getTime())) {
        return NextResponse.json({ error: 'Fecha de inicio inválida' }, { status: 400 });
      }
      dataActualizar.fecha_inicio = dInicio;
    }

    if (fechaFin) {
      const dFin = new Date(fechaFin);
      if (isNaN(dFin.getTime())) {
        return NextResponse.json({ error: 'Fecha de fin inválida' }, { status: 400 });
      }
      dataActualizar.fecha_fin = dFin;
    }

    if (instrucciones !== undefined) dataActualizar.instrucciones = instrucciones;
    if (activo !== undefined) dataActualizar.activo = activo;

    const faseActualizada = await prisma.faseDisponibilidad.update({
      where: { id_fase_disponibilidad: idFaseNum },
      data: dataActualizar,
      include: {
        periodo: {
          select: { id_periodo: true, nombre: true, codigo: true }
        }
      }
    });

    return NextResponse.json(faseActualizada);
  } catch (error: any) {
    console.error('Error en PUT /api/disponibilidad/fase:', error);
    let status = 500;
    if (error.message === 'No autorizado' || error.message === 'Token inválido') status = 401;
    if (error.message === 'No tiene permisos suficientes') status = 403;

    return NextResponse.json(
      { 
        error: 'Error al actualizar la fase de disponibilidad',
        mensaje: error.message 
      },
      { status }
    );
  }
}
