import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/configuracion/restricciones/route.ts
export async function GET_restricciones(request: NextRequest) {
  try {
    const config = await prisma.configuracionGeneral.findFirst();
    
    return NextResponse.json({
      exito: true,
      datos: {
        horas_minimas_entre_clases: config?.horas_minimas_entre_clases || 0,
        max_horas_consecutivas: config?.max_horas_consecutivas || 4,
        max_horas_por_dia: config?.max_horas_por_dia || 8,
        max_horas_por_semana: config?.max_horas_por_semana || 24,
        permitir_aulas_superpuestas: config?.permitir_aulas_superpuestas || false,
        validar_capacidad_ambiente: config?.validar_capacidad_ambiente || true,
        requerir_laboratorio_para_practicas: config?.requerir_laboratorio_para_practicas || true
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT_restricciones(request: NextRequest) {
  try {
    const datos = await request.json();

    const config = await prisma.configuracionGeneral.upsert({
      where: { id_configuracion: 1 },
      update: datos,
      create: { id_configuracion: 1, ...datos }
    });

    return NextResponse.json({ exito: true, datos: config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/configuracion/dias-no-laborables/route.ts
export async function GET_diasNoLaborables(request: NextRequest) {
  try {
    const dias = await prisma.diaNoLaborable.findMany({
      orderBy: { fecha: 'asc' }
    });

    return NextResponse.json({ exito: true, datos: dias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_diasNoLaborables(request: NextRequest) {
  try {
    const datos = await request.json();

    const dia = await prisma.diaNoLaborable.create({
      data: {
        fecha: new Date(datos.fecha),
        descripcion: datos.descripcion,
        recurrente: datos.recurrente || false
      }
    });

    return NextResponse.json({ exito: true, datos: dia });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE_diaNoLaborable(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.diaNoLaborable.delete({
      where: { id_dia: parseInt(params.id) }
    });

    return NextResponse.json({ exito: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/auditoria/route.ts
export async function GET_auditoria(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario = searchParams.get('usuario');
    const accion = searchParams.get('accion');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    const registros = await prisma.registroAuditoria.findMany({
      where: {
        ...(usuario && { 
          usuario: { 
            codigo_docente: { contains: usuario, mode: 'insensitive' } 
          } 
        }),
        ...(accion && { accion }),
        ...(desde && { 
          fecha_hora: { gte: new Date(desde) } 
        }),
        ...(hasta && { 
          fecha_hora: { lte: new Date(hasta) } 
        })
      },
      include: {
        usuario: true
      },
      orderBy: { fecha_hora: 'desc' },
      take: 100
    });

    return NextResponse.json({ 
      exito: true, 
      datos: registros.map(r => ({
        fecha_hora: r.fecha_hora.toISOString(),
        usuario: r.usuario?.codigo_docente || 'Sistema',
        accion: r.accion,
        tabla: r.tabla_afectada,
        detalles: r.detalles
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/estadisticas/resumen-completo/route.ts
export async function GET_resumenCompleto(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const { EstadisticasAvanzadas } = await import('@/services/horarios/ServiciosEspecializadosExtra');
    const resumen = await EstadisticasAvanzadas.obtenerResumenCompleto(idPeriodo);

    return NextResponse.json({ exito: true, datos: resumen });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/horarios/generar-automatico/route.ts
export async function POST_generarAutomatico(request: NextRequest) {
  try {
    const { id_periodo, id_curso } = await request.json();

    const { GeneradorHorarios } = await import('@/services/horarios/ServiciosEspecializadosExtra');
    const sugerencias = await GeneradorHorarios.generarAutomaticamente(id_periodo, id_curso);

    return NextResponse.json({ exito: true, datos: sugerencias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/horarios/optimizar/route.ts
export async function POST_optimizar(request: NextRequest) {
  try {
    const { id_periodo } = await request.json();

    const { OptimizadorHorarios } = await import('@/services/horarios/ServiciosEspecializadosExtra');
    const sugerencias = await OptimizadorHorarios.optimizarDistribucion(id_periodo);

    return NextResponse.json({ exito: true, datos: sugerencias });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// /api/horarios/exportar-txt/route.ts
export async function GET_exportarTXT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = parseInt(searchParams.get('periodo') || '0');

    const { ExportadorHorarios } = await import('@/services/horarios/ServiciosEspecializadosExtra');
    const contenido = await ExportadorHorarios.exportarATXT(idPeriodo);

    return new NextResponse(contenido, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="horarios.txt"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export {
  GET_restricciones,
  PUT_restricciones,
  GET_diasNoLaborables,
  POST_diasNoLaborables,
  DELETE_diaNoLaborable,
  GET_auditoria,
  GET_resumenCompleto,
  POST_generarAutomatico,
  POST_optimizar,
  GET_exportarTXT
};
