import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RequestBody {
  id_docente: number;
  id_grupo: number;
  accion?: 'asignar' | 'desasignar';
}

// GET: Obtener grupos disponibles para un docente (solo de cursos asignados)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_docente = searchParams.get('id_docente');

    if (!id_docente) {
      return NextResponse.json(
        { exito: false, error: 'id_docente es requerido' },
        { status: 400 }
      );
    }

    const docenteId = Number(id_docente);
    if (!Number.isInteger(docenteId) || docenteId <= 0) {
      return NextResponse.json(
        { exito: false, error: 'id_docente inválido' },
        { status: 400 }
      );
    }

    // Obtener todos los cursos asignados al docente
    const cursosAsignados = await prisma.docenteCurso.findMany({
      where: {
        id_docente: docenteId,
        activo: true
      },
      select: { id_curso: true }
    });

    const cursoIds = cursosAsignados.map(dc => dc.id_curso);

    if (cursoIds.length === 0) {
      return NextResponse.json({
        exito: true,
        datos: [],
        mensaje: 'El docente no tiene cursos asignados'
      });
    }

    // Obtener grupos de esos cursos
    const gruposDisponibles = await prisma.grupo.findMany({
      where: {
        id_curso: { in: cursoIds }
      },
      include: {
        curso: {
          select: {
            id_curso: true,
            codigo: true,
            nombre: true
          }
        }
      },
      orderBy: [
        { curso: { codigo: 'asc' } },
        { codigo_grupo: 'asc' }
      ]
    });

    // Obtener grupos ya asignados al docente
    const gruposAsignados = await prisma.docenteGrupo.findMany({
      where: {
        id_docente: docenteId,
        activo: true
      },
      select: { id_grupo: true }
    });

    const gruposAsignadosIds = new Set(gruposAsignados.map(dg => dg.id_grupo));

    // Marcar cuáles ya están asignados
    const gruposConEstado = gruposDisponibles.map(grupo => ({
      ...grupo,
      asignado: gruposAsignadosIds.has(grupo.id_grupo)
    }));

    return NextResponse.json({
      exito: true,
      datos: gruposConEstado
    });
  } catch (error) {
    console.error('Error al obtener grupos disponibles:', error);

    const err = error as any;
    const codigo = err?.code;
    const pgCode = err?.meta?.code;
    const faltaTabla =
      codigo === 'P2021' || pgCode === '42P01' || (codigo === 'P2010' && pgCode === '42P01');

    if (faltaTabla) {
      let diagnostico: { db?: string; schema?: string } | undefined;
      try {
        const info = await prisma.$queryRaw<Array<{ db: string; schema: string }>>`
          SELECT current_database() as db, current_schema() as schema
        `;
        diagnostico = info?.[0] ? { db: info[0].db, schema: info[0].schema } : undefined;
      } catch {
        diagnostico = undefined;
      }

      return NextResponse.json(
        {
          exito: false,
          codigo,
          diagnostico,
          error:
            'La base de datos a la que está conectada la app no tiene el esquema esperado. Si ya aplicaste migraciones, probablemente las aplicaste en otra BD (revisa DATABASE_URL en .env/.env.local).'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { exito: false, codigo, error: 'Error al obtener grupos disponibles' },
      { status: 500 }
    );
  }
}

// POST: Asignar grupo a docente
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { id_docente, id_grupo, accion = 'asignar' } = body;

    if (!id_docente || !id_grupo) {
      return NextResponse.json(
        { exito: false, error: 'id_docente e id_grupo son requeridos' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(id_docente) || id_docente <= 0) {
      return NextResponse.json(
        { exito: false, error: 'id_docente inválido' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(id_grupo) || id_grupo <= 0) {
      return NextResponse.json(
        { exito: false, error: 'id_grupo inválido' },
        { status: 400 }
      );
    }

    // Validar que el grupo pertenece a un curso asignado al docente
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo }
    });

    if (!grupo) {
      return NextResponse.json(
        { exito: false, error: 'Grupo no encontrado' },
        { status: 404 }
      );
    }

    const cursoAsignado = await prisma.docenteCurso.findFirst({
      where: {
        id_docente,
        id_curso: grupo.id_curso,
        activo: true
      }
    });

    if (!cursoAsignado) {
      return NextResponse.json(
        { exito: false, error: 'El docente no tiene este curso asignado' },
        { status: 403 }
      );
    }

    if (accion === 'desasignar') {
      // Desasignar (soft delete)
      await prisma.docenteGrupo.updateMany({
        where: {
          id_docente,
          id_grupo
        },
        data: { activo: false }
      });

      return NextResponse.json({
        exito: true,
        mensaje: `Grupo desasignado del docente`
      });
    }

    // Asignar (upsert)
    const docenteGrupo = await prisma.docenteGrupo.upsert({
      where: {
        id_docente_id_grupo: {
          id_docente,
          id_grupo
        }
      },
      update: {
        activo: true,
        fecha_asignacion: new Date()
      },
      create: {
        id_docente,
        id_grupo,
        activo: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: docenteGrupo,
      mensaje: 'Grupo asignado exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar grupo:', error);
    return NextResponse.json(
      { exito: false, error: 'Error al asignar grupo' },
      { status: 500 }
    );
  }
}

// DELETE: Desasignar grupo del docente
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_docente = searchParams.get('id_docente');
    const id_grupo = searchParams.get('id_grupo');

    if (!id_docente || !id_grupo) {
      return NextResponse.json(
        { exito: false, error: 'id_docente e id_grupo son requeridos' },
        { status: 400 }
      );
    }

    const docenteId = Number(id_docente);
    const grupoId = Number(id_grupo);

    if (!Number.isInteger(docenteId) || docenteId <= 0) {
      return NextResponse.json(
        { exito: false, error: 'id_docente inválido' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(grupoId) || grupoId <= 0) {
      return NextResponse.json(
        { exito: false, error: 'id_grupo inválido' },
        { status: 400 }
      );
    }

    await prisma.docenteGrupo.updateMany({
      where: {
        id_docente: docenteId,
        id_grupo: grupoId
      },
      data: { activo: false }
    });

    return NextResponse.json({
      exito: true,
      mensaje: 'Grupo desasignado exitosamente'
    });
  } catch (error) {
    console.error('Error al desasignar grupo:', error);
    return NextResponse.json(
      { exito: false, error: 'Error al desasignar grupo' },
      { status: 500 }
    );
  }
}
