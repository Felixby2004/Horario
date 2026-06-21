import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  obtenerCursosDePlan,
  obtenerCursosDisponiblesParaAsignar,
  obtenerPlanPorId,
  obtenerSnapshotPlanEstudio,
  registrarVersionPlanEstudio,
  validarDatosPlan,
  validarDuplicidadPlan
} from '@/lib/planesEstudio';
import {
  construirTextoPrerequisitos,
  esTipoCursoValido,
  normalizarTextoCurso,
  normalizarTextoCursoOracion,
  normalizarTipoCurso
} from '@/lib/cursos';
import { obtenerUsuarioAutenticadoOpcional } from '@/lib/docentesIntegridad';

export const dynamic = 'force-dynamic';

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function obtenerIdDesdeParams(params: { id: string }) {
  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    throw new HttpError(400, 'El identificador del plan no es válido.');
  }
  return id;
}

function normalizarIds(lista: unknown) {
  if (!Array.isArray(lista)) return [];
  return Array.from(
    new Set(
      lista
        .map((valor) => Number.parseInt(String(valor), 10))
        .filter((valor) => Number.isFinite(valor) && valor > 0)
    )
  );
}

function parseEnteroSeguro(valor: unknown) {
  const numero = Number.parseInt(String(valor ?? ''), 10);
  return Number.isFinite(numero) ? numero : Number.NaN;
}

function parseBooleanoSeguro(valor: unknown, fallback = false) {
  if (valor === undefined) return fallback;
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor === 1;
  if (typeof valor === 'string') {
    const texto = valor.trim().toLowerCase();
    if (['true', '1', 'si', 'sí'].includes(texto)) return true;
    if (['false', '0', 'no'].includes(texto)) return false;
  }

  return Boolean(valor);
}

function normalizarPrerequisitosCurso(curso: any) {
  if (curso?.prerequisito_ids !== undefined) {
    return normalizarIds(curso.prerequisito_ids);
  }

  if (curso?.prerequisito_id !== undefined && curso?.prerequisito_id !== null && curso?.prerequisito_id !== '') {
    return normalizarIds([curso.prerequisito_id]);
  }

  if (curso?.prerequisito_id === null || curso?.prerequisito_id === '') {
    return [];
  }

  return undefined;
}

function normalizarTextoOracion(valor: unknown) {
  const texto = String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (!texto) return '';

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function responderError(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return NextResponse.json({ exito: false, error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return NextResponse.json({ exito: false, error: message || fallbackMessage }, { status: 500 });
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idPlan = obtenerIdDesdeParams(params);
    const plan = await obtenerPlanPorId(idPlan);

    if (!plan) {
      return NextResponse.json(
        { exito: false, error: 'Plan de estudio no encontrado.' },
        { status: 404 }
      );
    }

    const [cursos, cursosDisponibles] = await Promise.all([
      obtenerCursosDePlan(plan.codigo),
      obtenerCursosDisponiblesParaAsignar(plan.codigo)
    ]);

    return NextResponse.json({
      exito: true,
      datos: {
        plan,
        cursos,
        cursos_disponibles: cursosDisponibles
      }
    });
  } catch (error: any) {
    console.error('Error cargando plan de estudio:', error);
    return responderError(error, 'No se pudo cargar el plan de estudio.');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idPlan = obtenerIdDesdeParams(params);
    const body = await request.json();
    const planActual = await obtenerPlanPorId(idPlan);

    if (!planActual) {
      return NextResponse.json(
        { exito: false, error: 'Plan de estudio no encontrado.' },
        { status: 404 }
      );
    }

    const errores = {
      ...validarDatosPlan(body),
      ...(await validarDuplicidadPlan(body, idPlan))
    };

    if (Object.keys(errores).length) {
      return NextResponse.json(
        { exito: false, errores, error: 'Los datos del plan no son válidos.' },
        { status: 400 }
      );
    }

    const idDepartamento = Number.parseInt(String(body.id_departamento), 10);
    const departamento = await prisma.departamentoAcademico.findUnique({
      where: {
        id_departamento: idDepartamento
      }
    });

    if (!departamento) {
      return NextResponse.json(
        { exito: false, error: 'La escuela profesional seleccionada no existe.' },
        { status: 400 }
      );
    }

    const cursosAgregados = normalizarIds(body.cursos_agregados);
    const cursosEliminados = normalizarIds(body.cursos_eliminados);
    const cursosModificados = Array.isArray(body.cursos_modificados) ? body.cursos_modificados : [];
    const idsCursosModificados = normalizarIds(
      cursosModificados.map((curso: any) => curso?.id_curso)
    );
    const prerequisitosReferenciados = normalizarIds(
      cursosModificados.flatMap((curso: any) => normalizarPrerequisitosCurso(curso) || [])
    );
    const conflictoIds = cursosAgregados.filter((id) => cursosEliminados.includes(id));

    if (conflictoIds.length) {
      return NextResponse.json(
        { exito: false, error: 'Un mismo curso no puede agregarse y eliminarse en la misma operación.' },
        { status: 400 }
      );
    }

    const codigoAnterior = planActual.codigo;
    const codigoNuevo = String(body.codigo).trim();
    const nombreNuevo = normalizarTextoOracion(body.nombre);
    const descripcionCambios = normalizarTextoOracion(body.descripcion_cambios || '');
    const estadoNuevo = parseBooleanoSeguro(body.estado, planActual.estado);

    const idsReferenciados = Array.from(
      new Set([
        ...cursosAgregados,
        ...cursosEliminados,
        ...idsCursosModificados,
        ...prerequisitosReferenciados
      ])
    );

    const [cursosExistentes, cursosActualesPlan] = await Promise.all([
      prisma.curso.findMany({
        where: {
          id_curso: {
            in: idsReferenciados
          }
        },
        select: {
          id_curso: true,
          codigo: true,
          nombre: true,
          plan_estudios: true,
          prerequisitos: true,
          prerequisitos_relacion: {
            select: {
              prerequisito: {
                select: {
                  id_curso: true,
                  codigo: true,
                  nombre: true
                }
              }
            }
          },
          tipo_curso: true,
          ciclo: true,
          creditos: true,
          horas_teoria: true,
          horas_practica: true,
          horas_laboratorio: true,
          activo: true
        }
      }),
      prisma.curso.findMany({
        where: {
          activo: true,
          plan_estudios: codigoAnterior
        },
        select: {
          id_curso: true
        }
      })
    ]);

    const cursosExistentesSet = new Set(cursosExistentes.map((curso) => curso.id_curso));
    const faltantes = idsReferenciados.filter((id) => !cursosExistentesSet.has(id));
    if (faltantes.length) {
      return NextResponse.json(
        { exito: false, error: 'Uno o más cursos ya no existen.' },
        { status: 400 }
      );
    }

    const mapaCursos = new Map(cursosExistentes.map((curso) => [curso.id_curso, curso]));
    const idsActualesPlan = new Set(cursosActualesPlan.map((curso) => curso.id_curso));
    const idsAgregados = new Set(cursosAgregados);
    const idsResultadoPlan = new Set(
      cursosActualesPlan
        .map((curso) => curso.id_curso)
        .filter((id) => !cursosEliminados.includes(id))
    );

    for (const idCurso of cursosAgregados) {
      const curso = mapaCursos.get(idCurso);
      const planCurso = String(curso?.plan_estudios || '').trim();
      if (!curso?.activo) {
        return NextResponse.json(
          { exito: false, error: 'No se pueden agregar cursos inactivos al plan.' },
          { status: 400 }
        );
      }

      if (planCurso && planCurso !== codigoAnterior) {
        return NextResponse.json(
          { exito: false, error: 'Solo se pueden agregar cursos sin plan o pertenecientes al mismo plan.' },
          { status: 400 }
        );
      }

      idsResultadoPlan.add(idCurso);
    }

    for (const idCurso of cursosEliminados) {
      if (!idsActualesPlan.has(idCurso)) {
        return NextResponse.json(
          { exito: false, error: 'Solo se pueden eliminar cursos actualmente asociados al plan.' },
          { status: 400 }
        );
      }
    }

    for (const curso of cursosModificados) {
      const idCurso = Number.parseInt(String(curso.id_curso), 10);
      if (!Number.isFinite(idCurso) || idCurso <= 0) {
        return NextResponse.json(
          { exito: false, error: 'Cada curso modificado debe tener un identificador válido.' },
          { status: 400 }
        );
      }

      if (!idsActualesPlan.has(idCurso) && !idsAgregados.has(idCurso)) {
        return NextResponse.json(
          { exito: false, error: 'Solo se pueden modificar cursos del plan o agregados en la misma operación.' },
          { status: 400 }
        );
      }

      const cursoActual = mapaCursos.get(idCurso);
      if (!cursoActual?.activo) {
        return NextResponse.json(
          { exito: false, error: 'No se pueden modificar cursos inactivos.' },
          { status: 400 }
        );
      }

      const nombreCurso =
        curso.nombre !== undefined ? normalizarTextoCursoOracion(curso.nombre) : cursoActual.nombre;
      if (!nombreCurso) {
        return NextResponse.json(
          { exito: false, error: 'El nombre del curso no puede estar vacío.' },
          { status: 400 }
        );
      }

      const tipoCurso =
        curso.tipo_curso !== undefined ? normalizarTipoCurso(curso.tipo_curso) : cursoActual.tipo_curso;
      if (curso.tipo_curso !== undefined && (!tipoCurso || !esTipoCursoValido(tipoCurso))) {
        return NextResponse.json(
          { exito: false, error: 'El tipo de curso no es válido.' },
          { status: 400 }
        );
      }

      const ciclo =
        curso.ciclo === undefined
          ? cursoActual.ciclo
          : curso.ciclo === null || curso.ciclo === ''
            ? null
            : parseEnteroSeguro(curso.ciclo);
      if (ciclo !== null && (!Number.isFinite(ciclo) || ciclo <= 0)) {
        return NextResponse.json(
          { exito: false, error: 'El ciclo del curso debe ser un número válido mayor a cero.' },
          { status: 400 }
        );
      }

      const creditos =
        curso.creditos === undefined ? cursoActual.creditos : parseEnteroSeguro(curso.creditos);
      const horasTeoria =
        curso.horas_teoria === undefined
          ? cursoActual.horas_teoria
          : parseEnteroSeguro(curso.horas_teoria);
      const horasPractica =
        curso.horas_practica === undefined
          ? cursoActual.horas_practica
          : parseEnteroSeguro(curso.horas_practica);
      const horasLaboratorio =
        curso.horas_laboratorio === undefined
          ? cursoActual.horas_laboratorio
          : parseEnteroSeguro(curso.horas_laboratorio);

      if (
        !Number.isFinite(creditos) ||
        creditos < 0 ||
        !Number.isFinite(horasTeoria) ||
        horasTeoria < 0 ||
        !Number.isFinite(horasPractica) ||
        horasPractica < 0 ||
        !Number.isFinite(horasLaboratorio) ||
        horasLaboratorio < 0
      ) {
        return NextResponse.json(
          { exito: false, error: 'Los créditos y horas del curso deben ser números válidos mayores o iguales a cero.' },
          { status: 400 }
        );
      }

      const prerequisitoIds = normalizarPrerequisitosCurso(curso);

      if (prerequisitoIds?.includes(idCurso)) {
        return NextResponse.json(
          { exito: false, error: 'Un curso no puede ser prerrequisito de sí mismo.' },
          { status: 400 }
        );
      }

      for (const prerequisitoId of prerequisitoIds || []) {
        const prerequisito = mapaCursos.get(prerequisitoId);
        if (!prerequisito?.activo) {
          return NextResponse.json(
            { exito: false, error: 'Uno o más prerrequisitos seleccionados no existen.' },
            { status: 400 }
          );
        }

        if (!idsResultadoPlan.has(prerequisitoId)) {
          return NextResponse.json(
            { exito: false, error: 'Todos los prerrequisitos deben pertenecer al mismo plan de estudio.' },
            { status: 400 }
          );
        }
      }
    }

    const usuario = await obtenerUsuarioAutenticadoOpcional(request);
    const snapshotAntes = await obtenerSnapshotPlanEstudio(idPlan);

    await prisma.$transaction(async (tx) => {
      if (codigoNuevo !== codigoAnterior) {
        await tx.curso.updateMany({
          where: {
            plan_estudios: codigoAnterior
          },
          data: {
            plan_estudios: codigoNuevo
          }
        });
      }

      await tx.planEstudio.update({
        where: {
          id_plan: idPlan
        },
        data: {
          codigo: codigoNuevo,
          nombre: nombreNuevo,
          anio_creacion: Number.parseInt(String(body.anio_creacion), 10),
          anio_vigencia: Number.parseInt(String(body.anio_vigencia), 10),
          estado: estadoNuevo,
          resolucion_aprobacion: String(body.resolucion_aprobacion || '').trim() || null,
          id_departamento: idDepartamento,
          descripcion_cambios: descripcionCambios || null,
          fecha_ultima_modificacion: new Date(),
          id_usuario_modificador: usuario?.id_usuario || null
        }
      });

      if (cursosAgregados.length) {
        await tx.curso.updateMany({
          where: {
            id_curso: {
              in: cursosAgregados
            }
          },
          data: {
            plan_estudios: codigoNuevo,
            id_departamento: idDepartamento,
            escuela_profesional: departamento.nombre
          }
        });
      }

      if (cursosEliminados.length) {
        await tx.curso.updateMany({
          where: {
            id_curso: {
              in: cursosEliminados
            }
          },
          data: {
            plan_estudios: null
          }
        });
      }

      for (const curso of cursosModificados) {
        const idCurso = Number.parseInt(String(curso.id_curso), 10);
        const cursoActual = mapaCursos.get(idCurso);
        if (!cursoActual) continue;

        const nombreCurso =
          curso.nombre !== undefined ? normalizarTextoCursoOracion(curso.nombre) : cursoActual.nombre;
        const tipoCurso =
          curso.tipo_curso !== undefined ? normalizarTipoCurso(curso.tipo_curso) : cursoActual.tipo_curso;
        const ciclo =
          curso.ciclo === undefined
            ? cursoActual.ciclo
            : curso.ciclo === null || curso.ciclo === ''
              ? null
              : parseEnteroSeguro(curso.ciclo);
        const creditos =
          curso.creditos === undefined ? cursoActual.creditos : parseEnteroSeguro(curso.creditos);
        const horasTeoria =
          curso.horas_teoria === undefined
            ? cursoActual.horas_teoria
            : parseEnteroSeguro(curso.horas_teoria);
        const horasPractica =
          curso.horas_practica === undefined
            ? cursoActual.horas_practica
            : parseEnteroSeguro(curso.horas_practica);
        const horasLaboratorio =
          curso.horas_laboratorio === undefined
            ? cursoActual.horas_laboratorio
            : parseEnteroSeguro(curso.horas_laboratorio);
        const prerequisitoIds = normalizarPrerequisitosCurso(curso);
        const prerequisitosActuales = (cursoActual.prerequisitos_relacion || []).map((item) => item.prerequisito);
        const prerequisitos = prerequisitoIds === undefined
          ? prerequisitosActuales
          : prerequisitoIds
              .map((prerequisitoId) => mapaCursos.get(prerequisitoId))
              .filter(Boolean);

        await tx.curso.update({
          where: {
            id_curso: idCurso
          },
          data: {
            nombre: nombreCurso,
            tipo_curso: tipoCurso ?? null,
            ciclo,
            creditos,
            horas_teoria: horasTeoria,
            horas_practica: horasPractica,
            horas_laboratorio: horasLaboratorio,
            prerequisitos: prerequisitoIds === undefined ? cursoActual.prerequisitos : construirTextoPrerequisitos(prerequisitos as any),
            prerequisitos_relacion:
              prerequisitoIds !== undefined
                ? {
                    deleteMany: {},
                    ...(prerequisitoIds.length
                      ? {
                          create: prerequisitoIds.map((prerequisitoId) => ({
                            id_curso_prerequisito: prerequisitoId
                          }))
                        }
                      : {})
                  }
                : undefined,
            plan_estudios: codigoNuevo,
            id_departamento: idDepartamento,
            escuela_profesional: departamento.nombre
          }
        });
      }
    });

    const snapshotDespues = await obtenerSnapshotPlanEstudio(idPlan);
    if (JSON.stringify(snapshotAntes) !== JSON.stringify(snapshotDespues)) {
      await registrarVersionPlanEstudio({
        idPlan,
        idUsuarioResponsable: usuario?.id_usuario || null,
        descripcionCambios,
        snapshotAntes,
        snapshotDespues
      });
    }

    const [planActualizado, cursosActualizados, cursosDisponibles] = await Promise.all([
      obtenerPlanPorId(idPlan),
      obtenerCursosDePlan(codigoNuevo),
      obtenerCursosDisponiblesParaAsignar(codigoNuevo)
    ]);

    return NextResponse.json({
      exito: true,
      mensaje: 'Plan de estudio actualizado correctamente.',
      datos: {
        plan: planActualizado,
        cursos: cursosActualizados,
        cursos_disponibles: cursosDisponibles
      }
    });
  } catch (error: any) {
    console.error('Error actualizando plan de estudio:', error);
    return responderError(error, 'No se pudo actualizar el plan de estudio.');
  }
}
