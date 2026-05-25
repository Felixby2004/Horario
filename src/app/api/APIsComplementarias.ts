import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ImportadorCursos } from '@/services/importacion/ServiciosImportacion';

// /api/cursos/importar/route.ts
export async function POST_importarCursos(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get('archivo') as File;

    if (!archivo) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const resultado = await ImportadorCursos.importarDesdeExcel(buffer);

    return NextResponse.json({
      exito: true,
      exitosos: resultado.exitosos,
      errores: resultado.errores
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/buscar/route.ts
export async function GET_buscarCursos(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termino = searchParams.get('q') || '';

    const cursos = await prisma.curso.findMany({
      where: {
        OR: [
          { codigo_curso: { contains: termino, mode: 'insensitive' } },
          { nombre: { contains: termino, mode: 'insensitive' } }
        ],
        activo: true
      },
      take: 20
    });

    return NextResponse.json({ exito: true, datos: cursos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/[id]/grupos/route.ts
export async function GET_gruposCurso(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const grupos = await prisma.grupoCurso.findMany({
      where: { id_curso: parseInt(params.id) },
      include: {
        docente: true,
        horarios_asignados: {
          where: { estado: { in: ['confirmado', 'publicado'] } }
        }
      },
      orderBy: { numero_grupo: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: grupos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_crearGrupo(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datos = await request.json();

    const grupo = await prisma.grupoCurso.create({
      data: {
        id_curso: parseInt(params.id),
        numero_grupo: datos.numero_grupo,
        id_docente: datos.id_docente,
        max_estudiantes: datos.max_estudiantes || 30
      }
    });

    return NextResponse.json({ exito: true, datos: grupo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/[id]/ambientes/route.ts
export async function GET_ambientesCurso(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id_curso: parseInt(params.id) }
    });

    if (!curso) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    // Determinar tipo de ambiente requerido
    const tipoRequerido = curso.horas_laboratorio > 0 ? 'laboratorio' : 'aula';

    const ambientes = await prisma.ambiente.findMany({
      where: {
        tipo: tipoRequerido as any,
        activo: true
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: ambientes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/ambientes/por-tipo/route.ts
export async function GET_ambientesPorTipo(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    const ambientes = await prisma.ambiente.findMany({
      where: {
        ...(tipo && { tipo: tipo as any }),
        activo: true
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: ambientes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/ambientes/disponibilidad-general/route.ts
export async function GET_disponibilidadGeneral(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');
    const tipo = searchParams.get('tipo');

    const ambientes = await prisma.ambiente.findMany({
      where: {
        ...(tipo && { tipo: tipo as any }),
        activo: true
      }
    });

    const disponibilidad = await Promise.all(
      ambientes.map(async (ambiente) => {
        const ocupados = await prisma.horarioAsignado.count({
          where: {
            id_ambiente: ambiente.id_ambiente,
            id_periodo: idPeriodo,
            estado: { in: ['confirmado', 'publicado'] }
          }
        });

        const totalBloques = 50; // 10 bloques × 5 días
        const porcentaje = Math.round((ocupados / totalBloques) * 100);

        return {
          ...ambiente,
          bloques_ocupados: ocupados,
          total_bloques: totalBloques,
          porcentaje_ocupacion: porcentaje
        };
      })
    );

    return NextResponse.json({ exito: true, datos: disponibilidad });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export {
  POST_importarCursos,
  GET_buscarCursos,
  GET_gruposCurso,
  POST_crearGrupo,
  GET_ambientesCurso,
  GET_ambientesPorTipo,
  GET_disponibilidadGeneral
};
