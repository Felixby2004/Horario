import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacion } from '@/lib/auth';

/**
 * GET /api/disponibilidad/registro
 * Obtiene el registro de disponibilidad del docente actual
 */
export async function GET(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);

    // Obtener docente asociado al usuario
    const docente = await prisma.docente.findUnique({
      where: { id_usuario: usuario.id_usuario }
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idFase = searchParams.get('idFase');

    if (!idFase || idFase === 'undefined' || idFase === 'null') {
      return NextResponse.json(
        { error: 'El parámetro idFase es requerido' },
        { status: 400 }
      );
    }

    const idFaseNum = parseInt(idFase);
    if (isNaN(idFaseNum)) {
      return NextResponse.json(
        { error: 'El parámetro idFase debe ser un número válido' },
        { status: 400 }
      );
    }

    // Obtener registro de disponibilidad
    const registro = await prisma.disponibilidadDocenteRegistro.findUnique({
      where: {
        id_docente_id_fase: {
          id_docente: docente.id_docente,
          id_fase: idFaseNum
        }
      },
      include: {
        fase: {
          select: {
            id_fase_disponibilidad: true,
            estado: true,
            fecha_inicio: true,
            fecha_fin: true,
            bloques_tiempo: true
          }
        }
      }
    });

    return NextResponse.json(registro || { completado: false, matriz_disponibilidad: null });
  } catch (error) {
    console.error('Error en GET /api/disponibilidad/registro:', error);
    return NextResponse.json(
      { error: 'Error al obtener el registro de disponibilidad' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/disponibilidad/registro
 * Crea o actualiza el registro de disponibilidad del docente
 * Body: {
 *   idFase: number,
 *   matrizDisponibilidad: object // {"lunes": [true, false, ...], ...}
 *   bloquesPreferidos: object? // Bloques específicos preferidos
 *   notas: string?
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);

    // Obtener docente asociado al usuario
    const docente = await prisma.docente.findUnique({
      where: { id_usuario: usuario.id_usuario }
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { idFase, matrizDisponibilidad, bloquesPreferidos, notas } = body;

    if (!idFase || !matrizDisponibilidad) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    const idFaseNum = parseInt(String(idFase));
    if (isNaN(idFaseNum)) {
      return NextResponse.json(
        { error: 'El ID de la fase debe ser un número válido' },
        { status: 400 }
      );
    }

    // Verificar que la fase exista y esté abierta
    const fase = await prisma.faseDisponibilidad.findUnique({
      where: { id_fase_disponibilidad: idFaseNum }
    });

    if (!fase) {
      return NextResponse.json(
        { error: 'Fase de disponibilidad no encontrada' },
        { status: 404 }
      );
    }

    if (fase.estado !== 'abierta') {
      return NextResponse.json(
        { error: 'La fase de disponibilidad no está abierta' },
        { status: 400 }
      );
    }

    // Verificar que el período de la fase sea correcto
    const ahora = new Date();
    if (ahora < fase.fecha_inicio || ahora > fase.fecha_fin) {
      return NextResponse.json(
        { error: 'No estamos dentro del período de registro de disponibilidad' },
        { status: 400 }
      );
    }

    // Crear o actualizar el registro
    const registro = await prisma.disponibilidadDocenteRegistro.upsert({
      where: {
        id_docente_id_fase: {
          id_docente: docente.id_docente,
          id_fase: idFaseNum
        }
      },
      create: {
        id_docente: docente.id_docente,
        id_fase: idFaseNum,
        matriz_disponibilidad: matrizDisponibilidad,
        bloques_preferidos: bloquesPreferidos,
        notas,
        completado: true,
        fecha_actualizacion: new Date()
      },
      update: {
        matriz_disponibilidad: matrizDisponibilidad,
        bloques_preferidos: bloquesPreferidos,
        notas,
        completado: true,
        fecha_actualizacion: new Date()
      },
      include: {
        docente: {
          select: {
            id_docente: true,
            codigo_docente: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: 'Disponibilidad registrada exitosamente',
        registro 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/disponibilidad/registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar la disponibilidad' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/disponibilidad/registro
 * Actualiza un registro existente
 */
export async function PUT(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);

    // Obtener docente asociado al usuario
    const docente = await prisma.docente.findUnique({
      where: { id_usuario: usuario.id_usuario }
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { idFase, matrizDisponibilidad, bloquesPreferidos, notas } = body;

    if (!idFase) {
      return NextResponse.json(
        { error: 'El parámetro idFase es requerido' },
        { status: 400 }
      );
    }

    // Actualizar registro
    const registro = await prisma.disponibilidadDocenteRegistro.update({
      where: {
        id_docente_id_fase: {
          id_docente: docente.id_docente,
          id_fase: idFase
        }
      },
      data: {
        matriz_disponibilidad: matrizDisponibilidad,
        bloques_preferidos: bloquesPreferidos,
        notas,
        fecha_actualizacion: new Date()
      },
      include: {
        docente: {
          select: {
            id_docente: true,
            codigo_docente: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    return NextResponse.json(registro);
  } catch (error) {
    console.error('Error en PUT /api/disponibilidad/registro:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el registro de disponibilidad' },
      { status: 500 }
    );
  }
}
