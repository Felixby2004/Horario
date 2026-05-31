import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo');
    const ciclo = searchParams.get('ciclo');

    let cursos = await prisma.curso.findMany({
      orderBy: { codigo: 'asc' }
    });

    // Filtrar por ciclo si se proporciona
    if (ciclo) {
      cursos = cursos.filter(c => c.ciclo === parseInt(ciclo));
    }

    // Si hay período, filtrar por ciclo según semestre
    if (periodo && !ciclo) {
      const periodoData = await prisma.periodoAcademico.findUnique({
        where: { id_periodo: parseInt(periodo) }
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

    return NextResponse.json({
      exito: true,
      datos: cursos
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

    // Validación de campos requeridos
    if (!datos.codigo || !datos.nombre || datos.creditos === undefined) {
      return NextResponse.json(
        { exito: false, mensaje: 'Faltan campos requeridos: codigo, nombre, creditos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un curso con ese código
    const cursoExistente = await prisma.curso.findUnique({
      where: { codigo: datos.codigo }
    });

    if (cursoExistente) {
      return NextResponse.json(
        { exito: false, mensaje: `Ya existe un curso con el código "${datos.codigo}"` },
        { status: 409 }
      );
    }

    const curso = await prisma.curso.create({
      data: {
        codigo: datos.codigo.trim(),
        nombre: datos.nombre.trim(),
        ciclo: datos.ciclo || null,
        horas_teoria: parseInt(datos.horas_teoria) || 0,
        horas_practica: parseInt(datos.horas_practica) || 0,
        horas_laboratorio: parseInt(datos.horas_laboratorio) || 0,
        creditos: parseInt(datos.creditos),
        plan_estudios: datos.plan_estudios || null,
        activo: datos.activo ?? true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: curso,
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
