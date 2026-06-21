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
  if (idDepartamentoRaw === undefined || idDepartamentoRaw === null || idDepartamentoRaw === '') {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo');
    const ciclo = searchParams.get('ciclo');
    const id_docente = searchParams.get('id_docente');
    const cicloNumero = ciclo ? Number.parseInt(ciclo, 10) : null;
    const periodoNumero = periodo ? Number.parseInt(periodo, 10) : null;
    const docenteId = id_docente ? Number.parseInt(id_docente, 10) : null;

    if (ciclo && !Number.isFinite(cicloNumero)) {
      return NextResponse.json(
        { exito: false, mensaje: 'El ciclo proporcionado no es válido.' },
        { status: 400 }
      );
    }

    if (periodo && !Number.isFinite(periodoNumero)) {
      return NextResponse.json(
        { exito: false, mensaje: 'El período proporcionado no es válido.' },
        { status: 400 }
      );
    }

    if (id_docente && !Number.isFinite(docenteId)) {
      return NextResponse.json(
        { exito: false, mensaje: 'El docente proporcionado no es válido.' },
        { status: 400 }
      );
    }

    let cursos;

    // Si se proporciona id_docente, obtener solo los cursos asignados al docente
    if (docenteId) {
      const docenteCursos = await prisma.docenteCurso.findMany({
        where: {
          id_docente: docenteId,
          activo: true
        },
        include: {
          curso: {
            include: includeCursoBase()
          }
        },
        orderBy: {
          curso: {
            codigo: 'asc'
          }
        }
      });

      // Extraer los cursos únicos
      let uniqueCursos = docenteCursos
        .map(dc => dc.curso)
        .filter((curso, index, self) => 
          self.findIndex(c => c.id_curso === curso.id_curso) === index
        );

      // Filtrar por ciclo si se proporciona
      if (cicloNumero !== null) {
        uniqueCursos = uniqueCursos.filter(c => c.ciclo === cicloNumero);
      }

      cursos = uniqueCursos.map(serializarCurso);
    } else {
      // Búsqueda normal sin filtro de docente
      cursos = await prisma.curso.findMany({
        include: includeCursoBase(),
        orderBy: { codigo: 'asc' }
      });

      // Filtrar por ciclo si se proporciona
      if (cicloNumero !== null) {
        cursos = cursos.filter(c => c.ciclo === cicloNumero);
      }

      // Si hay período, filtrar por ciclo según semestre
      if (periodoNumero !== null && cicloNumero === null) {
        const periodoData = await prisma.periodoAcademico.findUnique({
          where: { id_periodo: periodoNumero }
        });

        if (periodoData) {
          const codigoPeriodo = periodoData.codigo;
          
          // Determinar qué ciclos mostrar según el código del período
          if (codigoPeriodo.endsWith('-I')) {
            // Período I: ciclos impares (1, 3, 5, 7, 9)
            cursos = cursos.filter(c => c.ciclo && c.ciclo % 2 === 1);
          } else if (codigoPeriodo.endsWith('-II')) {
            // Período II: ciclos pares (2, 4, 6, 8, 10)
            cursos = cursos.filter(c => c.ciclo && c.ciclo % 2 === 0);
          }
          // Si es -EXT o cualquier otro, mostrar todos los cursos
        }
      }
    }

    return NextResponse.json({
      exito: true,
      datos: Array.isArray(cursos) ? cursos.map((curso: any) => ('prerequisito_ids' in curso ? curso : serializarCurso(curso))) : []
    });
  } catch (error: any) {
    console.error('Error obteniendo cursos:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    const codigo = normalizarTextoCurso(datos.codigo);
    const nombre = normalizarTextoCursoOracion(datos.nombre);
    const planEstudios = normalizarTextoCurso(datos.plan_estudios);
    const tipoCurso = normalizarTipoCurso(datos.tipo_curso);
    const departamentoCurso = await resolverDepartamentoCurso(datos.id_departamento);
    const prerequisitoIds = datos.prerequisito_ids !== undefined
      ? normalizarIdsCursos(datos.prerequisito_ids)
      : datos.prerequisito_id !== undefined && datos.prerequisito_id !== null && datos.prerequisito_id !== ''
        ? normalizarIdsCursos([datos.prerequisito_id])
        : [];

    // Validación de campos requeridos
    if (!codigo || !nombre || datos.creditos === undefined) {
      return NextResponse.json(
        { exito: false, mensaje: 'Faltan campos requeridos: codigo, nombre, creditos' },
        { status: 400 }
      );
    }

    if (!tipoCurso || !esTipoCursoValido(tipoCurso)) {
      return NextResponse.json(
        { exito: false, mensaje: 'El tipo de curso es obligatorio y debe corresponder al plan académico.' },
        { status: 400 }
      );
    }

    if (departamentoCurso && 'error' in departamentoCurso) {
      return NextResponse.json(
        { exito: false, mensaje: departamentoCurso.error },
        { status: 400 }
      );
    }

    if (!departamentoCurso) {
      return NextResponse.json(
        { exito: false, mensaje: 'El departamento académico del curso es obligatorio.' },
        { status: 400 }
      );
    }

    const creditos = parseEnteroSeguro(datos.creditos, Number.NaN);
    const horasTeoria = parseEnteroSeguro(datos.horas_teoria);
    const horasPractica = parseEnteroSeguro(datos.horas_practica);
    const horasLaboratorio = parseEnteroSeguro(datos.horas_laboratorio);
    const ciclo = datos.ciclo === null || datos.ciclo === '' || datos.ciclo === undefined
      ? null
      : parseEnteroSeguro(datos.ciclo, Number.NaN);

    if (!Number.isFinite(creditos) || creditos < 0) {
      return NextResponse.json(
        { exito: false, mensaje: 'Los créditos deben ser un número válido mayor o igual a cero.' },
        { status: 400 }
      );
    }

    if ([horasTeoria, horasPractica, horasLaboratorio].some((hora) => hora < 0)) {
      return NextResponse.json(
        { exito: false, mensaje: 'Las horas del curso no pueden ser negativas.' },
        { status: 400 }
      );
    }

    if (ciclo !== null && !Number.isFinite(ciclo)) {
      return NextResponse.json(
        { exito: false, mensaje: 'El ciclo debe ser un número válido.' },
        { status: 400 }
      );
    }

    const cursosPrerequisito = prerequisitoIds.length
      ? await prisma.curso.findMany({
          where: {
            id_curso: {
              in: prerequisitoIds
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
      prerequisitoIds,
      cursosDisponibles: cursosPrerequisito
    });

    if (!validacionPrerequisitos.valido) {
      return NextResponse.json(
        { exito: false, mensaje: validacionPrerequisitos.error },
        { status: 400 }
      );
    }

    // Verificar si ya existe un curso con ese código
    const cursoExistente = await prisma.curso.findUnique({
      where: { codigo }
    });

    if (cursoExistente) {
      return NextResponse.json(
        { exito: false, mensaje: `Ya existe un curso con el código "${codigo}"` },
        { status: 409 }
      );
    }

    const curso = await prisma.curso.create({
      data: {
        codigo,
        nombre,
        id_departamento: departamentoCurso.id_departamento,
        tipo_curso: tipoCurso,
        escuela_profesional: departamentoCurso.nombre,
        ciclo,
        horas_teoria: horasTeoria,
        horas_practica: horasPractica,
        horas_laboratorio: horasLaboratorio,
        creditos,
        plan_estudios: planEstudios || null,
        prerequisitos: construirTextoPrerequisitos(cursosPrerequisito),
        prerequisitos_relacion: prerequisitoIds.length
          ? {
              create: prerequisitoIds.map((id) => ({
                id_curso_prerequisito: id
              }))
            }
          : undefined,
        activo: datos.activo ?? true
      },
      include: includeCursoBase()
    });

    return NextResponse.json({
      exito: true,
      datos: serializarCurso(curso),
      mensaje: 'Curso creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando curso:', error);
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      // Unique constraint violation
      return NextResponse.json(
        { exito: false, mensaje: `El campo "${error.meta?.target?.[0] || 'codigo'}" ya existe` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { exito: false, mensaje: `Error al crear curso: ${error.message}` },
      { status: 500 }
    );
  }
}
