import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { utilidadesFecha } from '@/lib/utilidadesFecha';
import { normalizarPayloadDocente, validarDatosDocente } from '@/lib/docentes';
import {
  construirErroresFormularioDocente,
  fusionarErroresDocente,
  validarUnicidadDocente
} from '@/lib/docentesIntegridad';

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
        },
        facultad: true,
        departamento: true
      },
      orderBy: [
        { modalidad: 'asc' },
        { categoria: 'asc' },
        { antiguedad: 'desc' }
      ]
    });

    // Actualizar antigüedad dinámicamente - siempre recalcular si hay fecha de ingreso
    const docentesActualizados = docentes.map(d => {
      let antiguedadCalculada = d.antiguedad || 0;
      if (d.fecha_ingreso) {
        antiguedadCalculada = utilidadesFecha.calcularAntiguedad(d.fecha_ingreso);
      }
      return { ...d, antiguedad: antiguedadCalculada };
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
    const payload = await request.json();
    const datos = normalizarPayloadDocente(payload);
    const errores = validarDatosDocente(datos);
    const erroresIntegridad = fusionarErroresDocente(
      construirErroresFormularioDocente(datos),
      await validarUnicidadDocente(datos)
    );

    if (errores.length > 0 || Object.keys(erroresIntegridad).length > 0) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: errores[0] || Object.values(erroresIntegridad)[0],
          errores,
          errores_campo: erroresIntegridad
        },
        { status: 400 }
      );
    }

    // Validar fecha de ingreso
    let fechaIngreso = null;
    if (datos.fecha_ingreso) {
      fechaIngreso = new Date(datos.fecha_ingreso);
      if (isNaN(fechaIngreso.getTime())) {
        return NextResponse.json({
          exito: false,
          mensaje: 'Fecha de ingreso inválida'
        }, { status: 400 });
      }
    }

    // Calcular antigüedad si hay fecha de ingreso
    const antiguedad = fechaIngreso 
      ? utilidadesFecha.calcularAntiguedad(fechaIngreso)
      : (datos.antiguedad || 0);

    const docente = await prisma.docente.create({
      data: {
        codigo_docente: datos.codigo_docente,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        modalidad: datos.modalidad,
        categoria: datos.categoria,
        categoria_ordinaria: datos.categoria_ordinaria || null,
        tipo_contrato: datos.tipo_contrato || null,
        tipo_extraordinario: datos.tipo_extraordinario || null,
        antiguedad: antiguedad,
        correo_electronico: datos.correo_electronico,
        telefono: datos.telefono,
        fecha_ingreso: fechaIngreso,
        grado_academico: datos.grado_academico,
        especialidad: datos.especialidad,
        dedicacion: datos.dedicacion,
        tipo_dedicacion_laboral: datos.tipo_dedicacion_laboral || 'tiempo_completo',
        dni_docente: datos.dni_docente || null,
        horas_maximas_semanales: datos.horas_maximas_semanales || 40,
        id_facultad: datos.id_facultad ? parseInt(datos.id_facultad) : null,
        id_departamento: datos.id_departamento ? parseInt(datos.id_departamento) : null,
        activo: true
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
