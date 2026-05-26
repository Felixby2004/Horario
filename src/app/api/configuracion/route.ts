import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/configuracion/route.ts
export async function GET(request: NextRequest) {
  try {
    let config = await prisma.configuracionSistema.findFirst();
    
    if (!config) {
      // Crear configuración por defecto si no existe
      config = await prisma.configuracionSistema.create({
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
    }

    return NextResponse.json({ exito: true, datos: config });
  } catch (error: any) {
    console.error('[API Config GET]', error);
    return NextResponse.json({ 
      exito: false,
      error: error.message || 'Error al obtener configuración' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const datos = await request.json();
    
    // Obtener la configuración existente
    let config = await prisma.configuracionSistema.findFirst();
    
    if (!config) {
      // Crear si no existe
      config = await prisma.configuracionSistema.create({
        data: {
          bloques_horarios: datos.bloques_horarios || 10,
          duracion_bloque: datos.duracion_bloque || 90,
          hora_inicio: datos.hora_inicio || '07:00',
          hora_fin: datos.hora_fin || '22:00',
          max_horas_docente: datos.max_horas_docente || 40,
          min_horas_entre_clases: datos.min_horas_entre_clases || 0,
          permitir_clases_seguidas: datos.permitir_clases_seguidas !== false,
          validar_capacidad_ambiente: datos.validar_capacidad_ambiente !== false
        }
      });
    } else {
      // Actualizar
      config = await prisma.configuracionSistema.update({
        where: { id_configuracion: config.id_configuracion },
        data: {
          bloques_horarios: datos.bloques_horarios ?? config.bloques_horarios,
          duracion_bloque: datos.duracion_bloque ?? config.duracion_bloque,
          hora_inicio: datos.hora_inicio ?? config.hora_inicio,
          hora_fin: datos.hora_fin ?? config.hora_fin,
          max_horas_docente: datos.max_horas_docente ?? config.max_horas_docente,
          min_horas_entre_clases: datos.min_horas_entre_clases ?? config.min_horas_entre_clases,
          permitir_clases_seguidas: datos.permitir_clases_seguidas ?? config.permitir_clases_seguidas,
          validar_capacidad_ambiente: datos.validar_capacidad_ambiente ?? config.validar_capacidad_ambiente
        }
      });
    }

    return NextResponse.json({ 
      exito: true, 
      datos: config,
      mensaje: 'Configuración guardada exitosamente' 
    });
  } catch (error: any) {
    console.error('[API Config PUT]', error);
    return NextResponse.json({ 
      exito: false,
      error: error.message || 'Error al actualizar configuración' 
    }, { status: 500 });
  }
}
