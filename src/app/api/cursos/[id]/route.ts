import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  construirTextoPrerequisitos,
  esTipoCursoValido,
  normalizarIdsCursos,
  normalizarTextoCurso,
  normalizarTextoCursoOracion,
  normalizarTipoCurso,
  validarMultiplesPrerequisitos
} from '@/lib/cursos';

export const dynamic = 'force-dynamic';

function parseEnteroSeguro(valor: unknown, fallback = 0) {
  const numero = Number.parseInt(String(valor ?? ''), 10);
  return Number.isFinite(numero) ? numero : fallback;
}

async function resolverDepartamentoCurso(idDepartamentoRaw: unknown) {
  if (idDepartamentoRaw === undefined) {
    return undefined;
  }

  if (idDepartamentoRaw === null || idDepartamentoRaw === '') {
    return null;
  }

  const idDepartamento = parseEnteroSeguro(idDepartamentoRaw, Number.NaN);
  if (!Number.isFinite(idDepartamento)) {
    return { error: 'El departamento académico seleccionado no es válido.' as const };
  }

  const departamento = await prisma.departamentoAcademico.findFirst({
    where: {
      id_departamento: idDepartamento,
      activo: true
    },
    select: {
      id_departamento: true,
      nombre: true
    }
  });

  if (!departamento) {
    return { error: 'No se encontró el departamento académico seleccionado.' as const };
  }

  return departamento;
}

function includeCursoBase() {
  return {
    departamento: true,
    prerequisitos_relacion: {
      select: {
        prerequisito: {
          select: {
            id_curso: true,
            codigo: true,
            nombre: true,
            activo: true
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

function serializarCurso(curso: any) {
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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idCurso = Number.parseInt(params.id, 10);

    if (!Number.isFinite(idCurso)) {
      return NextResponse.json(
        { exito: false, error: 'El identificador del curso no es válido.' },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.findUnique({
      where: { id_curso: idCurso },
      include: {
        ...includeCursoBase(),
        grupos: {
          include: {
            docentes: {
              include: {
                docente: true
              }
            }
          }
        }
      }
    });

    if (!curso) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exito: true, datos: serializarCurso(curso) });
  } catch (error: any) {
    console.error('Error obteniendo curso:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_curso = Number.parseInt(params.id, 10);

    if (!Number.isFinite(id_curso)) {
      return NextResponse.json(
        { exito: false, error: 'El identificador del curso no es válido.' },
        { status: 400 }
      );
    }

    const datos = await request.json();
    const nombre = datos.nombre !== undefined ? normalizarTextoCursoOracion(datos.nombre) : undefined;
    const planEstudios = datos.plan_estudios !== undefined ? normalizarTextoCurso(datos.plan_estudios) : undefined;
    const tipoCurso = datos.tipo_curso !== undefined ? normalizarTipoCurso(datos.tipo_curso) : undefined;
    const departamentoCurso = await resolverDepartamentoCurso(datos.id_departamento);
    const prerequisitoIds =
      datos.prerequisito_ids !== undefined
        ? normalizarIdsCursos(datos.prerequisito_ids)
        : datos.prerequisito_id !== undefined
          ? datos.prerequisito_id === null || datos.prerequisito_id === ''
            ? []
            : normalizarIdsCursos([datos.prerequisito_id])
          : undefined;
    const creditos = datos.creditos !== undefined ? parseEnteroSeguro(datos.creditos, Number.NaN) : undefined;
    const horasTeoria =
      datos.horas_teoria !== undefined ? parseEnteroSeguro(datos.horas_teoria, Number.NaN) : undefined;
    const horasLaboratorio =
      datos.horas_laboratorio !== undefined ? parseEnteroSeguro(datos.horas_laboratorio, Number.NaN) : undefined;
    const horasPractica =
      datos.horas_practica !== undefined ? parseEnteroSeguro(datos.horas_practica, Number.NaN) : undefined;
    const ciclo =
      datos.ciclo !== undefined
        ? (datos.ciclo === null || datos.ciclo === '' ? null : parseEnteroSeguro(datos.ciclo, Number.NaN))
        : undefined;

    // Validar que el curso existe
    const cursoExistente = await prisma.curso.findUnique({
      where: { id_curso },
      include: includeCursoBase()
    });

    if (!cursoExistente) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Validar datos
    if (datos.nombre !== undefined && !nombre) {
      return NextResponse.json(
        { exito: false, error: 'El nombre no puede estar vacío' },
        { status: 400 }
      );
    }

    if (datos.tipo_curso !== undefined && (!tipoCurso || !esTipoCursoValido(tipoCurso))) {
      return NextResponse.json(
        { exito: false, error: 'El tipo de curso no es válido.' },
        { status: 400 }
      );
    }

    if (departamentoCurso && typeof departamentoCurso === 'object' && 'error' in departamentoCurso) {
      return NextResponse.json(
        { exito: false, error: departamentoCurso.error },
        { status: 400 }
      );
    }

    if (datos.id_departamento !== undefined && departamentoCurso === null) {
      return NextResponse.json(
        { exito: false, error: 'El departamento académico del curso es obligatorio.' },
        { status: 400 }
      );
    }

    if (
      (horasTeoria !== undefined && (!Number.isFinite(horasTeoria) || horasTeoria < 0)) ||
      (horasLaboratorio !== undefined && (!Number.isFinite(horasLaboratorio) || horasLaboratorio < 0)) ||
      (horasPractica !== undefined && (!Number.isFinite(horasPractica) || horasPractica < 0))
    ) {
      return NextResponse.json(
        { exito: false, error: 'Las horas no pueden ser negativas' },
        { status: 400 }
      );
    }

    if (creditos !== undefined && (!Number.isFinite(creditos) || creditos < 0)) {
      return NextResponse.json(
        { exito: false, error: 'Los créditos deben ser un número válido mayor o igual a cero.' },
        { status: 400 }
      );
    }

    if (ciclo !== undefined && ciclo !== null && !Number.isFinite(ciclo)) {
      return NextResponse.json(
        { exito: false, error: 'El ciclo debe ser un número válido.' },
        { status: 400 }
      );
    }

    const prerequisitosActuales = cursoExistente.prerequisitos_relacion.map((item) => item.prerequisito);
    const prerequisitosObjetivoIds =
      prerequisitoIds === undefined
        ? prerequisitosActuales.map((curso) => curso.id_curso)
        : prerequisitoIds;
    const cursosPrerequisito = prerequisitosObjetivoIds.length
      ? await prisma.curso.findMany({
          where: {
            id_curso: {
              in: prerequisitosObjetivoIds
            }
          },
          select: {
            id_curso: true,
            codigo: true,
            nombre: true,
            activo: true
          }
        })
      : [];

    const validacionPrerequisitos = validarMultiplesPrerequisitos({
      idCursoActual: id_curso,
      prerequisitoIds: prerequisitosObjetivoIds,
      cursosDisponibles: cursosPrerequisito
    });

    if (!validacionPrerequisitos.valido) {
      return NextResponse.json(
        { exito: false, error: validacionPrerequisitos.error },
        { status: 400 }
      );
    }

    const curso = await prisma.$transaction(async (tx) => {
      if (prerequisitoIds !== undefined) {
        await tx.cursoPrerequisito.deleteMany({
          where: {
            id_curso
          }
        });
      }

      return tx.curso.update({
        where: { id_curso },
        data: {
          nombre: nombre ?? cursoExistente.nombre,
          id_departamento:
            departamentoCurso && typeof departamentoCurso === 'object' && 'id_departamento' in departamentoCurso
              ? departamentoCurso.id_departamento
              : cursoExistente.id_departamento,
          tipo_curso: tipoCurso ?? cursoExistente.tipo_curso,
          escuela_profesional:
            departamentoCurso && typeof departamentoCurso === 'object' && 'nombre' in departamentoCurso
              ? departamentoCurso.nombre
              : cursoExistente.escuela_profesional,
          horas_teoria: horasTeoria ?? cursoExistente.horas_teoria,
          horas_laboratorio: horasLaboratorio ?? cursoExistente.horas_laboratorio,
          horas_practica: horasPractica ?? cursoExistente.horas_practica,
          creditos: creditos ?? cursoExistente.creditos,
          ciclo: ciclo ?? cursoExistente.ciclo,
          plan_estudios: planEstudios ?? cursoExistente.plan_estudios,
          prerequisitos:
            prerequisitoIds === undefined
              ? cursoExistente.prerequisitos
              : construirTextoPrerequisitos(cursosPrerequisito),
          prerequisitos_relacion:
            prerequisitoIds !== undefined && prerequisitosObjetivoIds.length
              ? {
                  create: prerequisitosObjetivoIds.map((idPrerequisito) => ({
                    id_curso_prerequisito: idPrerequisito
                  }))
                }
              : undefined
        },
        include: includeCursoBase()
      });
    });

    return NextResponse.json({
      exito: true,
      datos: serializarCurso(curso),
      mensaje: 'Curso actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error actualizando curso:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'Error al actualizar el curso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id_curso = Number.parseInt(params.id, 10);

    if (!Number.isFinite(id_curso)) {
      return NextResponse.json(
        { exito: false, error: 'El identificador del curso no es válido.' },
        { status: 400 }
      );
    }

    // Validar que el curso existe
    const curso = await prisma.curso.findUnique({
      where: { id_curso }
    });

    if (!curso) {
      return NextResponse.json(
        { exito: false, error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Cambiar estado a inactivo
    await prisma.curso.update({
      where: { id_curso },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Curso "${curso.nombre}" eliminado exitosamente`
    });
  } catch (error: any) {
    console.error('Error eliminando curso:', error);
    return NextResponse.json(
      { exito: false, error: error.message || 'Error al eliminar el curso' },
      { status: 500 }
    );
  }
}
