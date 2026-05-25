import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        fecha_creacion: 'desc'
      },
      select: {
        id_usuario: true,
        codigo: true,
        nombres: true,
        apellidos: true,
        correo_electronico: true,
        rol: true,
        activo: true,
        ultimo_acceso: true,
        fecha_creacion: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: usuarios
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
