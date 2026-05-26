import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { codigo, nombres, apellidos, correo_electronico, password, rol } = await request.json();

    // Validaciones
    if (!codigo || !nombres || !apellidos || !correo_electronico || !password || !rol) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Todos los campos son obligatorios'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        exito: false,
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      }, { status: 400 });
    }

    // Verificar si el código ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { codigo }
    });

    if (usuarioExistente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'El código de usuario ya está registrado'
      }, { status: 400 });
    }

    // Verificar si el email ya existe
    if (correo_electronico) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { correo_electronico }
      });

      if (emailExistente) {
        return NextResponse.json({
          exito: false,
          mensaje: 'El correo electrónico ya está registrado'
        }, { status: 400 });
      }
    }

    // Hash de la contraseña
    const contrasena_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        codigo,
        nombres,
        apellidos,
        correo_electronico,
        contrasena_hash,
        rol,
        activo: true
      }
    });

    // NOTA: Si el rol es docente, el usuario se crea aquí pero el registro
    // completo en tabla docente se hace desde Dashboard → Docentes → Importar
    // Esto permite que el admin configure correctamente modalidad, categoría, etc.

    return NextResponse.json({
      exito: true,
      mensaje: 'Usuario registrado exitosamente' + 
        (rol === 'docente' ? '. El administrador debe completar tus datos de docente.' : ''),
      datos: {
        id_usuario: nuevoUsuario.id_usuario,
        codigo: nuevoUsuario.codigo,
        nombres: nuevoUsuario.nombres,
        apellidos: nuevoUsuario.apellidos,
        correo_electronico: nuevoUsuario.correo_electronico,
        rol: nuevoUsuario.rol
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json({
      exito: false,
      mensaje: 'Error al registrar usuario: ' + error.message
    }, { status: 500 });
  }
}
