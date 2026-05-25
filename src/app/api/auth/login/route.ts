import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { codigo, password } = await request.json();

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { codigo },
      include: {
        docente: true
      }
    });

    if (!usuario) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      }, { status: 401 });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.contrasena_hash);

    if (!passwordValido) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Contraseña incorrecta'
      }, { status: 401 });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        codigo: usuario.codigo,
        rol: usuario.rol,
        id_docente: usuario.docente?.id_docente
      },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '8h' }
    );

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_acceso: new Date() }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        codigo: usuario.codigo,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo_electronico: usuario.correo_electronico,
        rol: usuario.rol,
        id_docente: usuario.docente?.id_docente
      }
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json({
      exito: false,
      mensaje: 'Error en el servidor'
    }, { status: 500 });
  }
}
