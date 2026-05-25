import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_usuario,
      codigo_docente,
      modalidad,
      categoria,
      dedicacion,
      antiguedad,
      fecha_ingreso,
      telefono,
      grado_academico,
      especialidad,
      horas_maximas_semanales
    } = body;

    // Validar que el usuario existe y es docente
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      include: { docente: true }
    });

    if (!usuario) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      }, { status: 404 });
    }

    if (usuario.rol !== 'docente') {
      return NextResponse.json({
        exito: false,
        mensaje: 'El usuario no tiene rol de docente'
      }, { status: 400 });
    }

    if (usuario.docente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Este usuario ya tiene un registro de docente'
      }, { status: 400 });
    }

    // Verificar que el codigo_docente no esté en uso
    const codigoExistente = await prisma.docente.findUnique({
      where: { codigo_docente }
    });

    if (codigoExistente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'El código de docente ya está en uso'
      }, { status: 400 });
    }

    // Calcular antigüedad si hay fecha de ingreso
    const antiguedadCalculada = fecha_ingreso 
      ? utilidadesFecha.calcularAntiguedad(fecha_ingreso)
      : (antiguedad || 0);

    // Crear docente
    const nuevoDocente = await prisma.docente.create({
      data: {
        codigo_docente,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        modalidad,
        categoria,
        dedicacion: dedicacion || 'tiempo_completo',
        antiguedad: antiguedadCalculada,
        fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : null,
        correo_electronico: usuario.correo_electronico,
        telefono: telefono || null,
        grado_academico: grado_academico || null,
        especialidad: especialidad || null,
        horas_maximas_semanales: horas_maximas_semanales || 40,
        activo: true,
        usuario: {
          connect: {
            id_usuario: id_usuario
          }
        }
      }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Docente importado exitosamente',
      datos: nuevoDocente
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error importando docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
