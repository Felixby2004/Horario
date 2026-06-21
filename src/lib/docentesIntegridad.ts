import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificarAutenticacion } from '@/lib/auth';
import {
  obtenerEtiquetaCategoria,
  obtenerEtiquetaDedicacion,
  obtenerEtiquetaModalidad,
  type FormularioDocente
} from '@/lib/docentes';

export type ErroresFormularioDocente = Partial<Record<keyof FormularioDocente | 'global', string>>;

type ContextoUnicidad = {
  excludeId?: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DNI_REGEX = /^\d{8,12}$/;

export function validarCorreoElectronico(correo?: string | null) {
  const valor = String(correo || '').trim();
  if (!valor) return true;
  return EMAIL_REGEX.test(valor);
}

export function validarDniDocente(dni?: string | null) {
  const valor = String(dni || '').trim();
  if (!valor) return false;
  return DNI_REGEX.test(valor);
}

export function normalizarTextoSimple(valor?: string | null) {
  return String(valor || '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function esFechaValida(valor?: string | Date | null) {
  if (!valor) return false;
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return !Number.isNaN(fecha.getTime());
}

export function construirErroresFormularioDocente(payload: any): ErroresFormularioDocente {
  const errores: ErroresFormularioDocente = {};

  if (!normalizarTextoSimple(payload.codigo_docente)) {
    errores.codigo_docente = 'El código de docente es obligatorio.';
  }
  if (!normalizarTextoSimple(payload.nombres)) {
    errores.nombres = 'Los nombres son obligatorios.';
  }
  if (!normalizarTextoSimple(payload.apellidos)) {
    errores.apellidos = 'Los apellidos son obligatorios.';
  }
  if (!validarCorreoElectronico(payload.correo_electronico)) {
    errores.correo_electronico = 'El correo electrónico no tiene un formato válido.';
  }
  if (!validarDniDocente(payload.dni_docente)) {
    errores.dni_docente = 'El documento debe tener entre 8 y 12 dígitos.';
  }
  if (!payload.id_facultad) {
    errores.id_facultad = 'La facultad es obligatoria.';
  }
  if (!payload.id_departamento) {
    errores.id_departamento = 'El departamento académico es obligatorio.';
  }
  if (!payload.fecha_ingreso || !esFechaValida(payload.fecha_ingreso)) {
    errores.fecha_ingreso = 'La fecha de ingreso es obligatoria y debe ser válida.';
  }

  return errores;
}

export async function validarUnicidadDocente(payload: any, contexto: ContextoUnicidad = {}) {
  const errores: ErroresFormularioDocente = {};
  const excludeId = contexto.excludeId;

  const codigo = normalizarTextoSimple(payload.codigo_docente);
  const correo = normalizarTextoSimple(payload.correo_electronico);
  const dni = normalizarTextoSimple(payload.dni_docente);

  if (codigo) {
    const existente = await prisma.docente.findFirst({
      where: {
        codigo_docente: codigo,
        ...(excludeId ? { id_docente: { not: excludeId } } : {})
      },
      select: { id_docente: true }
    });
    if (existente) {
      errores.codigo_docente = 'El código de docente ya está registrado.';
    }
  }

  if (correo) {
    const existenteCorreo = await prisma.docente.findFirst({
      where: {
        correo_electronico: correo,
        ...(excludeId ? { id_docente: { not: excludeId } } : {})
      },
      select: { id_docente: true }
    });
    if (existenteCorreo) {
      errores.correo_electronico = 'El correo electrónico ya está asignado a otro docente.';
    }
  }

  if (dni) {
    const existenteDni = await prisma.docente.findFirst({
      where: {
        dni_docente: dni,
        ...(excludeId ? { id_docente: { not: excludeId } } : {})
      },
      select: { id_docente: true }
    });
    if (existenteDni) {
      errores.dni_docente = 'El documento ya está asignado a otro docente.';
    }
  }

  return errores;
}

export function fusionarErroresDocente(
  ...colecciones: Array<ErroresFormularioDocente | undefined>
): ErroresFormularioDocente {
  return colecciones.reduce<ErroresFormularioDocente>((acc, actual) => {
    if (!actual) return acc;
    Object.entries(actual).forEach(([clave, valor]) => {
      if (valor) {
        acc[clave as keyof ErroresFormularioDocente] = valor;
      }
    });
    return acc;
  }, {});
}

export function obtenerCambiosDocente(anterior: any, siguiente: any) {
  const cambios: Array<{ campo: string; antes: string; despues: string }> = [];
  const campos = [
    'nombres',
    'apellidos',
    'correo_electronico',
    'telefono',
    'dni_docente',
    'modalidad',
    'categoria_ordinaria',
    'tipo_contrato',
    'tipo_extraordinario',
    'dedicacion',
    'fecha_ingreso',
    'grado_academico',
    'especialidad',
    'escuela_profesional',
    'id_facultad',
    'id_departamento',
    'horas_maximas_semanales'
  ];

  campos.forEach((campo) => {
    const antes = anterior?.[campo] ?? '';
    const despues = siguiente?.[campo] ?? '';
    const antesNormalizado = antes instanceof Date ? antes.toISOString().slice(0, 10) : String(antes);
    const despuesNormalizado = despues instanceof Date ? despues.toISOString().slice(0, 10) : String(despues);

    if (antesNormalizado !== despuesNormalizado) {
      cambios.push({
        campo,
        antes: traducirValorCambio(campo, anterior),
        despues: traducirValorCambio(campo, siguiente)
      });
    }
  });

  return cambios;
}

function traducirValorCambio(campo: string, docente: any) {
  if (!docente) return '-';
  if (campo === 'modalidad') return obtenerEtiquetaModalidad(docente);
  if (campo === 'categoria_ordinaria' || campo === 'tipo_contrato' || campo === 'tipo_extraordinario') {
    return obtenerEtiquetaCategoria(docente);
  }
  if (campo === 'dedicacion') return obtenerEtiquetaDedicacion(docente);
  if (campo === 'fecha_ingreso') {
    const valor = docente?.fecha_ingreso;
    if (!valor) return '-';
    const fecha = valor instanceof Date ? valor : new Date(valor);
    return Number.isNaN(fecha.getTime()) ? '-' : fecha.toISOString().slice(0, 10);
  }
  return String(docente?.[campo] ?? '-');
}

export async function obtenerUsuarioAutenticadoOpcional(request: NextRequest) {
  try {
    const usuario = await verificarAutenticacion(request);
    if (usuario?.id_usuario) {
      return usuario;
    }
    return null;
  } catch (_error) {
    return null;
  }
}

export async function registrarHistorialEdicionDocente(params: {
  idDocente: number;
  idUsuarioEditor?: number | null;
  anterior: any;
  nuevo: any;
  cambios: Array<{ campo: string; antes: string; despues: string }>;
  motivo?: string | null;
}) {
  if (!params.cambios.length) return null;

  return prisma.historialEdicionDocente.create({
    data: {
      id_docente: params.idDocente,
      id_usuario_editor: params.idUsuarioEditor || null,
      datos_anteriores: params.anterior,
      datos_nuevos: params.nuevo,
      resumen_cambios: params.cambios,
      motivo: params.motivo || null
    }
  });
}

export async function registrarHistorialImportacionDocente(params: {
  idUsuarioResponsable?: number | null;
  nombreArchivo: string;
  formatoArchivo: string;
  totalRegistros: number;
  registrosValidos: number;
  registrosImportados: number;
  registrosError: number;
  estado: string;
  detalleResultado: any;
}) {
  return prisma.historialImportacionDocente.create({
    data: {
      id_usuario_responsable: params.idUsuarioResponsable || null,
      nombre_archivo: params.nombreArchivo,
      formato_archivo: params.formatoArchivo,
      total_registros: params.totalRegistros,
      registros_validos: params.registrosValidos,
      registros_importados: params.registrosImportados,
      registros_error: params.registrosError,
      estado: params.estado,
      detalle_resultado: params.detalleResultado
    }
  });
}
