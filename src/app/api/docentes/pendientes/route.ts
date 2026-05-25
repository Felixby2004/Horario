import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener usuarios con rol docente que NO tienen registro en tabla docente
    const usuariosPendientes = await prisma.usuario.findMany({
      where: {
        rol: 'docente',
        docente: null // No tienen registro en tabla docente
      },
      select: {
        id_usuario: true,
        codigo: true,
        nombres: true,
        apellidos: true,
        correo_electronico: true,
        fecha_creacion: true
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    return NextResponse.json({
      exito: true,
      datos: usuariosPendientes
    });
  } catch (error: any) {
    console.error('Error obteniendo usuarios pendientes:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
