import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const periodos = await prisma.periodoAcademico.findMany({
      orderBy: { anio: 'desc' }
    });
    return NextResponse.json({ exito: true, datos: periodos });
  } catch (error: any) {
    console.error('Error en GET periodos:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    // Validar campos requeridos
    if (!datos.nombre || !datos.anio || datos.semestre === undefined || !datos.fecha_inicio || !datos.fecha_fin) {
      return NextResponse.json(
        { 
          exito: false, 
          mensaje: 'Faltan campos requeridos: nombre, anio, semestre, fecha_inicio, fecha_fin' 
        },
        { status: 400 }
      );
    }

    const periodo = await prisma.periodoAcademico.create({
      data: {
        nombre: datos.nombre,
        anio: parseInt(datos.anio),
        semestre: parseInt(datos.semestre),
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: new Date(datos.fecha_fin),
        codigo: `${datos.anio}-${datos.semestre === 1 ? 'I' : 'II'}`, // Generar código automático
        estado: 'planificacion'
      }
    });

    return NextResponse.json({
      exito: true,
      datos: periodo,
      mensaje: 'Período académico creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error en POST periodos:', error);
    return NextResponse.json(
      { 
        exito: false, 
        mensaje: error.message || 'Error al crear período académico' 
      },
      { status: 500 }
    );
  }
}

