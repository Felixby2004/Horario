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
    const ciclo = searchParams.get('ciclo');

    let where: any = {
      ...(modalidad && { modalidad: modalidad as any }),
      ...(categoria && { categoria: categoria as any }),
      ...(activo !== null && { activo: activo === 'true' })
    };

    // If ciclo is provided, filter docentes who have active DocenteCurso for courses in that ciclo
    if (ciclo) {
      const docenteCursos = await prisma.docenteCurso.findMany({
        where: {
          activo: true,
          curso: {
            ciclo: parseInt(ciclo)
          }
        },
        select: { id_docente: true }
      });
      const validDocenteIds = [...new Set(docenteCursos.map(dc => dc.id_docente))];
      if (validDocenteIds.length === 0) {
        return NextResponse.json({
          exito: true,
          datos: [],
          total: 0
        });
      }
      where.id_docente = { in: validDocenteIds };
    }

    const docentes = await prisma.docente.findMany({
      where,
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
