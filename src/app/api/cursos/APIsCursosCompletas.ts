import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/cursos/[id]/prerequisitos/route.ts
export async function GET_prerequisitos(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prerequisitos = await prisma.prerequisito.findMany({
      where: { id_curso: parseInt(params.id) },
      include: {
        curso_prerequisito: true
      }
    });

    return NextResponse.json({ 
      exito: true, 
      datos: prerequisitos.map(p => p.curso_prerequisito)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_prerequisito(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id_prerequisito } = await request.json();

    const prerequisito = await prisma.prerequisito.create({
      data: {
        id_curso: parseInt(params.id),
        id_prerequisito
      }
    });

    return NextResponse.json({ exito: true, datos: prerequisito });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE_prerequisito(
  request: NextRequest,
  { params }: { params: { id: string; idPre: string } }
) {
  try {
    await prisma.prerequisito.deleteMany({
      where: {
        id_curso: parseInt(params.id),
        id_prerequisito: parseInt(params.idPre)
      }
    });

    return NextResponse.json({ exito: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/plan-estudios/route.ts
export async function GET_planEstudios(request: NextRequest) {
  try {
    const cursos = await prisma.curso.findMany({
      where: { activo: true },
      orderBy: [
        { ciclo: 'asc' },
        { codigo_curso: 'asc' }
      ]
    });

    return NextResponse.json({ exito: true, datos: cursos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/estadisticas/route.ts
export async function GET_estadisticasCursos(request: NextRequest) {
  try {
    const total = await prisma.curso.count({
      where: { activo: true }
    });

    const porCiclo = await prisma.curso.groupBy({
      by: ['ciclo'],
      where: { activo: true },
      _count: true,
      orderBy: { ciclo: 'asc' }
    });

    const cursos = await prisma.curso.findMany({
      where: { activo: true }
    });

    const totalCreditos = cursos.reduce((sum, c) => sum + c.creditos, 0);
    const promedioCreditos = totalCreditos / total;

    return NextResponse.json({
      exito: true,
      datos: {
        total,
        porCiclo: porCiclo.map(p => ({
          ciclo: p.ciclo,
          cantidad: p._count
        })),
        totalCreditos,
        promedioCreditos
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/[id]/silabo/route.ts
export async function POST_subirSilabo(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const archivo = formData.get('archivo') as File;

    if (!archivo) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    // Guardar archivo (implementación depende del storage)
    const url = `/silabos/${params.id}_${archivo.name}`;

    await prisma.curso.update({
      where: { id_curso: parseInt(params.id) },
      data: {
        silabo_url: url,
        tiene_silabo: true
      }
    });

    return NextResponse.json({ exito: true, url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/[id]/competencias/route.ts
export async function GET_competencias(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competencias = await prisma.competencia.findMany({
      where: { id_curso: parseInt(params.id) }
    });

    return NextResponse.json({ exito: true, datos: competencias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_competencia(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datos = await request.json();

    const competencia = await prisma.competencia.create({
      data: {
        id_curso: parseInt(params.id),
        descripcion: datos.descripcion,
        tipo: datos.tipo
      }
    });

    return NextResponse.json({ exito: true, datos: competencia });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/duplicar/route.ts
export async function POST_duplicarCurso(request: NextRequest) {
  try {
    const { id_curso, nuevo_codigo } = await request.json();

    const cursoOriginal = await prisma.curso.findUnique({
      where: { id_curso },
      include: {
        grupos: true
      }
    });

    if (!cursoOriginal) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const { id_curso: _, ...datosCurso } = cursoOriginal;

    const nuevoCurso = await prisma.curso.create({
      data: {
        ...datosCurso,
        codigo_curso: nuevo_codigo,
        nombre: `${cursoOriginal.nombre} (Copia)`
      }
    });

    return NextResponse.json({ exito: true, datos: nuevoCurso });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/cursos/validar-codigo/route.ts
export async function GET_validarCodigo(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const existe = await prisma.curso.findFirst({
      where: { codigo_curso: codigo }
    });

    return NextResponse.json({ 
      exito: true, 
      disponible: !existe 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export {
  GET_prerequisitos,
  POST_prerequisito,
  DELETE_prerequisito,
  GET_planEstudios,
  GET_estadisticasCursos,
  POST_subirSilabo,
  GET_competencias,
  POST_competencia,
  POST_duplicarCurso,
  GET_validarCodigo
};
