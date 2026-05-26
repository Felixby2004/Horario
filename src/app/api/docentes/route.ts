import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modalidad = searchParams.get('modalidad');
    const categoria = searchParams.get('categoria');
    const activo = searchParams.get('activo');

    const docentes = await prisma.docente.findMany({
      where: {
        ...(modalidad && { modalidad: modalidad as any }),
        ...(categoria && { categoria: categoria as any }),
        ...(activo !== null && { activo: activo === 'true' })
      },
      include: {
        usuario: {
          select: {
            correo_electronico: true,
            rol: true
          }
        }
      },
      orderBy: [
        { modalidad: 'asc' },
        { categoria: 'asc' },
        { antiguedad: 'desc' }
      ]
    });

    // Actualizar antigüedad dinámicamente si tienen fecha de ingreso
    const docentesActualizados = docentes.map(d => {
      if (d.fecha_ingreso) {
        const antiguedadCalculada = utilidadesFecha.calcularAntiguedad(d.fecha_ingreso);
        return { ...d, antiguedad: antiguedadCalculada };
      }
      return d;
    });

    return NextResponse.json({
      exito: true,
      datos: docentesActualizados,
      total: docentesActualizados.length
    });
  } catch (error) {
    console.error('Error obteniendo docentes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    // Calcular antigüedad si hay fecha de ingreso
    const antiguedad = datos.fecha_ingreso 
      ? utilidadesFecha.calcularAntiguedad(datos.fecha_ingreso)
      : (datos.antiguedad || 0);

    const docente = await prisma.docente.create({
      data: {
        codigo_docente: datos.codigo_docente,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        modalidad: datos.modalidad,
        categoria: datos.categoria,
        antiguedad: antiguedad,
        correo_electronico: datos.correo_electronico,
        telefono: datos.telefono,
        fecha_ingreso: datos.fecha_ingreso ? new Date(datos.fecha_ingreso) : null,
        grado_academico: datos.grado_academico,
        especialidad: datos.especialidad,
        dedicacion: datos.dedicacion
      }
    });

    return NextResponse.json({
      exito: true,
      datos: docente,
      mensaje: 'Docente creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando docente:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear docente' },
      { status: 500 }
    );
  }
}
