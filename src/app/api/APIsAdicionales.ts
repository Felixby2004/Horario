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
  const idPeriodo = searchParams.get('periodo');

  try {
    const where: any = {};

    if (idCurso) {
      where.id_curso = parseInt(idCurso);
    }

    if (idPeriodo) {
      where.id_periodo = parseInt(idPeriodo);
    }

    const grupos = await prisma.grupo.findMany({
      where,
      include: {
        curso: true,
        periodo: true
      },
      orderBy: { codigo_grupo: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: grupos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_grupos(request: NextRequest) {
  try {
    const datos = await request.json();

    if (!datos.id_curso || !datos.id_periodo || !datos.codigo_grupo) {
      return NextResponse.json(
        { error: 'id_curso, id_periodo y codigo_grupo son requeridos' },
        { status: 400 }
      );
    }

    const grupo = await prisma.grupo.create({
      data: {
        id_curso: datos.id_curso,
        id_periodo: datos.id_periodo,
        codigo_grupo: datos.codigo_grupo,
        capacidad_maxima: datos.capacidad_maxima || 40,
        cantidad_matriculados: datos.cantidad_matriculados ?? 0,
        observaciones: datos.observaciones,
        activo: datos.activo !== false
      }
    });

    return NextResponse.json({ exito: true, datos: grupo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
