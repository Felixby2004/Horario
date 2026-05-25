import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/docentes/me
 * Obtiene la información del docente logueado
 * Requiere:
 * - User info en localStorage (en el cliente)
 * - id_docente en la sesión
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener id_docente del header o query params
    const id_docente = request.headers.get('x-docente-id') || 
                       new URL(request.url).searchParams.get('id_docente');

    if (!id_docente) {
      return NextResponse.json(
        { error: 'No estás autenticado como docente' },
        { status: 401 }
      );
    }

    const docente = await prisma.docente.findUnique({
      where: { id_docente: parseInt(id_docente) },
      include: {
        usuario: {
          select: {
            id_usuario: true,
            correo_electronico: true,
            rol: true
          }
        },
        cursos: {
          where: { activo: true },
          include: {
            curso: {
              select: {
                id_curso: true,
                codigo: true,
                nombre: true,
                horas_teoria: true,
                horas_laboratorio: true,
                horas_practica: true,
                ciclo: true,
                creditos: true
              }
            }
          }
        }
      }
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'Docente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exito: true,
      datos: docente
    });
  } catch (error: any) {
    console.error('Error obteniendo docente logueado:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
