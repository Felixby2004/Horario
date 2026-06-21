export type ModalidadDocente = 'nombrado' | 'contratado' | 'extraordinario';
export type CategoriaOrdinaria = 'principal' | 'asociado' | 'auxiliar';
export type TipoContratoDocente =
  | 'tipo_a1'
  | 'tipo_b1'
  | 'tipo_a2'
  | 'tipo_b2'
  | 'tipo_a3'
  | 'tipo_b3'
  | 'jefe_practica';
export type TipoExtraordinario =
  | 'cesante'
  | 'experto'
  | 'emerito'
  | 'invitado_especial';
export type DedicacionDocente =
  | 'dedicacion_exclusiva'
  | 'tiempo_completo'
  | 'tiempo_parcial_20'
  | 'tiempo_parcial_12'
  | 'tiempo_parcial_10'
  | 'tiempo_parcial_04'
  | 'docente_investigador'
  | 'tiempo_parcial_16'
  | 'tiempo_parcial_08'
  | 'tiempo_parcial'
  | 'por_horas';

export interface FormularioDocente {
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  modalidad: ModalidadDocente;
  categoria: 'principal' | 'asociado' | 'auxiliar' | 'jefe_practica';
  categoria_ordinaria: CategoriaOrdinaria | '';
  tipo_contrato: TipoContratoDocente | '';
  tipo_extraordinario: TipoExtraordinario | '';
  dedicacion: DedicacionDocente | '';
  tipo_dedicacion_laboral: 'dedicacion_exclusiva' | 'tiempo_completo' | 'tiempo_parcial_20' | 'por_horas';
  fecha_ingreso: string;
  correo_electronico: string;
  telefono: string;
  grado_academico: string;
  especialidad: string;
  dni_docente: string;
  horas_maximas_semanales: number;
  id_facultad: string;
  id_departamento: string;
  escuela_profesional?: string;
}

type OpcionValor<T extends string> = {
  valor: T;
  etiqueta: string;
};

export const MODALIDAD_OPTIONS: Array<OpcionValor<ModalidadDocente>> = [
  { valor: 'nombrado', etiqueta: 'Ordinario' },
  { valor: 'contratado', etiqueta: 'Contratado' },
  { valor: 'extraordinario', etiqueta: 'Extraordinario' }
];

export const CATEGORIAS_ORDINARIAS: Array<OpcionValor<CategoriaOrdinaria>> = [
  { valor: 'principal', etiqueta: 'Principal' },
  { valor: 'asociado', etiqueta: 'Asociado' },
  { valor: 'auxiliar', etiqueta: 'Auxiliar' }
];

export const TIPOS_CONTRATO: Array<OpcionValor<TipoContratoDocente>> = [
  { valor: 'tipo_a1', etiqueta: 'Tipo A1' },
  { valor: 'tipo_b1', etiqueta: 'Tipo B1 (Tiempo Completo)' },
  { valor: 'tipo_a2', etiqueta: 'Tipo A2' },
  { valor: 'tipo_b2', etiqueta: 'Tipo B2 (TP 16 H)' },
  { valor: 'tipo_a3', etiqueta: 'Tipo A3' },
  { valor: 'tipo_b3', etiqueta: 'Tipo B3 (TP 08 H)' },
  { valor: 'jefe_practica', etiqueta: 'Jefe de Práctica' }
];

export const TIPOS_EXTRAORDINARIOS: Array<OpcionValor<TipoExtraordinario>> = [
  { valor: 'cesante', etiqueta: 'Cesante' },
  { valor: 'experto', etiqueta: 'Experto' },
  { valor: 'emerito', etiqueta: 'Emérito' },
  { valor: 'invitado_especial', etiqueta: 'Invitado Especial' }
];

export const DEDICACIONES_ORDINARIO: Array<OpcionValor<DedicacionDocente>> = [
  { valor: 'dedicacion_exclusiva', etiqueta: 'Dedicación Exclusiva (DE)' },
  { valor: 'tiempo_completo', etiqueta: 'Tiempo Completo (TC)' },
  { valor: 'tiempo_parcial_20', etiqueta: 'Tiempo Parcial (TP 20 H)' },
  { valor: 'tiempo_parcial_12', etiqueta: 'Tiempo Parcial (TP 12 H)' },
  { valor: 'tiempo_parcial_10', etiqueta: 'Tiempo Parcial (TP 10 H)' },
  { valor: 'tiempo_parcial_04', etiqueta: 'Tiempo Parcial (TP 04 H)' },
  { valor: 'docente_investigador', etiqueta: 'Docente Investigador (DI)' }
];

export const DEDICACIONES_EXTRAORDINARIO: Array<OpcionValor<DedicacionDocente>> = [
  { valor: 'dedicacion_exclusiva', etiqueta: 'Dedicación Exclusiva (DE)' },
  { valor: 'tiempo_completo', etiqueta: 'Tiempo Completo (TC)' },
  { valor: 'tiempo_parcial_20', etiqueta: 'Tiempo Parcial (TP 20 H)' },
  { valor: 'tiempo_parcial_12', etiqueta: 'Tiempo Parcial (TP 12 H)' },
  { valor: 'tiempo_parcial_10', etiqueta: 'Tiempo Parcial (TP 10 H)' }
];

export const DEDICACIONES_CONTRATADO: Array<OpcionValor<DedicacionDocente>> = [
  { valor: 'tiempo_completo', etiqueta: 'Tiempo Completo A1/B1 (TC)' },
  { valor: 'tiempo_parcial_16', etiqueta: 'Tiempo Parcial A2/B2 (TP 16 H)' },
  { valor: 'tiempo_parcial_08', etiqueta: 'Tiempo Parcial A3/B3 (TP 08 H)' }
];

const HORAS_POR_DEDICACION: Record<DedicacionDocente, number> = {
  dedicacion_exclusiva: 40,
  tiempo_completo: 40,
  tiempo_parcial_20: 20,
  tiempo_parcial_12: 12,
  tiempo_parcial_10: 10,
  tiempo_parcial_04: 4,
  docente_investigador: 40,
  tiempo_parcial_16: 16,
  tiempo_parcial_08: 8,
  tiempo_parcial: 20,
  por_horas: 4
};

export function normalizarTextoMayusculas(valor?: string | null): string {
  return String(valor || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function normalizarTextoOracion(valor?: string | null): string {
  const texto = String(valor || '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function mapearDedicacion(docente: any): DedicacionDocente | '' {
  const dedicacion = String(docente?.dedicacion || '');
  if (
    dedicacion === 'dedicacion_exclusiva' ||
    dedicacion === 'tiempo_completo' ||
    dedicacion === 'tiempo_parcial_20' ||
    dedicacion === 'tiempo_parcial_12' ||
    dedicacion === 'tiempo_parcial_10' ||
    dedicacion === 'tiempo_parcial_04' ||
    dedicacion === 'docente_investigador' ||
    dedicacion === 'tiempo_parcial_16' ||
    dedicacion === 'tiempo_parcial_08'
  ) {
    return dedicacion as DedicacionDocente;
  }
  if (docente?.modalidad === 'contratado') {
    return derivarDedicacionContratado(docente?.tipo_contrato || '');
  }
  if (docente?.tipo_dedicacion_laboral === 'dedicacion_exclusiva') return 'dedicacion_exclusiva';
  if (docente?.tipo_dedicacion_laboral === 'tiempo_completo') return 'tiempo_completo';
  if (docente?.tipo_dedicacion_laboral === 'tiempo_parcial_20') return 'tiempo_parcial_20';
  if (docente?.dedicacion === 'tiempo_parcial') return 'tiempo_parcial_20';
  if (docente?.dedicacion === 'por_horas') return 'tiempo_parcial_04';

  return '';
}

export function derivarDedicacionContratado(tipoContrato?: string): DedicacionDocente | '' {
  if (tipoContrato === 'tipo_a1' || tipoContrato === 'tipo_b1') return 'tiempo_completo';
  if (tipoContrato === 'tipo_a2' || tipoContrato === 'tipo_b2') return 'tiempo_parcial_16';
  if (tipoContrato === 'tipo_a3' || tipoContrato === 'tipo_b3' || tipoContrato === 'jefe_practica') {
    return 'tiempo_parcial_08';
  }
  return '';
}

export function calcularHorasMaximasSegunDedicacion(dedicacion?: string): number {
  const clave = String(dedicacion || '') as DedicacionDocente;
  return HORAS_POR_DEDICACION[clave] || 40;
}

export function obtenerOpcionesDedicacion(modalidad: ModalidadDocente) {
  if (modalidad === 'contratado') return DEDICACIONES_CONTRATADO;
  if (modalidad === 'extraordinario') return DEDICACIONES_EXTRAORDINARIO;
  return DEDICACIONES_ORDINARIO;
}

export function crearFormularioDocenteInicial(
  base: Partial<FormularioDocente> = {}
): FormularioDocente {
  const modalidad = (base.modalidad || 'nombrado') as ModalidadDocente;
  const categoriaOrdinaria =
    modalidad === 'nombrado'
      ? ((base.categoria_ordinaria || base.categoria || 'principal') as CategoriaOrdinaria)
      : '';
  const tipoContrato =
    modalidad === 'contratado'
      ? ((base.tipo_contrato || (base.categoria === 'jefe_practica' ? 'jefe_practica' : '')) as TipoContratoDocente | '')
      : '';
  const tipoExtraordinario =
    modalidad === 'extraordinario'
      ? ((base.tipo_extraordinario || '') as TipoExtraordinario | '')
      : '';

  const dedicacion =
    modalidad === 'contratado'
      ? derivarDedicacionContratado(tipoContrato || '')
      : (mapearDedicacion(base) as DedicacionDocente | '');

  const legacy = derivarCamposLegacy({
    modalidad,
    categoria_ordinaria: categoriaOrdinaria,
    tipo_contrato: tipoContrato,
    dedicacion
  });

  return {
    codigo_docente: base.codigo_docente || '',
    nombres: normalizarTextoMayusculas(base.nombres || ''),
    apellidos: normalizarTextoMayusculas(base.apellidos || ''),
    modalidad,
    categoria: legacy.categoria,
    categoria_ordinaria: categoriaOrdinaria,
    tipo_contrato: tipoContrato,
    tipo_extraordinario: tipoExtraordinario,
    dedicacion,
    tipo_dedicacion_laboral: legacy.tipo_dedicacion_laboral,
    fecha_ingreso: String(base.fecha_ingreso || ''),
    correo_electronico: String(base.correo_electronico || ''),
    telefono: String(base.telefono || ''),
    grado_academico: normalizarTextoOracion(base.grado_academico || ''),
    especialidad: normalizarTextoOracion(base.especialidad || ''),
    dni_docente: String(base.dni_docente || ''),
    horas_maximas_semanales:
      Number(base.horas_maximas_semanales) || calcularHorasMaximasSegunDedicacion(dedicacion),
    id_facultad: String(base.id_facultad || ''),
    id_departamento: String(base.id_departamento || ''),
    escuela_profesional: normalizarTextoOracion(base.escuela_profesional || '')
  };
}

export function actualizarFormularioDocente(
  formulario: FormularioDocente,
  campo: keyof FormularioDocente,
  valor: any
): FormularioDocente {
  const siguiente = { ...formulario, [campo]: valor };

  if (campo === 'nombres' || campo === 'apellidos') {
    siguiente[campo] = normalizarTextoMayusculas(valor) as never;
  }

  if (campo === 'grado_academico' || campo === 'especialidad' || campo === 'escuela_profesional') {
    siguiente[campo] = normalizarTextoOracion(valor) as never;
  }

  if (campo === 'modalidad') {
    if (valor === 'nombrado') {
      siguiente.categoria_ordinaria = siguiente.categoria_ordinaria || 'principal';
      siguiente.tipo_contrato = '';
      siguiente.tipo_extraordinario = '';
      siguiente.dedicacion =
        (DEDICACIONES_ORDINARIO[0]?.valor as DedicacionDocente) || 'tiempo_completo';
    } else if (valor === 'contratado') {
      siguiente.categoria_ordinaria = '';
      siguiente.tipo_extraordinario = '';
      siguiente.tipo_contrato = siguiente.tipo_contrato || 'tipo_a1';
      siguiente.dedicacion = derivarDedicacionContratado(siguiente.tipo_contrato);
    } else if (valor === 'extraordinario') {
      siguiente.categoria_ordinaria = '';
      siguiente.tipo_contrato = '';
      siguiente.tipo_extraordinario = siguiente.tipo_extraordinario || 'cesante';
      siguiente.dedicacion =
        (DEDICACIONES_EXTRAORDINARIO[0]?.valor as DedicacionDocente) || 'tiempo_completo';
    }
  }

  if (campo === 'tipo_contrato' && siguiente.modalidad === 'contratado') {
    siguiente.dedicacion = derivarDedicacionContratado(valor);
  }

  const legacy = derivarCamposLegacy({
    modalidad: siguiente.modalidad,
    categoria_ordinaria: siguiente.categoria_ordinaria,
    tipo_contrato: siguiente.tipo_contrato,
    dedicacion: siguiente.dedicacion
  });

  siguiente.categoria = legacy.categoria;
  siguiente.tipo_dedicacion_laboral = legacy.tipo_dedicacion_laboral;
  if (campo === 'modalidad' || campo === 'tipo_contrato' || campo === 'dedicacion') {
    siguiente.horas_maximas_semanales = calcularHorasMaximasSegunDedicacion(siguiente.dedicacion);
  }

  return siguiente;
}

export function derivarCamposLegacy(datos: {
  modalidad: ModalidadDocente;
  categoria_ordinaria?: string;
  tipo_contrato?: string;
  dedicacion?: string;
}): {
  categoria: 'principal' | 'asociado' | 'auxiliar' | 'jefe_practica';
  tipo_dedicacion_laboral: 'dedicacion_exclusiva' | 'tiempo_completo' | 'tiempo_parcial_20' | 'por_horas';
} {
  const modalidad = datos.modalidad;
  const dedicacion = String(datos.dedicacion || '');
  let categoria: 'principal' | 'asociado' | 'auxiliar' | 'jefe_practica' = 'auxiliar';

  if (modalidad === 'nombrado') {
    categoria = (datos.categoria_ordinaria || 'principal') as typeof categoria;
  } else if (modalidad === 'contratado' && datos.tipo_contrato === 'jefe_practica') {
    categoria = 'jefe_practica';
  }

  let tipoDedicacion: 'dedicacion_exclusiva' | 'tiempo_completo' | 'tiempo_parcial_20' | 'por_horas' =
    'tiempo_completo';

  if (dedicacion === 'dedicacion_exclusiva') {
    tipoDedicacion = 'dedicacion_exclusiva';
  } else if (dedicacion === 'tiempo_completo' || dedicacion === 'docente_investigador') {
    tipoDedicacion = 'tiempo_completo';
  } else if (
    dedicacion === 'tiempo_parcial_20' ||
    dedicacion === 'tiempo_parcial_12' ||
    dedicacion === 'tiempo_parcial_10' ||
    dedicacion === 'tiempo_parcial_16' ||
    dedicacion === 'tiempo_parcial'
  ) {
    tipoDedicacion = 'tiempo_parcial_20';
  } else if (
    dedicacion === 'tiempo_parcial_04' ||
    dedicacion === 'tiempo_parcial_08' ||
    dedicacion === 'por_horas'
  ) {
    tipoDedicacion = 'por_horas';
  }

  return {
    categoria,
    tipo_dedicacion_laboral: tipoDedicacion
  };
}

export function validarDatosDocente(payload: any): string[] {
  const errores: string[] = [];
  const modalidad = String(payload.modalidad || '');

  if (!normalizarTextoMayusculas(payload.nombres)) {
    errores.push('Los nombres son obligatorios.');
  }
  if (!normalizarTextoMayusculas(payload.apellidos)) {
    errores.push('Los apellidos son obligatorios.');
  }

  if (modalidad === 'nombrado' && !payload.categoria_ordinaria && !payload.categoria) {
    errores.push('La categoría ordinaria es obligatoria para docentes ordinarios.');
  }
  if (modalidad === 'contratado' && !payload.tipo_contrato) {
    errores.push('El tipo de contrato es obligatorio para docentes contratados.');
  }
  if (modalidad === 'extraordinario' && !payload.tipo_extraordinario) {
    errores.push('El tipo de docente extraordinario es obligatorio.');
  }
  if (!payload.dedicacion) {
    errores.push('La dedicación es obligatoria.');
  }

  return errores;
}

export function normalizarPayloadDocente(payload: any) {
  const modalidad = (payload.modalidad || 'nombrado') as ModalidadDocente;
  const categoriaOrdinaria =
    modalidad === 'nombrado'
      ? (payload.categoria_ordinaria || payload.categoria || 'principal')
      : null;
  const tipoContrato =
    modalidad === 'contratado'
      ? (payload.tipo_contrato || (payload.categoria === 'jefe_practica' ? 'jefe_practica' : null))
      : null;
  const tipoExtraordinario =
    modalidad === 'extraordinario' ? (payload.tipo_extraordinario || null) : null;
  const dedicacion =
    modalidad === 'contratado'
      ? (derivarDedicacionContratado(tipoContrato || '') || null)
      : (payload.dedicacion || mapearDedicacion(payload) || null);

  const legacy = derivarCamposLegacy({
    modalidad,
    categoria_ordinaria: categoriaOrdinaria || undefined,
    tipo_contrato: tipoContrato || undefined,
    dedicacion: dedicacion || undefined
  });

  return {
    ...payload,
    nombres: normalizarTextoMayusculas(payload.nombres),
    apellidos: normalizarTextoMayusculas(payload.apellidos),
    grado_academico: normalizarTextoOracion(payload.grado_academico),
    especialidad: normalizarTextoOracion(payload.especialidad),
    escuela_profesional: normalizarTextoOracion(payload.escuela_profesional),
    modalidad,
    categoria: legacy.categoria,
    categoria_ordinaria: categoriaOrdinaria,
    tipo_contrato: tipoContrato,
    tipo_extraordinario: tipoExtraordinario,
    dedicacion,
    tipo_dedicacion_laboral: legacy.tipo_dedicacion_laboral,
    horas_maximas_semanales:
      Number(payload.horas_maximas_semanales) || calcularHorasMaximasSegunDedicacion(dedicacion || undefined)
  };
}

export function obtenerEtiquetaModalidad(docente: any): string {
  const modalidad = String(docente?.modalidad || '');
  if (modalidad === 'nombrado') return 'Ordinario';
  if (modalidad === 'contratado') return 'Contratado';
  if (modalidad === 'extraordinario') return 'Extraordinario';
  return modalidad || '-';
}

export function obtenerEtiquetaCategoria(docente: any): string {
  if (docente?.modalidad === 'nombrado') {
    const valor = String(docente?.categoria_ordinaria || docente?.categoria || '');
    return CATEGORIAS_ORDINARIAS.find((item) => item.valor === valor)?.etiqueta || valor || '-';
  }
  if (docente?.modalidad === 'contratado') {
    const valor = String(docente?.tipo_contrato || (docente?.categoria === 'jefe_practica' ? 'jefe_practica' : ''));
    return TIPOS_CONTRATO.find((item) => item.valor === valor)?.etiqueta || valor || '-';
  }
  if (docente?.modalidad === 'extraordinario') {
    const valor = String(docente?.tipo_extraordinario || '');
    return TIPOS_EXTRAORDINARIOS.find((item) => item.valor === valor)?.etiqueta || valor || '-';
  }
  return '-';
}

export function obtenerEtiquetaDedicacion(docente: any): string {
  const dedicacion = String(mapearDedicacion(docente) || '');
  const opciones = [
    ...DEDICACIONES_ORDINARIO,
    ...DEDICACIONES_EXTRAORDINARIO,
    ...DEDICACIONES_CONTRATADO
  ];
  return opciones.find((item) => item.valor === dedicacion)?.etiqueta || dedicacion.replace(/_/g, ' ') || '-';
}
