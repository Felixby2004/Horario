import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API de Períodos
export async function GET_periodos() {
  try {
    const periodos = await prisma.periodoAcademico.findMany({
      orderBy: { fecha_inicio: 'desc' }
    });
    return NextResponse.json({ exito: true, datos: periodos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_periodos(request: NextRequest) {
  try {
    const datos = await request.json();
    
    const periodo = await prisma.periodoAcademico.create({
      data: {
        nombre: datos.nombre,
        codigo: datos.codigo,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: new Date(datos.fecha_fin),
        activo: datos.activo || false
      }
    });

    return NextResponse.json({ exito: true, datos: periodo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// API de Grupos
export async function GET_grupos(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idCurso = searchParams.get('curso');

  try {
    const grupos = await prisma.grupoCurso.findMany({
      where: idCurso ? { id_curso: parseInt(idCurso) } : {},
      include: {
        curso: true,
        docente: true
      },
      orderBy: { numero_grupo: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: grupos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_grupos(request: NextRequest) {
  try {
    const datos = await request.json();

    const grupo = await prisma.grupoCurso.create({
      data: {
        id_curso: datos.id_curso,
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
