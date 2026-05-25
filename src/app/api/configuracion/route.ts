import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/configuracion/route.ts
export async function GET(request: NextRequest) {
  try {
    const config = await prisma.configuracionSistema.findFirst();
    
    if (!config) {
      // Crear configuración por defecto
      const nuevaConfig = await prisma.configuracionSistema.create({
        data: {
          bloques_horarios: 10,
          duracion_bloque: 90,
          hora_inicio: '07:00',
          hora_fin: '22:00',
          max_horas_docente: 40,
          min_horas_entre_clases: 0,
          permitir_clases_seguidas: true,
          validar_capacidad_ambiente: true
        }
      });
      return NextResponse.json({ exito: true, datos: nuevaConfig });
    }

    return NextResponse.json({ exito: true, datos: config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const datos = await request.json();
    
    const config = await prisma.configuracionSistema.findFirst();
    
    const actualizada = await prisma.configuracionSistema.update({
      where: { id_configuracion: config?.id_configuracion || 1 },
      data: datos
    });

    return NextResponse.json({ exito: true, datos: actualizada });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
