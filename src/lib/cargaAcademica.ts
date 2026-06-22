import {
  obtenerEtiquetaActividadNoLectiva,
  obtenerLimitesNoLectivosPorModalidad,
  tieneAprobacionAutoevaluacion,
  type ActividadNoLectivaBase,
  type DocenteCargaNoLectiva
} from '@/lib/cargaNoLectiva';

type DocenteCargaAcademica = DocenteCargaNoLectiva & {
  horas_maximas_semanales?: number | null;
  departamento?: unknown;
};

type CargaAcademicaBase = {
  horas_lectivas?: number | null;
  horas_no_lectivas?: number | null;
  horas_preparacion?: number | null;
  horas_totales?: number | null;
  horas_meta?: number | null;
};

const RUBROS_EXIGIBLES = [
  'tutoria_consejeria',
  'investigacion',
  'responsabilidad_social',
  'asesoria_tesis_jurado',
  'perfeccionamiento',
  'autoevaluacion_acreditacion'
] as const;

function normalizarNumero(valor: unknown) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

export function obtenerHorasMetaDocente(docente?: DocenteCargaAcademica | null, carga?: CargaAcademicaBase | null) {
  const horasDocente = normalizarNumero(docente?.horas_maximas_semanales);
  if (horasDocente > 0) return horasDocente;

  const horasMeta = normalizarNumero(carga?.horas_meta);
  if (horasMeta > 0) return horasMeta;

  return 40;
}

export function validarEnvioCargaAcademica(params: {
  docente?: DocenteCargaAcademica | null;
  carga?: CargaAcademicaBase | null;
  actividades?: ActividadNoLectivaBase[];
}) {
  const actividades = params.actividades || [];
  const docente = params.docente;
  const carga = params.carga || {};
  const autoevaluacionAprobada = tieneAprobacionAutoevaluacion(undefined, docente);
  const { modalidad, limites } = obtenerLimitesNoLectivosPorModalidad({
    docente,
    autoevaluacionAprobada
  });

  const rubrosRequeridos = RUBROS_EXIGIBLES.filter((tipo) => (limites[tipo] ?? 0) > 0);
  const rubrosRegistrados = new Set(
    actividades
      .filter((actividad) => normalizarNumero(actividad.horas_semanales) > 0)
      .map((actividad) => String(actividad.tipo_actividad || ''))
  );
  const rubrosFaltantes = rubrosRequeridos.filter((tipo) => !rubrosRegistrados.has(tipo));

  const horasLectivas = normalizarNumero(carga.horas_lectivas);
  const horasNoLectivas = normalizarNumero(carga.horas_no_lectivas);
  const horasPreparacion = normalizarNumero(carga.horas_preparacion);
  // El total semanal debe ser Horas Lectivas + Horas No Lectivas (no suma preparación)
  const horasTotales = normalizarNumero(carga.horas_totales) || horasLectivas + horasNoLectivas;
  const horasMeta = obtenerHorasMetaDocente(docente, carga);

  if (rubrosFaltantes.length > 0) {
    const etiquetas = rubrosFaltantes.map((tipo) => obtenerEtiquetaActividadNoLectiva(tipo)).join(', ');
    return {
      valido: false,
      modalidad,
      rubrosFaltantes,
      horasMeta,
      horasLectivas,
      horasNoLectivas,
      horasPreparacion,
      horasTotales,
      mensaje: `Debes registrar todos los rubros que corresponden a la modalidad ${modalidad}. Faltan: ${etiquetas}.`
    };
  }

  if (horasTotales !== horasMeta) {
    return {
      valido: false,
      modalidad,
      rubrosFaltantes,
      horasMeta,
      horasLectivas,
      horasNoLectivas,
      horasPreparacion,
      horasTotales,
      mensaje: `No puedes enviar la carga porque el total semanal debe ser ${horasMeta} hora(s). Actualmente tienes ${horasLectivas} hora(s) lectivas, ${horasNoLectivas} hora(s) no lectivas y ${horasPreparacion} hora(s) de preparación; el total semanal considerado es ${horasTotales} hora(s).`
    };
  }

  return {
    valido: true,
    modalidad,
    rubrosFaltantes,
    horasMeta,
    horasLectivas,
    horasNoLectivas,
    horasPreparacion,
    horasTotales,
    mensaje: ''
  };
}
