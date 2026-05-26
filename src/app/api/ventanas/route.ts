import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function normalizarValor(valor: unknown) {
  const s = String(valor ?? '').trim().toLowerCase();
  if (s.includes('jefe') && (s.includes('practica') || s.includes('práctica'))) return 'jefepractica';
  if (s.includes('nombrado') || s.includes('nombrada')) return 'nombrado';
  if (s.includes('contratado') || s.includes('contratada')) return 'contratado';
  if (s.includes('principal')) return 'principal';
  if (s.includes('asociado') || s.includes('asociada')) return 'asociado';
  if (s.includes('auxiliar')) return 'auxiliar';
  return s.replace(/[^a-z0-9]/g, ''); 
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = searchParams.get('id_periodo');

    const [ventanas, docentes] = await Promise.all([
      prisma.ventanaAtencion.findMany({
        where: idPeriodo ? { id_periodo: Number(idPeriodo) } : undefined,
        include: {
          periodo: true,
          citaciones: {
            include: {
              docente: {
                select: {
                  nombres: true,
                  apellidos: true
                }
              }
            },
            orderBy: {
              numero_orden_turno: 'asc'
            }
          }
        },
        orderBy: [{ id_periodo: 'desc' }, { orden_prioridad: 'asc' }]
      }),
      prisma.docente.findMany({ where: { activo: true } })
    ]);

    // Calcular el conteo potencial de docentes para cada ventana
    const ventanasConConteo = ventanas.map(v => {
      const vModNorm = normalizarValor(v.modalidad);
      const vCatNorm = normalizarValor(v.categoria);
      
      const docentesFiltrados = docentes.filter(d => 
        normalizarValor(d.modalidad) === vModNorm &&
        normalizarValor(d.categoria) === vCatNorm
      );

      const citacionesOrdenadas = Array.isArray(v.citaciones) ? [...v.citaciones].sort((a, b) => a.numero_orden_turno - b.numero_orden_turno) : [];
      const docentesDesdeCitacion = citacionesOrdenadas.length > 0
        ? citacionesOrdenadas.map((citacion: any) => {
            const nombreCompleto = `${citacion.docente?.nombres ?? ''} ${citacion.docente?.apellidos ?? ''}`.trim();
            return `${citacion.hora_inicio} - ${citacion.hora_fin}: ${nombreCompleto}`;
          }).join('\n')
        : '';

      return {
        ...v,
        cantidad_docentes: (v.cantidad_docentes && v.cantidad_docentes > 0) ? v.cantidad_docentes : docentesFiltrados.length,
        docentes_nombres: docentesDesdeCitacion || docentesFiltrados.map(d => `${d.nombres} ${d.apellidos}`).join(', ')
      };
    });

    return NextResponse.json({
      exito: true,
      datos: ventanasConConteo
    });
  } catch (error: any) {
    console.error('Error obteniendo ventanas:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    console.log('Datos recibidos para ventana:', datos);

    // Validar datos obligatorios
    if (!datos.id_periodo || !datos.categoria || !datos.modalidad) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Faltan datos obligatorios: período, categoría y modalidad'
      }, { status: 400 });
    }

    // Crear ventana (sin validación de existencia para permitir múltiples por fecha)
    const ventana = await prisma.ventanaAtencion.create({
      data: {
        id_periodo: parseInt(String(datos.id_periodo)),
        fecha: new Date(datos.fecha),
        orden_prioridad: parseInt(String(datos.orden_prioridad || 1)),
        modalidad: datos.modalidad,
        categoria: datos.categoria,
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin,
        intervalo_minutos: typeof datos.intervalo_minutos === 'number' ? datos.intervalo_minutos : parseInt(String(datos.intervalo_minutos ?? 15)),
        activo: datos.activo ?? true
      },
      include: {
        periodo: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: ventana,
      mensaje: 'Ventana creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando ventana:', error);
    return NextResponse.json({
      exito: false,
      mensaje: `Error: ${error.message}`
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idPeriodo = searchParams.get('id_periodo');

    if (!idPeriodo) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Se requiere el ID del período'
      }, { status: 400 });
    }

    const periodoId = Number(idPeriodo);

    // 1. Primero eliminamos las citaciones asociadas a las ventanas de este período
    // ya que dependen de las ventanas (Foreign Key constraint)
    await prisma.citacionDocente.deleteMany({
      where: { id_periodo: periodoId }
    });

    // 2. Desvinculamos las ventanas de los horarios asignados (ponemos null)
    await prisma.horarioAsignado.updateMany({
      where: { id_periodo: periodoId },
      data: { id_ventana: null }
    });

    // 3. Finalmente eliminamos las ventanas (ConfiguracionTurnosAtencion se borrará por Cascade)
    await prisma.ventanaAtencion.deleteMany({
      where: { id_periodo: periodoId }
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Ventanas y citaciones del período ${idPeriodo} eliminadas correctamente`
    });
  } catch (error: any) {
    console.error('Error eliminando ventanas:', error);
    return NextResponse.json(
      { exito: false, mensaje: `Error de integridad: ${error.message}. Asegúrese de que no existan registros dependientes.` },
      { status: 500 }
    );
  }
}
