import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizarPayloadDocente, validarDatosDocente } from '@/lib/docentes';
import {
  construirErroresFormularioDocente,
  fusionarErroresDocente,
  obtenerCambiosDocente,
  obtenerUsuarioAutenticadoOpcional,
  registrarHistorialEdicionDocente,
  validarUnicidadDocente
} from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const docente = await prisma.docente.findUnique({
      where: { id_docente: id },
      include: {
        usuario: true,
        facultad: true,
        departamento: true,
        cursos: {
          where: { activo: true },
          include: {
            curso: true
          },
          orderBy: {
            fecha_asignacion: 'desc'
          }
        },
        grupos: {
          where: { activo: true },
          include: {
            grupo: {
              include: {
                curso: true,
                periodo: true
              }
            }
          },
          orderBy: {
            fecha_asignacion: 'desc'
          }
        },
        historial_ediciones: {
          include: {
            usuario_editor: {
              select: {
                id_usuario: true,
                nombres: true,
                apellidos: true,
                codigo: true
              }
            }
          },
          orderBy: {
            fecha_edicion: 'desc'
          },
          take: 10
        }
      }
    });

    if (!docente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Docente no encontrado'
      }, { status: 404 });
    }

    // Recalcular antigüedad dinámicamente - siempre recalcular si hay fecha de ingreso
    let antiguedadCalculada = docente.antiguedad || 0;
    if (docente.fecha_ingreso) {
      antiguedadCalculada = utilidadesFecha.calcularAntiguedad(docente.fecha_ingreso);
    }
    docente.antiguedad = antiguedadCalculada;

    return NextResponse.json({
      exito: true,
      datos: docente
    });
  } catch (error: any) {
    console.error('Error obteniendo docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const payload = await request.json();
    const body = normalizarPayloadDocente(payload);
    const docenteAnterior = await prisma.docente.findUnique({
      where: { id_docente: id },
      include: {
        facultad: true,
        departamento: true
      }
    });

    if (!docenteAnterior) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Docente no encontrado'
      }, { status: 404 });
    }

    const errores = validarDatosDocente(body);
    const erroresIntegridad = fusionarErroresDocente(
      construirErroresFormularioDocente(body),
      await validarUnicidadDocente(body, { excludeId: id })
    );

    if (errores.length > 0 || Object.keys(erroresIntegridad).length > 0) {
      return NextResponse.json({
        exito: false,
        mensaje: errores[0] || Object.values(erroresIntegridad)[0],
        errores,
        errores_campo: erroresIntegridad
      }, { status: 400 });
    }

    // Si se actualiza la fecha de ingreso, recalculamos la antigüedad
    if (body.fecha_ingreso) {
      const fechaIngreso = new Date(body.fecha_ingreso);
      if (isNaN(fechaIngreso.getTime())) {
        return NextResponse.json({
          exito: false,
          mensaje: 'Fecha de ingreso inválida'
        }, { status: 400 });
      }
      body.antiguedad = utilidadesFecha.calcularAntiguedad(fechaIngreso);
      body.fecha_ingreso = fechaIngreso;
    }

    const docente = await prisma.docente.update({
      where: { id_docente: id },
      data: {
        codigo_docente: body.codigo_docente,
        nombres: body.nombres,
        apellidos: body.apellidos,
        modalidad: body.modalidad,
        categoria: body.categoria,
        categoria_ordinaria: body.categoria_ordinaria || null,
        tipo_contrato: body.tipo_contrato || null,
        tipo_extraordinario: body.tipo_extraordinario || null,
        dedicacion: body.dedicacion,
        tipo_dedicacion_laboral: body.tipo_dedicacion_laboral || null,
        fecha_ingreso: body.fecha_ingreso || null,
        correo_electronico: body.correo_electronico || null,
        telefono: body.telefono || null,
        grado_academico: body.grado_academico || null,
        especialidad: body.especialidad || null,
        dni_docente: body.dni_docente || null,
        horas_maximas_semanales: body.horas_maximas_semanales || 40,
        escuela_profesional: body.escuela_profesional || null,
        antiguedad: body.antiguedad || 0,
        facultad: body.id_facultad
          ? {
              connect: {
                id_facultad: parseInt(body.id_facultad, 10)
              }
            }
          : {
              disconnect: true
            },
        departamento: body.id_departamento
          ? {
              connect: {
                id_departamento: parseInt(body.id_departamento, 10)
              }
            }
          : {
              disconnect: true
            }
      },
      include: {
        facultad: true,
        departamento: true
      }
    });

    // Recalcular antigüedad en la respuesta para asegurar que sea correcta
    if (docente.fecha_ingreso) {
      docente.antiguedad = utilidadesFecha.calcularAntiguedad(docente.fecha_ingreso);
    }

    const usuarioEditor = await obtenerUsuarioAutenticadoOpcional(request);
    const cambios = obtenerCambiosDocente(docenteAnterior, {
      ...docente
    });

    await registrarHistorialEdicionDocente({
      idDocente: id,
      idUsuarioEditor: usuarioEditor?.id_usuario || null,
      anterior: docenteAnterior,
      nuevo: docente,
      cambios,
      motivo: payload.motivo_edicion || null
    });

    return NextResponse.json({
      exito: true,
      datos: docente,
      cambios
    });
  } catch (error: any) {
    console.error('Error actualizando docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.docente.delete({
      where: { id_docente: id }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Docente eliminado'
    });
  } catch (error: any) {
    console.error('Error eliminando docente:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
