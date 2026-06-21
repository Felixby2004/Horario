import { Prisma } from '../../generated/prisma-client-next';
import { prisma } from '@/lib/prisma';
import { construirTextoPrerequisitos } from '@/lib/cursos';

type CursoPlanSnapshot = {
  id_curso: number;
  codigo: string;
  nombre: string;
  tipo_curso: string | null;
  ciclo: number | null;
  creditos: number;
  horas_teoria: number;
  horas_practica: number;
  horas_laboratorio: number;
  horas_totales: number;
  prerequisitos: string | null;
  prerequisito_ids: number[];
  escuela_profesional: string | null;
  departamento: string | null;
};

type PlanSnapshot = {
  plan: {
    id_plan: number;
    codigo: string;
    nombre: string;
    anio_creacion: number;
    anio_vigencia: number;
    estado: boolean;
    resolucion_aprobacion: string | null;
    id_departamento: number | null;
    escuela_profesional: string | null;
    version_actual: number;
    fecha_actualizacion: string;
  };
  cursos: CursoPlanSnapshot[];
};

type CambioCursoSnapshot = {
  id_curso: number;
  codigo: string;
  nombre: string;
};

type CursoModificadoSnapshot = CambioCursoSnapshot & {
  cambios: Record<string, { antes: unknown; despues: unknown }>;
};

type DiffSnapshotPlan = {
  cursosAgregados: CambioCursoSnapshot[];
  cursosEliminados: CambioCursoSnapshot[];
  cursosModificados: CursoModificadoSnapshot[];
};

function normalizarTexto(valor?: string | null) {
  return String(valor || '').trim().replace(/\s+/g, ' ');
}

function normalizarTextoOracion(valor?: string | null) {
  const texto = normalizarTexto(valor);
  if (!texto) return '';

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function parsearEntero(valor: unknown) {
  const numero = Number.parseInt(String(valor ?? ''), 10);
  return Number.isFinite(numero) ? numero : Number.NaN;
}

function esCursoModificadoSnapshot(
  valor: CursoModificadoSnapshot | null
): valor is CursoModificadoSnapshot {
  return Boolean(valor);
}

function aJsonValor<T>(valor: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(valor)) as Prisma.InputJsonValue;
}

function inferirAnioDesdeCodigo(codigo?: string | null) {
  const match = String(codigo || '').match(/(19|20)\d{2}/);
  return match ? Number.parseInt(match[0], 10) : new Date().getFullYear();
}

function includeCursoConPrerequisitos() {
  return {
    departamento: true,
    prerequisitos_relacion: {
      select: {
        prerequisito: {
          select: {
            id_curso: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: {
        prerequisito: {
          codigo: 'asc' as const
        }
      }
    }
  };
}

function serializarCursoConPrerequisitos(curso: any) {
  const prerequisitosDetalle = (curso.prerequisitos_relacion || [])
    .map((item: any) => item.prerequisito)
    .filter(Boolean)
    .map((prerequisito: any) => ({
      id_curso: prerequisito.id_curso,
      codigo: prerequisito.codigo,
      nombre: prerequisito.nombre
    }));

  return {
    ...curso,
    prerequisito_ids: prerequisitosDetalle.map((curso: any) => curso.id_curso),
    prerequisitos_detalle: prerequisitosDetalle,
    prerequisitos: construirTextoPrerequisitos(prerequisitosDetalle)
  };
}

function construirNombrePlan(codigo: string) {
  return `Plan de estudios ${codigo}`;
}

export async function sincronizarPlanesDesdeCursos() {
  const cursos = await prisma.curso.findMany({
    where: {
      activo: true,
      plan_estudios: {
        not: null
      }
    },
    select: {
      plan_estudios: true,
      id_departamento: true
    }
  });

  const codigos = Array.from(
    new Set(
      cursos
        .map((curso) => normalizarTexto(curso.plan_estudios))
        .filter(Boolean)
    )
  );

  if (!codigos.length) return [];

  for (const codigo of codigos) {
    const cursosDelPlan = cursos.filter((curso) => normalizarTexto(curso.plan_estudios) === codigo);
    const frecuenciaDepartamentos = new Map<number, number>();

    cursosDelPlan.forEach((curso) => {
      if (!curso.id_departamento) return;
      frecuenciaDepartamentos.set(
        curso.id_departamento,
        (frecuenciaDepartamentos.get(curso.id_departamento) || 0) + 1
      );
    });

    const departamentoMasComun = Array.from(frecuenciaDepartamentos.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const anio = inferirAnioDesdeCodigo(codigo);

    await prisma.planEstudio.upsert({
      where: {
        codigo
      },
      update: {},
      create: {
        codigo,
        nombre: construirNombrePlan(codigo),
        anio_creacion: anio,
        anio_vigencia: anio,
        id_departamento: departamentoMasComun
      }
    });
  }

  return prisma.planEstudio.findMany({
    include: {
      departamento: true,
      usuario_modificador: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true
        }
      }
    },
    orderBy: [
      { anio_vigencia: 'desc' },
      { codigo: 'asc' }
    ]
  });
}

export async function obtenerPlanesEstudioDisponibles() {
  await sincronizarPlanesDesdeCursos();

  return prisma.planEstudio.findMany({
    include: {
      departamento: true,
      usuario_modificador: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true
        }
      },
      _count: {
        select: {
          versiones: true
        }
      }
    },
    orderBy: [
      { anio_vigencia: 'desc' },
      { codigo: 'asc' }
    ]
  });
}

export async function obtenerPlanPorId(idPlan: number) {
  await sincronizarPlanesDesdeCursos();

  return prisma.planEstudio.findUnique({
    where: { id_plan: idPlan },
    include: {
      departamento: {
        include: {
          facultad: true
        }
      },
      usuario_modificador: {
        select: {
          id_usuario: true,
          nombres: true,
          apellidos: true,
          codigo: true
        }
      },
      versiones: {
        orderBy: {
          numero_version: 'desc'
        },
        include: {
          usuario_responsable: {
            select: {
              id_usuario: true,
              nombres: true,
              apellidos: true,
              codigo: true
            }
          }
        }
      }
    }
  });
}

export async function obtenerCursosDePlan(codigoPlan: string) {
  const codigoNormalizado = normalizarTexto(codigoPlan);
  return prisma.curso.findMany({
    where: {
      activo: true,
      plan_estudios: codigoNormalizado
    },
    include: includeCursoConPrerequisitos(),
    orderBy: [
      { ciclo: 'asc' },
      { codigo: 'asc' }
    ]
  }).then((cursos) => cursos.map(serializarCursoConPrerequisitos));
}

export async function obtenerCursosDisponiblesParaAsignar(codigoPlan: string) {
  const codigoNormalizado = normalizarTexto(codigoPlan);
  return prisma.curso.findMany({
    where: {
      activo: true,
      OR: [
        { plan_estudios: null },
        { plan_estudios: codigoNormalizado },
        { plan_estudios: '' }
      ]
    },
    include: includeCursoConPrerequisitos(),
    orderBy: [
      { ciclo: 'asc' },
      { codigo: 'asc' }
    ]
  }).then((cursos) => cursos.map(serializarCursoConPrerequisitos));
}

export async function obtenerSnapshotPlanEstudio(idPlan: number): Promise<PlanSnapshot> {
  const plan = await prisma.planEstudio.findUnique({
    where: { id_plan: idPlan },
    include: {
      departamento: true
    }
  });

  if (!plan) {
    throw new Error('Plan de estudio no encontrado.');
  }

  const cursos = await prisma.curso.findMany({
    where: {
      activo: true,
      plan_estudios: plan.codigo
    },
    include: includeCursoConPrerequisitos(),
    orderBy: [
      { ciclo: 'asc' },
      { codigo: 'asc' }
    ]
  });

  return {
    plan: {
      id_plan: plan.id_plan,
      codigo: plan.codigo,
      nombre: plan.nombre,
      anio_creacion: plan.anio_creacion,
      anio_vigencia: plan.anio_vigencia,
      estado: plan.estado,
      resolucion_aprobacion: plan.resolucion_aprobacion,
      id_departamento: plan.id_departamento,
      escuela_profesional: plan.departamento?.nombre || null,
      version_actual: plan.version_actual,
      fecha_actualizacion: plan.fecha_actualizacion.toISOString()
    },
    cursos: cursos.map((curso) => {
      const cursoSerializado = serializarCursoConPrerequisitos(curso);

      return {
        id_curso: curso.id_curso,
        codigo: curso.codigo,
        nombre: curso.nombre,
        tipo_curso: curso.tipo_curso || null,
        ciclo: curso.ciclo ?? null,
        creditos: curso.creditos,
        horas_teoria: curso.horas_teoria,
        horas_practica: curso.horas_practica,
        horas_laboratorio: curso.horas_laboratorio,
        horas_totales: curso.horas_teoria + curso.horas_practica + curso.horas_laboratorio,
        prerequisitos: cursoSerializado.prerequisitos || null,
        prerequisito_ids: cursoSerializado.prerequisito_ids || [],
        escuela_profesional: curso.escuela_profesional || null,
        departamento: curso.departamento?.nombre || null
      };
    })
  };
}

export function compararSnapshotsPlan(
  antes?: PlanSnapshot | null,
  despues?: PlanSnapshot | null
): DiffSnapshotPlan {
  const cursosAntes = new Map((antes?.cursos || []).map((curso) => [curso.id_curso, curso]));
  const cursosDespues = new Map((despues?.cursos || []).map((curso) => [curso.id_curso, curso]));

  const cursosAgregados = (despues?.cursos || [])
    .filter((curso) => !cursosAntes.has(curso.id_curso))
    .map((curso) => ({
      id_curso: curso.id_curso,
      codigo: curso.codigo,
      nombre: curso.nombre
    }));

  const cursosEliminados = (antes?.cursos || [])
    .filter((curso) => !cursosDespues.has(curso.id_curso))
    .map((curso) => ({
      id_curso: curso.id_curso,
      codigo: curso.codigo,
      nombre: curso.nombre
    }));

  const cursosModificados = (despues?.cursos || [])
    .map((curso) => {
      const previo = cursosAntes.get(curso.id_curso);
      if (!previo) return null;

      const cambios: Record<string, { antes: unknown; despues: unknown }> = {};
      const camposComparables: Array<keyof CursoPlanSnapshot> = [
        'nombre',
        'tipo_curso',
        'ciclo',
        'creditos',
        'horas_teoria',
        'horas_practica',
        'horas_laboratorio',
        'horas_totales',
        'prerequisitos'
      ];

      camposComparables.forEach((campo) => {
        if (previo[campo] !== curso[campo]) {
          cambios[campo] = {
            antes: previo[campo],
            despues: curso[campo]
          };
        }
      });

      if (!Object.keys(cambios).length) return null;

      return {
        id_curso: curso.id_curso,
        codigo: curso.codigo,
        nombre: curso.nombre,
        cambios
      };
    })
    .filter(esCursoModificadoSnapshot);

  return {
    cursosAgregados,
    cursosEliminados,
    cursosModificados
  };
}

export function validarDatosPlan(payload: any) {
  const errores: Record<string, string> = {};
  const nombre = normalizarTextoOracion(payload.nombre);
  const codigo = normalizarTexto(payload.codigo);
  const anioCreacion = parsearEntero(payload.anio_creacion);
  const anioVigencia = parsearEntero(payload.anio_vigencia);
  const idDepartamento = parsearEntero(payload.id_departamento);

  if (!nombre) {
    errores.nombre = 'El nombre del plan es obligatorio.';
  }

  if (!codigo) {
    errores.codigo = 'El código del plan es obligatorio.';
  }

  if (!Number.isFinite(anioCreacion) || anioCreacion < 1900 || anioCreacion > 2100) {
    errores.anio_creacion = 'El año de creación no es válido.';
  }

  if (!Number.isFinite(anioVigencia) || anioVigencia < 1900 || anioVigencia > 2100) {
    errores.anio_vigencia = 'El año de vigencia no es válido.';
  }

  if (Number.isFinite(anioCreacion) && Number.isFinite(anioVigencia) && anioVigencia < anioCreacion) {
    errores.anio_vigencia = 'El año de vigencia no puede ser menor al año de creación.';
  }

  if (!Number.isFinite(idDepartamento) || idDepartamento <= 0) {
    errores.id_departamento = 'La escuela profesional es obligatoria.';
  }

  return errores;
}

export async function validarDuplicidadPlan(payload: any, excludeId?: number) {
  const errores: Record<string, string> = {};
  const nombre = normalizarTextoOracion(payload.nombre);
  const codigo = normalizarTexto(payload.codigo);

  if (nombre) {
    const existenteNombre = await prisma.planEstudio.findFirst({
      where: {
        nombre,
        ...(excludeId ? { id_plan: { not: excludeId } } : {})
      },
      select: {
        id_plan: true
      }
    });

    if (existenteNombre) {
      errores.nombre = 'Ya existe un plan con ese nombre.';
    }
  }

  if (codigo) {
    const existenteCodigo = await prisma.planEstudio.findFirst({
      where: {
        codigo,
        ...(excludeId ? { id_plan: { not: excludeId } } : {})
      },
      select: {
        id_plan: true
      }
    });

    if (existenteCodigo) {
      errores.codigo = 'Ya existe un plan con ese código.';
    }
  }

  return errores;
}

export async function registrarVersionPlanEstudio(params: {
  idPlan: number;
  idUsuarioResponsable?: number | null;
  descripcionCambios?: string | null;
  snapshotAntes?: PlanSnapshot | null;
  snapshotDespues: PlanSnapshot;
  restauradaDesdeVersion?: number | null;
}) {
  const diff = compararSnapshotsPlan(params.snapshotAntes, params.snapshotDespues);
  const planActual = await prisma.planEstudio.findUnique({
    where: { id_plan: params.idPlan },
    select: {
      version_actual: true
    }
  });

  const numeroVersion = Math.max(1, (planActual?.version_actual || 0) + 1);

  await prisma.planEstudio.update({
    where: { id_plan: params.idPlan },
    data: {
      version_actual: numeroVersion
    }
  });

  const data: Prisma.HistorialVersionPlanEstudioUncheckedCreateInput = {
    id_plan: params.idPlan,
    numero_version: numeroVersion,
    id_usuario_responsable: params.idUsuarioResponsable || null,
    descripcion_cambios: normalizarTextoOracion(params.descripcionCambios) || null,
    snapshot_antes: params.snapshotAntes ? aJsonValor(params.snapshotAntes) : Prisma.JsonNull,
    snapshot_despues: aJsonValor(params.snapshotDespues),
    cursos_agregados: diff.cursosAgregados.length ? aJsonValor(diff.cursosAgregados) : Prisma.JsonNull,
    cursos_eliminados: diff.cursosEliminados.length ? aJsonValor(diff.cursosEliminados) : Prisma.JsonNull,
    cursos_modificados: diff.cursosModificados.length ? aJsonValor(diff.cursosModificados) : Prisma.JsonNull,
    restaurada_desde_version: params.restauradaDesdeVersion || null
  };

  return prisma.historialVersionPlanEstudio.create({
    data
  });
}
