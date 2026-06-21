export const TIPOS_CURSO_OPTIONS = [
  { valor: 'O', etiqueta: 'O - Obligatorio' },
  { valor: 'E', etiqueta: 'E - Electivo' },
  { valor: 'EG-OB', etiqueta: 'EG-OB - Estudios Generales Obligatorios' },
  { valor: 'EG-OP', etiqueta: 'EG-OP - Estudios Generales Optativos' },
  { valor: 'EG-EL', etiqueta: 'EG-EL - Estudios Generales Electivos' },
  { valor: 'ES', etiqueta: 'ES - Específico' },
  { valor: 'EP', etiqueta: 'EP - Especialidad' },
  { valor: 'EE', etiqueta: 'EE - Electivo Especialidad' }
] as const;

export type TipoCursoPlan = (typeof TIPOS_CURSO_OPTIONS)[number]['valor'];

export type CursoPrerequisitoDetalle = {
  id_curso: number;
  codigo: string;
  nombre: string;
};

export function esTipoCursoValido(valor?: string | null): valor is TipoCursoPlan {
  return TIPOS_CURSO_OPTIONS.some((item) => item.valor === valor);
}

export function normalizarTextoCurso(valor?: string | null) {
  return String(valor || '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizarTextoCursoOracion(valor?: string | null) {
  const texto = normalizarTextoCurso(valor);
  if (!texto) return '';

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function normalizarTipoCurso(valor?: string | null): TipoCursoPlan | null {
  const texto = normalizarTextoCurso(valor).toUpperCase();
  return esTipoCursoValido(texto) ? texto : null;
}

export function obtenerEtiquetaTipoCurso(valor?: string | null) {
  return TIPOS_CURSO_OPTIONS.find((item) => item.valor === valor)?.etiqueta || String(valor || '-');
}

export function obtenerCodigoTipoCurso(valor?: string | null) {
  return normalizarTextoCurso(valor) || '-';
}

export function obtenerEtiquetaCarreraCurso(valor?: string | null) {
  const texto = normalizarTextoCurso(valor);
  if (!texto) return '-';

  const limpio = texto
    .replace(/^departamento academico del?\s+/i, '')
    .replace(/^departamento academico de\s+/i, '')
    .replace(/^departamento del?\s+/i, '')
    .replace(/^departamento de\s+/i, '')
    .replace(/^departamento\s+/i, '')
    .trim();

  return normalizarTextoCursoOracion(limpio) || '-';
}

export function normalizarIdsCursos(valores: unknown): number[] {
  if (!Array.isArray(valores)) return [];

  return Array.from(
    new Set(
      valores
        .map((valor) => Number.parseInt(String(valor), 10))
        .filter((valor) => Number.isFinite(valor) && valor > 0)
    )
  );
}

export function construirTextoPrerequisitos(prerequisitos: CursoPrerequisitoDetalle[]) {
  if (!prerequisitos.length) return null;

  return prerequisitos
    .map((curso) => `${curso.codigo} - ${curso.nombre}`)
    .join(', ');
}

export function formatearEtiquetaPrerequisito(curso: CursoPrerequisitoDetalle) {
  return `${curso.codigo} - ${curso.nombre}`;
}

export function validarMultiplesPrerequisitos(params: {
  idCursoActual?: number | null;
  prerequisitoIds: number[];
  cursosDisponibles: Array<CursoPrerequisitoDetalle & { activo?: boolean | null }>;
}) {
  const { idCursoActual = null, prerequisitoIds, cursosDisponibles } = params;
  const mapaCursos = new Map(cursosDisponibles.map((curso) => [curso.id_curso, curso]));

  if (new Set(prerequisitoIds).size !== prerequisitoIds.length) {
    return { valido: false, error: 'No se pueden repetir prerrequisitos en el mismo curso.' };
  }

  if (idCursoActual && prerequisitoIds.includes(idCursoActual)) {
    return { valido: false, error: 'Un curso no puede ser prerrequisito de sí mismo.' };
  }

  for (const prerequisitoId of prerequisitoIds) {
    const curso = mapaCursos.get(prerequisitoId);
    if (!curso || curso.activo === false) {
      return { valido: false, error: 'Uno o más prerrequisitos seleccionados no existen o están inactivos.' };
    }
  }

  return { valido: true };
}

export function evaluarCumplimientoPrerequisitos(params: {
  prerequisitoIds: number[];
  cursosAprobadosIds: number[];
}) {
  const aprobados = new Set(params.cursosAprobadosIds);
  const faltantes = params.prerequisitoIds.filter((id) => !aprobados.has(id));

  return {
    cumple: faltantes.length === 0,
    faltantes
  };
}
