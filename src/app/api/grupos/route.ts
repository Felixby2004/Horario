import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curso = searchParams.get('curso');
    const periodo = searchParams.get('periodo');
    const id_docente = searchParams.get('id_docente');

    const where: any = {};
    if (curso) where.id_curso = parseInt(curso);
    if (periodo) where.id_periodo = parseInt(periodo);

    // If both id_docente AND curso are provided, strictly filter groups assigned to this docente for this curso
    if (id_docente && curso) {
      const docenteId = parseInt(id_docente);
      const cursoId = parseInt(curso);
      
      // First verify docente actually has this curso assigned
      const hasCurso = await prisma.docenteCurso.findFirst({
        where: {
          id_docente: docenteId,
          id_curso: cursoId,
          activo: true
        }
      });
      
      if (hasCurso) {
        // Now get groups for this curso and docente: either directly via DocenteGrupo, or just groups of this curso (since docente has curso assigned)
        const docenteGrupos = await prisma.docenteGrupo.findMany({
          where: {
            id_docente: docenteId,
            activo: true
          },
          include: { grupo: true }
        });
        
        // Now filter docenteGrupos to only those where grupo.id_curso matches cursoId
        const validDocenteGrupoIds = docenteGrupos
          .filter(dg => dg.grupo && dg.grupo.id_curso === cursoId)
          .map(dg => dg.id_grupo);
        
        if (validDocenteGrupoIds.length > 0) {
          where.id_grupo = { in: validDocenteGrupoIds };
        }
        // Else: docente has curso assigned (via DocenteCurso) but no direct DocenteGrupo → use existing where (curso and periodo)
      } else {
        // If docente doesn't have this curso assigned, return empty array
        return NextResponse.json({
          exito: true,
          datos: []
        });
      }
    } 
    // If only id_docente (no curso) is provided, get all groups assigned to docente
    else if (id_docente) {
      const docenteId = parseInt(id_docente);
      
      const docenteGrupos = await prisma.docenteGrupo.findMany({
        where: {
          id_docente: docenteId,
          activo: true
        },
        select: { id_grupo: true }
      });
      
      const docenteGrupoIds = docenteGrupos.map(dg => dg.id_grupo);
      
      if (docenteGrupoIds.length > 0) {
        where.id_grupo = { in: docenteGrupoIds };
      } else {
        // If no direct DocenteGrupo, fall back to groups from assigned courses
        const docenteCursos = await prisma.docenteCurso.findMany({
          where: { id_docente: docenteId, activo: true },
          select: { id_curso: true }
        });
        const cursoIds = docenteCursos.map(dc => dc.id_curso);
        
        if (cursoIds.length > 0) {
          where.id_curso = { in: cursoIds };
        }
      }
    }

    const grupos = await prisma.grupo.findMany({
      where,
      include: {
        curso: true,
        periodo: true
      },
      orderBy: {
        codigo_grupo: 'asc'
      }
    });

    return NextResponse.json({
      exito: true,
      datos: grupos
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    const grupo = await prisma.grupo.create({
      data: {
        id_curso: datos.id_curso,
        id_periodo: datos.id_periodo,
        codigo_grupo: datos.codigo_grupo,
        capacidad_maxima: datos.capacidad_maxima || 40,
        activo: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: grupo
    });
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}
