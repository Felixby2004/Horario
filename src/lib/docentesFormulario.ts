import {
  obtenerEtiquetaCategoria,
  obtenerEtiquetaDedicacion,
  obtenerEtiquetaModalidad,
  type FormularioDocente
} from '@/lib/docentes';

export type ErroresFormularioDocenteCliente = Partial<
  Record<keyof FormularioDocente | 'global', string>
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DNI_REGEX = /^\d{8,12}$/;

export function validarCorreoElectronicoCliente(correo?: string | null) {
  const valor = String(correo || '').trim();
  if (!valor) return true;
  return EMAIL_REGEX.test(valor);
}

export function validarDniDocenteCliente(dni?: string | null) {
  const valor = String(dni || '').trim();
  if (!valor) return false;
  return DNI_REGEX.test(valor);
}

export function esFechaValidaCliente(valor?: string | Date | null) {
  if (!valor) return false;
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return !Number.isNaN(fecha.getTime());
}

export function construirErroresFormularioDocenteCliente(payload: any): ErroresFormularioDocenteCliente {
  const errores: ErroresFormularioDocenteCliente = {};

  if (!String(payload.codigo_docente || '').trim()) {
    errores.codigo_docente = 'El código de docente es obligatorio.';
  }
  if (!String(payload.nombres || '').trim()) {
    errores.nombres = 'Los nombres son obligatorios.';
  }
  if (!String(payload.apellidos || '').trim()) {
    errores.apellidos = 'Los apellidos son obligatorios.';
  }
  if (!validarCorreoElectronicoCliente(payload.correo_electronico)) {
    errores.correo_electronico = 'El correo electrónico no tiene un formato válido.';
  }
  if (!validarDniDocenteCliente(payload.dni_docente)) {
    errores.dni_docente = 'El documento debe tener entre 8 y 12 dígitos.';
  }
  if (!payload.id_facultad) {
    errores.id_facultad = 'La facultad es obligatoria.';
  }
  if (!payload.id_departamento) {
    errores.id_departamento = 'El departamento académico es obligatorio.';
  }
  if (!payload.fecha_ingreso || !esFechaValidaCliente(payload.fecha_ingreso)) {
    errores.fecha_ingreso = 'La fecha de ingreso es obligatoria y debe ser válida.';
  }
  if (!payload.dedicacion) {
    errores.dedicacion = 'La dedicación es obligatoria.';
  }

  return errores;
}

export function resumirCambiosFormularioDocente(anterior: any, siguiente: any) {
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
    const antes = serializarValorComparacion(anterior?.[campo]);
    const despues = serializarValorComparacion(siguiente?.[campo]);

    if (antes !== despues) {
      cambios.push({
        campo,
        antes: traducirValorFormulario(campo, anterior),
        despues: traducirValorFormulario(campo, siguiente)
      });
    }
  });

  return cambios;
}

function serializarValorComparacion(valor: any) {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return String(valor ?? '');
}

function traducirValorFormulario(campo: string, datos: any) {
  if (!datos) return '-';
  if (campo === 'modalidad') return obtenerEtiquetaModalidad(datos);
  if (campo === 'categoria_ordinaria' || campo === 'tipo_contrato' || campo === 'tipo_extraordinario') {
    return obtenerEtiquetaCategoria(datos);
  }
  if (campo === 'dedicacion') return obtenerEtiquetaDedicacion(datos);
  if (campo === 'fecha_ingreso') {
    const valor = datos?.fecha_ingreso;
    if (!valor) return '-';
    const fecha = valor instanceof Date ? valor : new Date(valor);
    return Number.isNaN(fecha.getTime()) ? '-' : fecha.toISOString().slice(0, 10);
  }
  return String(datos?.[campo] ?? '-');
}
