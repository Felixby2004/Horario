import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizarPayloadDocente, validarDatosDocente, normalizarTextoMayusculas } from '@/lib/docentes';
import {
  construirErroresFormularioDocente,
  fusionarErroresDocente,
  obtenerUsuarioAutenticadoOpcional,
  registrarHistorialImportacionDocente,
  validarUnicidadDocente
} from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';
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
      tipo_dedicacion_laboral,
      dni_docente,
      escuela_profesional,
      antiguedad,
      fecha_ingreso,
      telefono,
      grado_academico,
      especialidad,
      horas_maximas_semanales,
      id_facultad,
      id_departamento
    } = body;

    const datosNormalizados = normalizarPayloadDocente({
      ...body,
      nombres: body.nombres,
      apellidos: body.apellidos
    });

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

    const errores = validarDatosDocente({
      ...datosNormalizados,
      nombres: body.nombres || usuario.nombres,
      apellidos: body.apellidos || usuario.apellidos
    });
    const erroresIntegridad = fusionarErroresDocente(
      construirErroresFormularioDocente(datosNormalizados),
      await validarUnicidadDocente(datosNormalizados)
    );

    if (errores.length > 0 || Object.keys(erroresIntegridad).length > 0) {
      return NextResponse.json({
        exito: false,
        mensaje: errores[0] || Object.values(erroresIntegridad)[0],
        errores,
        errores_campo: erroresIntegridad
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
    let fechaIngresoFormato = null;
    if (fecha_ingreso) {
      fechaIngresoFormato = new Date(fecha_ingreso);
      if (isNaN(fechaIngresoFormato.getTime())) {
        return NextResponse.json({
          exito: false,
          mensaje: 'Fecha de ingreso inválida'
        }, { status: 400 });
      }
    }
    
    const antiguedadCalculada = fechaIngresoFormato 
      ? utilidadesFecha.calcularAntiguedad(fechaIngresoFormato)
      : (antiguedad || 0);

    // Crear docente
    const nuevoDocente = await prisma.docente.create({
      data: {
        codigo_docente,
        nombres: normalizarTextoMayusculas(usuario.nombres),
        apellidos: normalizarTextoMayusculas(usuario.apellidos),
        modalidad: datosNormalizados.modalidad,
        categoria: datosNormalizados.categoria,
        categoria_ordinaria: datosNormalizados.categoria_ordinaria || null,
        tipo_contrato: datosNormalizados.tipo_contrato || null,
        tipo_extraordinario: datosNormalizados.tipo_extraordinario || null,
        dedicacion: datosNormalizados.dedicacion || 'tiempo_completo',
        tipo_dedicacion_laboral: datosNormalizados.tipo_dedicacion_laboral || 'tiempo_completo',
        dni_docente: dni_docente || null,
        escuela_profesional: escuela_profesional || null,
        antiguedad: antiguedadCalculada,
        fecha_ingreso: fechaIngresoFormato,
        correo_electronico: usuario.correo_electronico,
        telefono: telefono || null,
        grado_academico: grado_academico || null,
        especialidad: especialidad || null,
        horas_maximas_semanales: datosNormalizados.horas_maximas_semanales || 40,
        activo: true,
        id_facultad: id_facultad ? parseInt(id_facultad) : null,
        id_departamento: id_departamento ? parseInt(id_departamento) : null,
        id_usuario: id_usuario
      }
    });

    const usuarioResponsable = await obtenerUsuarioAutenticadoOpcional(request);
    await registrarHistorialImportacionDocente({
      idUsuarioResponsable: usuarioResponsable?.id_usuario || null,
      nombreArchivo: `usuario-${usuario.codigo}`,
      formatoArchivo: 'usuario',
      totalRegistros: 1,
      registrosValidos: 1,
      registrosImportados: 1,
      registrosError: 0,
      estado: 'completado',
      detalleResultado: [
        {
          fila: 1,
          exito: true,
          accion: 'crear',
          codigo_docente,
          id_docente: nuevoDocente.id_docente
        }
      ]
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
