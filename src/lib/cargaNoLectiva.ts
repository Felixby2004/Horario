type TipoActividadNoLectivaClave =
  | 'tutoria_consejeria'
  | 'investigacion'
  | 'responsabilidad_social'
  | 'gestion_gobierno'
  | 'asesoria_tesis_jurado'
  | 'perfeccionamiento'
  | 'preparacion_evaluacion'
  | 'autoevaluacion_acreditacion';

export type ModalidadCargaNoLectiva = 'DE' | 'TC' | 'TP1' | 'TP2' | 'TP3' | 'DI' | 'DR';

export type DocenteCargaNoLectiva = {
  dedicacion?: string | null;
  tipo_dedicacion_laboral?: string | null;
  modalidad?: string | null;
  tipo_contrato?: string | null;
};

export type ActividadNoLectivaBase = {
  id_actividad?: number | null;
  tipo_actividad?: string | null;
  horas_semanales?: number | null;
  datos_sustento?: unknown;
};

const ETIQUETAS_ACTIVIDAD: Record<TipoActividadNoLectivaClave, string> = {
  tutoria_consejeria: 'Tutoría y consejería',
  investigacion: 'Investigación',
  responsabilidad_social: 'Responsabilidad social universitaria',
  gestion_gobierno: 'Gestión y gobierno',
  asesoria_tesis_jurado: 'Asesoría de tesis y exámenes profesionales',
  perfeccionamiento: 'Formación académica y capacitación',
  preparacion_evaluacion: 'Preparación y evaluación',
  autoevaluacion_acreditacion: 'Autoevaluación y/o acreditación de escuela profesional'
};

const LIMITES_BASE: Record<ModalidadCargaNoLectiva, Partial<Record<TipoActividadNoLectivaClave, number>>> = {
  DE: {
    tutoria_consejeria: 2,
    investigacion: 6,
    responsabilidad_social: 2,
    asesoria_tesis_jurado: 2,
    perfeccionamiento: 2,
    autoevaluacion_acreditacion: 2
  },
  TC: {
    tutoria_consejeria: 2,
    investigacion: 6,
    responsabilidad_social: 2,
    asesoria_tesis_jurado: 2,
    perfeccionamiento: 2,
    autoevaluacion_acreditacion: 2
  },
  TP1: {
    tutoria_consejeria: 2,
    investigacion: 0,
    responsabilidad_social: 2,
    asesoria_tesis_jurado: 0,
    perfeccionamiento: 0,
    autoevaluacion_acreditacion: 0
  },
  TP2: {
    tutoria_consejeria: 1,
    investigacion: 0,
    responsabilidad_social: 0,
    asesoria_tesis_jurado: 0,
    perfeccionamiento: 0,
    autoevaluacion_acreditacion: 0
  },
  TP3: {
    tutoria_consejeria: 1,
    investigacion: 0,
    responsabilidad_social: 0,
    asesoria_tesis_jurado: 0,
    perfeccionamiento: 0,
    autoevaluacion_acreditacion: 0
  },
  DI: {
    tutoria_consejeria: 3,
    investigacion: 23,
    responsabilidad_social: 3,
    asesoria_tesis_jurado: 2,
    perfeccionamiento: 2,
    autoevaluacion_acreditacion: 2
  },
  DR: {
    tutoria_consejeria: 3,
    investigacion: 8,
    responsabilidad_social: 3,
    asesoria_tesis_jurado: 2,
    perfeccionamiento: 2,
    autoevaluacion_acreditacion: 2
  }
};

const LIMITES_POR_DEFECTO: Partial<Record<TipoActividadNoLectivaClave, number>> = {
  gestion_gobierno: 2,
  preparacion_evaluacion: 20
};

function normalizarNumero(valor: unknown) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function esRegistro(valor: unknown): valor is Record<string, any> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function obtenerBanderaBooleana(origen: unknown, clave: string) {
  if (!esRegistro(origen)) return false;
  return origen[clave] === true;
}

export function obtenerEtiquetaActividadNoLectiva(tipo: string) {
  return ETIQUETAS_ACTIVIDAD[tipo as TipoActividadNoLectivaClave] || tipo;
}

export function resolverModalidadCargaNoLectiva(docente?: DocenteCargaNoLectiva | null): ModalidadCargaNoLectiva {
  const dedicacion = String(docente?.dedicacion || docente?.tipo_dedicacion_laboral || '').toLowerCase();
  const modalidad = String(docente?.modalidad || '').toLowerCase();
  const tipoContrato = String(docente?.tipo_contrato || '').toLowerCase();

  if (dedicacion === 'dr' || modalidad === 'dr' || tipoContrato === 'dr') return 'DR';
  if (dedicacion === 'docente_investigador') return 'DI';
  if (dedicacion === 'dedicacion_exclusiva') return 'DE';
  if (dedicacion === 'tiempo_completo') return 'TC';
  if (dedicacion === 'tiempo_parcial_20' || dedicacion === 'tiempo_parcial_16') return 'TP1';
  if (dedicacion === 'tiempo_parcial_12' || dedicacion === 'tiempo_parcial_10') return 'TP2';
  if (
    dedicacion === 'tiempo_parcial_08' ||
    dedicacion === 'tiempo_parcial_04' ||
    dedicacion === 'por_horas'
  ) {
    return 'TP3';
  }

  if (modalidad === 'contratado' && (tipoContrato === 'tipo_a2' || tipoContrato === 'tipo_b2')) {
    return 'TP1';
  }

  if (
    modalidad === 'contratado' &&
    (tipoContrato === 'tipo_a3' || tipoContrato === 'tipo_b3' || tipoContrato === 'jefe_practica')
  ) {
    return 'TP3';
  }

  return 'TC';
}

export function tieneAprobacionAutoevaluacion(
  datosSustento?: unknown,
  docente?: { departamento?: unknown } | null
) {
  if (obtenerBanderaBooleana(datosSustento, 'autoevaluacion_acreditacion_aprobada')) return true;
  if (obtenerBanderaBooleana(datosSustento, 'proceso_autoevaluacion_aprobado')) return true;
  if (obtenerBanderaBooleana(docente?.departamento, 'autoevaluacion_acreditacion_aprobada')) return true;
  return false;
}

export function obtenerLimitesNoLectivosPorModalidad(params: {
  docente?: DocenteCargaNoLectiva | null;
  autoevaluacionAprobada?: boolean;
  horasLectivas?: number | null;
}) {
  const modalidad = resolverModalidadCargaNoLectiva(params.docente);
  const autoevaluacionAprobada = params.autoevaluacionAprobada === true;
  const limitesBase = LIMITES_BASE[modalidad];
  const horasLectivas = normalizarNumero(params.horasLectivas);

  const limites = {
    ...LIMITES_POR_DEFECTO,
    ...limitesBase
  } as Record<string, number>;

  // Preparación y evaluación: mitad truncada (sin aproximar)
  limites.preparacion_evaluacion = Math.floor(horasLectivas * 0.5);

  if (!autoevaluacionAprobada) {
    limites.autoevaluacion_acreditacion = 0;
    if ((limitesBase.autoevaluacion_acreditacion ?? 0) > 0) {
      limites.tutoria_consejeria = Math.max(limites.tutoria_consejeria ?? 0, 3);
      limites.responsabilidad_social = Math.max(limites.responsabilidad_social ?? 0, 3);
    }
  }

  return {
    modalidad,
    autoevaluacionAprobada,
    limites
  };
}

export function calcularHorasAcumuladasPorTipo(params: {
  actividades: ActividadNoLectivaBase[];
  tipoActividad: string;
  excluirIdActividad?: number | null;
}) {
  return params.actividades.reduce((total, actividad) => {
    if (actividad.tipo_actividad !== params.tipoActividad) return total;
    if (
      params.excluirIdActividad &&
      Number(actividad.id_actividad) === Number(params.excluirIdActividad)
    ) {
      return total;
    }
    return total + normalizarNumero(actividad.horas_semanales);
  }, 0);
}

export function validarAsignacionActividadNoLectiva(params: {
  docente?: DocenteCargaNoLectiva | null;
  actividad: ActividadNoLectivaBase;
  actividadesExistentes?: ActividadNoLectivaBase[];
  horasLectivas?: number | null;
}) {
  const actividad = params.actividad || {};
  const tipoActividad = String(actividad.tipo_actividad || '');
  const horasSolicitadas = normalizarNumero(actividad.horas_semanales);
  const autoevaluacionAprobada = tieneAprobacionAutoevaluacion(
    actividad.datos_sustento || undefined,
    params.docente as { departamento?: unknown } | null
  );
  const { modalidad, limites } = obtenerLimitesNoLectivosPorModalidad({
    docente: params.docente,
    autoevaluacionAprobada,
    horasLectivas: params.horasLectivas
  });

  const limite = limites[tipoActividad] ?? Number.POSITIVE_INFINITY;
  const horasAcumuladas = calcularHorasAcumuladasPorTipo({
    actividades: params.actividadesExistentes || [],
    tipoActividad,
    excluirIdActividad: actividad.id_actividad || null
  });
  const totalPropuesto = horasAcumuladas + horasSolicitadas;
  const etiqueta = obtenerEtiquetaActividadNoLectiva(tipoActividad);

  if (tipoActividad === 'autoevaluacion_acreditacion' && !autoevaluacionAprobada) {
    return {
      valido: false,
      limite,
      modalidad,
      horasAcumuladas,
      horasDisponibles: 0,
      mensaje:
        'La autoevaluación y/o acreditación solo puede registrarse cuando la escuela profesional tiene aprobación formal del proceso.'
    };
  }

  if (limite <= 0) {
    return {
      valido: false,
      limite,
      modalidad,
      horasAcumuladas,
      horasDisponibles: 0,
      mensaje: `La modalidad ${modalidad} no permite asignar horas en ${etiqueta.toLowerCase()}.`
    };
  }

  if (horasSolicitadas <= 0) {
    return {
      valido: false,
      limite,
      modalidad,
      horasAcumuladas,
      horasDisponibles: Math.max(limite - horasAcumuladas, 0),
      mensaje: `Debes asignar al menos 1 hora en ${etiqueta.toLowerCase()}.`
    };
  }

  if (totalPropuesto > limite) {
    return {
      valido: false,
      limite,
      modalidad,
      horasAcumuladas,
      horasDisponibles: Math.max(limite - horasAcumuladas, 0),
      mensaje: `La modalidad ${modalidad} permite como máximo ${limite} hora(s) en ${etiqueta.toLowerCase()}. Ya tienes ${horasAcumuladas} hora(s) registradas en ese rubro.`
    };
  }

  return {
    valido: true,
    limite,
    modalidad,
    horasAcumuladas,
    horasDisponibles: Math.max(limite - horasAcumuladas, 0),
    mensaje: ''
  };
}
