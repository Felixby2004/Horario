import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GestorVentanasAtencion } from '@/services/ventanas/GestorVentanasAtencion';

export const dynamic = 'force-dynamic';

function obtenerHorasRequeridas(curso: any, tipoClase: string) {
  if (tipoClase === 'teoria') return curso.horas_teoria || 0;
  if (tipoClase === 'laboratorio') return curso.horas_laboratorio || 0;
  if (tipoClase === 'practica') return curso.horas_practica || 0;
  return 0;
}

function normalizarValor(valor: unknown) {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, ''); // Solo caracteres alfanuméricos y guiones bajos
}

function obtenerFechaHoraLima(ahora = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  const partes = formatter.formatToParts(ahora).reduce((acc: Record<string, string>, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}:${partes.second}`
  };
}

function addDaysLima(fechaStr: string, dias: number) {
  const d = new Date(fechaStr + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .formatToParts(d)
    .reduce((acc: Record<string, string>, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
  return `${partes.year}-${partes.month}-${partes.day}`;
}

function obtenerEstadoVentana(ventana: any, ahora = new Date()) {
  const [horaInicio, minutoInicio] = String(ventana.hora_inicio).split(':').map(Number);
  const [horaFin, minutoFin] = String(ventana.hora_fin).split(':').map(Number);
  const { fecha: fechaLima, hora: ahoraLima } = obtenerFechaHoraLima(ahora);

  const fechaVentana = new Date(ventana.fecha);
  const fechaVentanaLima = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(fechaVentana);

  const ahoraMinutos = Number(ahoraLima.slice(0, 2)) * 60 + Number(ahoraLima.slice(3, 5));
  const inicioMinutos = horaInicio * 60 + minutoInicio;
  const finMinutos = horaFin * 60 + minutoFin;

  const fechaVentanaLimaMas1 = addDaysLima(fechaVentanaLima, 1);

  if (fechaLima < fechaVentanaLima) return 'proxima';
  if (fechaLima > fechaVentanaLima && fechaLima !== fechaVentanaLimaMas1) return 'cerrada';

  if (inicioMinutos <= finMinutos) {
    if (fechaLima === fechaVentanaLima || fechaLima === fechaVentanaLimaMas1) {
      if (ahoraMinutos < inicioMinutos) return 'proxima';
      if (ahoraMinutos > finMinutos) return 'cerrada';
      return 'activa';
    }
    return 'cerrada';
  }

  if (fechaLima === fechaVentanaLima) {
    if (ahoraMinutos >= inicioMinutos) return 'activa';
    return 'proxima';
  }

  if (fechaLima === fechaVentanaLimaMas1) {
    if (ahoraMinutos <= finMinutos) return 'activa';
    return 'cerrada';
  }

  return 'cerrada';
}

function seleccionarVentanaActiva(ventanas: any[], ahora = new Date()) {
  const activas = ventanas
    .map((ventana) => ({ ventana, estado: obtenerEstadoVentana(ventana, ahora) }))
    .filter((item) => item.estado === 'activa')
    .sort((a, b) => {
      const [ha, ma] = String(a.ventana.hora_inicio).split(':').map(Number);
      const [hb, mb] = String(b.ventana.hora_inicio).split(':').map(Number);
      const inicioA = new Date(a.ventana.fecha);
      inicioA.setHours(ha, ma, 0, 0);
      const inicioB = new Date(b.ventana.fecha);
      inicioB.setHours(hb, mb, 0, 0);
      return inicioB.getTime() - inicioA.getTime();
    });

  return activas[0]?.ventana || null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo');

    const where: any = {};
    if (periodo) where.id_periodo = parseInt(periodo);
    where.estado = { not: 'cancelado' };

    const horarios = await prisma.horarioAsignado.findMany({
      where,
      include: {
        docente: true,
        curso: true,
        grupo: {
          include: {
            curso: true
          }
        },
        ambiente: true
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    return NextResponse.json({
      exito: true,
      datos: horarios
    });
  } catch (error: any) {
    console.error('Error obteniendo horarios:', error);
    return NextResponse.json(
      { exito: false, mensaje: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();

    console.log('Datos recibidos:', datos);

    // Validaciones básicas
    if (!datos.id_periodo || !datos.id_docente || !datos.id_curso || 
        !datos.id_grupo || !datos.id_ambiente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Faltan datos obligatorios'
      }, { status: 400 });
    }

    // Obtener el ciclo del curso seleccionado
    const cursoSeleccionado = await prisma.curso.findUnique({
      where: { id_curso: datos.id_curso }
    });

    if (!cursoSeleccionado) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Curso no encontrado'
      }, { status: 400 });
    }

    const horasRequeridas = obtenerHorasRequeridas(cursoSeleccionado, datos.tipo_clase || 'teoria');
    if (horasRequeridas <= 0) {
      return NextResponse.json({
        exito: false,
        mensaje: 'El curso seleccionado no tiene horas disponibles para el tipo de clase indicado'
      }, { status: 400 });
    }

    const horasAsignadas = await prisma.horarioAsignado.count({
      where: {
        id_periodo: datos.id_periodo,
        id_curso: datos.id_curso,
        tipo_clase: datos.tipo_clase || 'teoria',
        estado: { not: 'cancelado' }
      }
    });

    if (horasAsignadas >= horasRequeridas) {
      return NextResponse.json({
        exito: false,
        mensaje: `Ya se completaron las ${horasRequeridas} horas requeridas para este curso`
      }, { status: 400 });
    }

    // VALIDACIÓN DE CONFLICTOS
    // Reglas:
    // 1. Un DOCENTE no puede estar en 2 lugares al mismo tiempo
    // 2. Un AMBIENTE no puede tener 2 clases simultáneas
    // 3. Un GRUPO no puede tener 2 clases al mismo tiempo
    // 4. TEORÍA: Solo 1 grupo por horario (toda la clase)
    // 5. LABORATORIO/PRÁCTICA: Máximo 2 grupos por horario (división)
    
    const conflictos = await prisma.horarioAsignado.findMany({
      where: {
        id_periodo: datos.id_periodo,
        dia_semana: datos.dia_semana,
        estado: { not: 'cancelado' },
        AND: [
          { hora_inicio: { lt: datos.hora_fin } },
          { hora_fin: { gt: datos.hora_inicio } }
        ]
      },
      include: {
        curso: true,
        grupo: {
          include: {
            curso: true
          }
        }
      }
    });

    // Verificar conflictos básicos (docente, ambiente, grupo)
    for (const conflicto of conflictos) {
      let mensaje = '';

      // Conflicto: Mismo docente (no puede estar en 2 lugares)
      if (conflicto.id_docente === datos.id_docente) {
        mensaje = `El docente ya tiene clase de ${conflicto.hora_inicio} a ${conflicto.hora_fin}`;
      } 
      // Conflicto: Mismo ambiente (no puede tener 2 clases simultáneas)
      else if (conflicto.id_ambiente === datos.id_ambiente) {
        mensaje = `El ambiente ya está ocupado de ${conflicto.hora_inicio} a ${conflicto.hora_fin}`;
      } 
      // Conflicto: Mismo grupo (no puede tener 2 clases al mismo tiempo)
      else if (conflicto.id_grupo === datos.id_grupo) {
        mensaje = `El grupo ya tiene clase de ${conflicto.hora_inicio} a ${conflicto.hora_fin}`;
      }

      if (mensaje) {
        return NextResponse.json({
          exito: false,
          mensaje
        }, { status: 400 });
      }
    }

    // VALIDACIÓN ESPECIAL POR TIPO DE CLASE Y CICLO
    const tipoClase = datos.tipo_clase || 'teoria';
    
    // Contar grupos del mismo ciclo en el mismo horario
    const gruposMismoCiclo = conflictos.filter(h => h.curso.ciclo === cursoSeleccionado.ciclo);

    if (gruposMismoCiclo.length > 0) {
  // REGLA 1: NO mezclar TEORÍA con LABORATORIO/PRÁCTICA
  const hayTeoria = gruposMismoCiclo.some(h => h.tipo_clase === 'teoria');
  const hayLabOPractica = gruposMismoCiclo.some(h => h.tipo_clase === 'laboratorio' || h.tipo_clase === 'practica');
  
  if (tipoClase === 'teoria' && hayLabOPractica) {
    return NextResponse.json({
      exito: false,
      mensaje: `No se puede crear TEORÍA donde ya existe LABORATORIO/PRÁCTICA. Los tipos de clase no se pueden mezclar.`
    }, { status: 400 });
  }
  
  if ((tipoClase === 'laboratorio' || tipoClase === 'practica') && hayTeoria) {
    return NextResponse.json({
      exito: false,
      mensaje: `No se puede crear LABORATORIO/PRÁCTICA donde ya existe TEORÍA. Los tipos de clase no se pueden mezclar.`
    }, { status: 400 });
  }
  
  // REGLA 2: TEORÍA - Solo 1 grupo permitido
  if (tipoClase === 'teoria') {
    if (hayTeoria) {
      return NextResponse.json({
        exito: false,
        mensaje: `Ya existe una clase de TEORÍA del Ciclo ${cursoSeleccionado.ciclo} en este horario. Las clases teóricas no se dividen.`
      }, { status: 400 });
    }
  } 
  // REGLA 3: LABORATORIO/PRÁCTICA - Máximo 2 grupos
  else if (tipoClase === 'laboratorio' || tipoClase === 'practica') {
    const gruposLabPractica = gruposMismoCiclo.filter(h => 
      h.tipo_clase === 'laboratorio' || h.tipo_clase === 'practica'
    );
    
    if (gruposLabPractica.length >= 2) {
      return NextResponse.json({
        exito: false,
        mensaje: `Ya existen 2 grupos de laboratorio/práctica del Ciclo ${cursoSeleccionado.ciclo} en este horario. Máximo permitido: 2 grupos.`
      }, { status: 400 });
    }
  }
}

    // --- Validación de Ventana de Atención y prioridad ---
    const docenteInfo = await prisma.docente.findUnique({ where: { id_docente: datos.id_docente } });
    if (!docenteInfo) {
      return NextResponse.json({ exito: false, mensaje: 'Docente no encontrado' }, { status: 404 });
    }

    // OMITIR validación si el estado es 'borrador', 'aprobado' o 'confirmado' (creado por admin)
    const esAdminAccion = ['borrador', 'aprobado', 'confirmado'].includes(datos.estado);

    if (!esAdminAccion) {
      // Si existe citación individual para el docente en este período,
      // se valida estrictamente contra su horario de citación.
      const citacionDocente = await prisma.citacionDocente.findFirst({
        where: {
          id_docente: datos.id_docente,
          id_periodo: datos.id_periodo,
          estado: { in: ['programada', 'confirmada_docente'] }
        },
        orderBy: [
          { fecha_citacion: 'asc' },
          { hora_inicio: 'asc' },
          { id_citacion: 'asc' }
        ]
      });

      if (citacionDocente) {
        const estadoCitacion = obtenerEstadoVentana({
          fecha: citacionDocente.fecha_citacion,
          hora_inicio: citacionDocente.hora_inicio,
          hora_fin: citacionDocente.hora_fin
        });

        if (estadoCitacion !== 'activa') {
          // Intentar alternativas antes de bloquear:
          // 1) Si existe una ventana general activa que cubre la hora solicitada, permitir
          // 2) Si la ventana tiene el flag admin `permitir_solicitud_completa`, permitir
          // 3) Si la fecha de la ventana coincide con el día de semana solicitado, permitir

          const { fecha: fechaHoyLima } = obtenerFechaHoraLima();
          const desdeLima = new Date(`${addDaysLima(fechaHoyLima, -1)}T00:00:00.000Z`);
          const hastaLima = new Date(`${addDaysLima(fechaHoyLima, 1)}T23:59:59.999Z`);

          const ventanasPeriodo = await prisma.ventanaAtencion.findMany({
            where: {
              id_periodo: datos.id_periodo,
              activo: true,
              fecha: { gte: desdeLima, lte: hastaLima }
            },
            orderBy: { fecha: 'desc' }
          });

          const modalidadDocente = normalizarValor(docenteInfo.modalidad);
          const categoriaDocente = normalizarValor(docenteInfo.categoria);

          const ventanasCoincidentes = ventanasPeriodo.filter((item) =>
            normalizarValor(item.modalidad) === modalidadDocente &&
            normalizarValor(item.categoria) === categoriaDocente
          );

          const ventanaActiva = seleccionarVentanaActiva(ventanasCoincidentes);

          let permitirPorVentana = false;

          if (ventanaActiva) {
            // comprobar flag admin (si no existe, será undefined -> false)
            if ((ventanaActiva as any).permitir_solicitud_completa === true) {
              permitirPorVentana = true;
            } else {
              // comprobar si la ventana cubre el horario solicitado
              const toMin = (t: string) => {
                const [hh, mm] = String(t).split(':').map(Number);
                return (hh || 0) * 60 + (mm || 0);
              };

              const inicioVent = toMin(ventanaActiva.hora_inicio);
              const finVent = toMin(ventanaActiva.hora_fin);
              const reqInicio = toMin(datos.hora_inicio);
              const reqFin = toMin(datos.hora_fin);

              const ventanaCubre = (inicioVent <= finVent)
                ? (reqInicio >= inicioVent && reqFin <= finVent)
                : // ventana cruza medianoche
                  (reqInicio >= inicioVent || reqFin <= finVent);

              if (ventanaCubre) permitirPorVentana = true;

              // comprobar coincidencia por día de semana: si la fecha de la ventana
              // en Lima corresponde al mismo `dia_semana` solicitado, también permitir
              if (!permitirPorVentana) {
                const formattedVentFecha = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ventanaActiva.fecha));
                const ventDay = new Date(`${formattedVentFecha}T00:00:00-05:00`).getDay();
                if (ventDay === Number(datos.dia_semana)) permitirPorVentana = true;
              }
            }
          }

          if (!permitirPorVentana) {
            return NextResponse.json({
              exito: false,
              mensaje: `Su solicitud está fuera de su citación asignada (${citacionDocente.hora_inicio} - ${citacionDocente.hora_fin}).`
            }, { status: 403 });
          }
        }
      }

      const { fecha: fechaHoyLima } = obtenerFechaHoraLima();
      const desdeLima = new Date(`${addDaysLima(fechaHoyLima, -1)}T00:00:00.000Z`);
      const hastaLima = new Date(`${addDaysLima(fechaHoyLima, 1)}T23:59:59.999Z`);

      const ventanasPeriodo = await prisma.ventanaAtencion.findMany({
        where: {
          id_periodo: datos.id_periodo,
          activo: true,
          fecha: { gte: desdeLima, lte: hastaLima }
        },
        orderBy: { fecha: 'desc' }
      });

      const modalidadDocente = normalizarValor(docenteInfo.modalidad);
      const categoriaDocente = normalizarValor(docenteInfo.categoria);

      const ventanasCoincidentes = ventanasPeriodo.filter((item) =>
        normalizarValor(item.modalidad) === modalidadDocente &&
        normalizarValor(item.categoria) === categoriaDocente
      );

      const ventana = seleccionarVentanaActiva(ventanasCoincidentes);

      if (!ventana) {
        return NextResponse.json({ exito: false, mensaje: 'No hay ventana de atención configurada para su categoría/modalidad o la ventana ya cerró/todavía no inicia' }, { status: 403 });
      }
    }

    // Crear horario
    const horario = await prisma.horarioAsignado.create({
      data: {
        id_docente: datos.id_docente,
        id_curso: datos.id_curso,
        id_grupo: datos.id_grupo,
        tipo_clase: datos.tipo_clase || 'teoria',
        id_ambiente: datos.id_ambiente,
        dia_semana: datos.dia_semana,
        hora_inicio: datos.hora_inicio,
        hora_fin: datos.hora_fin,
        id_periodo: datos.id_periodo,
        estado: datos.estado || 'borrador'
      },
      include: {
        docente: true,
        curso: true,
        grupo: true,
        ambiente: true
      }
    });

    return NextResponse.json({
      exito: true,
      datos: horario,
      mensaje: 'Horario asignado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creando horario:', error);
    return NextResponse.json({
      exito: false,
      mensaje: `Error al crear horario: ${error.message}`
    }, { status: 500 });
  }
}
