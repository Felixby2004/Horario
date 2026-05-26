import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datos = await request.json();
    
    // Preparar datos para actualizar
    const dataToUpdate: any = {};
    
    // Permitir actualizar nombres y apellidos
    if (datos.nombres !== undefined) {
      dataToUpdate.nombres = datos.nombres;
    }
    if (datos.apellidos !== undefined) {
      dataToUpdate.apellidos = datos.apellidos;
    }
    if (datos.correo_electronico !== undefined) {
      dataToUpdate.correo_electronico = datos.correo_electronico;
    }
    
    // Permitir actualizar contraseña (solo si se proporciona una nueva)
    if (datos.contrasena) {
      // Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.contrasena_hash = await bcrypt.hash(datos.contrasena, salt);
    }
    
    // Permitir actualizar estado (para administradores)
    if (datos.activo !== undefined) {
      dataToUpdate.activo = datos.activo;
    }

    const usuario = await prisma.usuario.update({
      where: { id_usuario: parseInt(params.id) },
      data: dataToUpdate,
      select: {
        id_usuario: true,
        codigo: true,
        nombres: true,
        apellidos: true,
        correo_electronico: true,
        rol: true,
        activo: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: usuario,
      mensaje: 'Usuario actualizado exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.usuario.delete({
      where: { id_usuario: parseInt(params.id) }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Usuario eliminado exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
