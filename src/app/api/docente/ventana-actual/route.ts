import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerDocenteDelUsuario, verificarAutenticacion } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function normalizarValor(valor: unknown) {
  const s = String(valor ?? '').trim().toLowerCase();
  // Mapeos especiales para casos comunes de inconsistencia
  if (s.includes('jefe') && (s.includes('practica') || s.includes('práctica'))) return 'jefepractica';
  if (s.includes('nombrado') || s.includes('nombrada')) return 'nombrado';
  if (s.includes('contratado') || s.includes('contratada')) return 'contratado';
  if (s.includes('principal')) return 'principal';
  if (s.includes('asociado') || s.includes('asociada')) return 'asociado';
  if (s.includes('auxiliar')) return 'auxiliar';
  
  return s.replace(/[^a-z0-9]/g, ''); 
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
  // Usar split para evitar problemas de zona horaria al crear el objeto Date
  const [year, month, day] = fechaStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + dias);
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  
  return `${y}-${m}-${dayStr}`;
}

function obtenerEstadoVentana(ventana: any, ahora = new Date()) {
  const [horaInicio, minutoInicio] = String(ventana.hora_inicio).split(':').map(Number);
  const [horaFin, minutoFin] = String(ventana.hora_fin).split(':').map(Number);
  const { fecha: fechaLima, hora: ahoraLima } = obtenerFechaHoraLima(ahora);

  // Formatear la fecha de la ventana sin problemas de zona horaria
  // Aceptar tanto `fecha` (ventana general) como `fecha_citacion` (citaciones individuales)
  let fechaVentanaLima: string;
  const posibleFecha = (ventana && (ventana.fecha ?? ventana.fecha_citacion ?? ventana.fechaCita)) ?? null;
  if (posibleFecha instanceof Date) {
    // Las fechas de Prisma (@db.Date) vienen como Date objects en UTC midnight
    fechaVentanaLima = posibleFecha.toISOString().split('T')[0];
  } else {
    fechaVentanaLima = String(posibleFecha).split('T')[0];
  }

  const ahoraMinutos = Number(ahoraLima.slice(0, 2)) * 60 + Number(ahoraLima.slice(3, 5));
  const inicioMinutos = horaInicio * 60 + minutoInicio;
  const finMinutos = horaFin * 60 + minutoFin;

  // Si la fecha de la ventana es posterior al día actual (en Lima)
  if (fechaLima < fechaVentanaLima) return 'proxima';

  const fechaVentanaLimaMas1 = addDaysLima(fechaVentanaLima, 1);

  // Si la ventana ya pasó (más de 1 día de diferencia)
  if (fechaLima > fechaVentanaLima && fechaLima !== fechaVentanaLimaMas1) return 'cerrada';

  // Lógica para ventanas que no cruzan medianoche
  if (inicioMinutos <= finMinutos) {
    if (fechaLima === fechaVentanaLima) {
      if (ahoraMinutos < inicioMinutos) return 'proxima';
      if (ahoraMinutos > finMinutos) return 'cerrada';
      return 'activa';
    }
    // Si hoy es el día después de la ventana (y no cruza medianoche), ya cerró
    if (fechaLima === fechaVentanaLimaMas1) return 'cerrada';
    return 'cerrada';
  }

  // Lógica para ventanas que cruzan medianoche
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

function seleccionarVentanaMasRelevante(ventanas: any[], ahora = new Date()) {
  const evaluadas = ventanas
    .map((ventana) => ({ ventana, estado: obtenerEstadoVentana(ventana, ahora) }))
    .sort((a, b) => {
      // Ordenar por fecha y hora de inicio
      const fa = new Date(a.ventana.fecha);
      const fb = new Date(b.ventana.fecha);
      const [ha, ma] = String(a.ventana.hora_inicio).split(':').map(Number);
      const [hb, mb] = String(b.ventana.hora_inicio).split(':').map(Number);
      fa.setHours(ha, ma, 0, 0);
      fb.setHours(hb, mb, 0, 0);
      return fa.getTime() - fb.getTime();
    });

  const activa = evaluadas.find((x) => x.estado === 'activa');
  if (activa) return activa;

  const proxima = evaluadas.find((x) => x.estado === 'proxima');
  if (proxima) return proxima;

  const cerradas = evaluadas.filter((x) => x.estado === 'cerrada').reverse();
  if (cerradas[0]) return cerradas[0];

  return evaluadas[0] || null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_docente = searchParams.get('id_docente');

    if (!id_docente || id_docente === 'undefined' || id_docente === 'null') {
      return NextResponse.json({
        exito: false,
        mensaje: 'ID de docente no válido. Verifique que su perfil de docente esté vinculado a su cuenta de usuario.'
      }, { status: 400 });
    }

    const idDocenteNum = parseInt(id_docente);
    if (isNaN(idDocenteNum)) {
      return NextResponse.json({
        exito: false,
        mensaje: 'El ID de docente debe ser un número válido.'
      }, { status: 400 });
    }

    // Obtener datos del docente
    let docente = await prisma.docente.findUnique({
      where: { id_docente: idDocenteNum }
    });

    if (!docente) {
      try {
        const usuario = await verificarAutenticacion(request);
        docente = await obtenerDocenteDelUsuario(usuario);
      } catch {
        docente = null;
      }
    }

    if (!docente) {
      return NextResponse.json({
        exito: false,
        mensaje: 'Docente no encontrado'
      }, { status: 404 });
    }

    // Obtener período activo
    const { fecha: fechaLima } = obtenerFechaHoraLima();
    const hoyLima = new Date(`${fechaLima}T00:00:00.000Z`);

    // Intentamos buscar el periodo que coincida con hoy, o el último activo
    let periodoActivo = await prisma.periodoAcademico.findFirst({
      where: {
        activo: true,
        fecha_inicio: { lte: hoyLima },
        fecha_fin: { gte: hoyLima }
      },
      orderBy: { fecha_inicio: 'desc' }
    });

    if (!periodoActivo) {
      periodoActivo = await prisma.periodoAcademico.findFirst({
        where: { activo: true },
        orderBy: { fecha_inicio: 'desc' }
      });
    }

    if (!periodoActivo) {
      return NextResponse.json({
        exito: false,
        mensaje: 'No hay período académico activo configurado'
      }, { status: 404 });
    }

    // Buscar ventanas en un rango de +/- 15 días para ser más flexibles
    const desdeLima = new Date(`${addDaysLima(fechaLima, -15)}T00:00:00.000Z`);
    const hastaLima = new Date(`${addDaysLima(fechaLima, 15)}T00:00:00.000Z`);

    // 1. Buscar si el docente tiene una citación específica para este período
    const citacion = await prisma.citacionDocente.findFirst({
      where: {
        id_docente: idDocenteNum,
        id_periodo: periodoActivo.id_periodo,
        fecha_citacion: { gte: desdeLima, lte: hastaLima }
      },
      orderBy: [
        { fecha_citacion: 'asc' },
        { hora_inicio: 'asc' },
        { id_citacion: 'asc' }
      ],
      include: {
        ventana: true
      }
    });

    if (citacion) {
      const estado = obtenerEstadoVentana(citacion, new Date());
      return NextResponse.json({
        exito: true,
        datos: {
          ...citacion.ventana,
          id_citacion: citacion.id_citacion,
          fecha: citacion.fecha_citacion,
          hora_inicio: citacion.hora_inicio,
          hora_fin: citacion.hora_fin,
          numero_orden_turno: citacion.numero_orden_turno,
          estado: estado,
          es_citacion_individual: true,
          docente_info: {
            categoria: docente.categoria,
            modalidad: docente.modalidad
          }
        }
      });
    }

    // 2. Si no tiene citación, buscar ventanas generales (comportamiento anterior)
    const ventanas = await prisma.ventanaAtencion.findMany({
      where: {
        id_periodo: periodoActivo.id_periodo,
        activo: true,
        fecha: { gte: desdeLima, lte: hastaLima }
      },
      include: {
        periodo: true
      },
      orderBy: {
        fecha: 'asc'
      }
    });

    // Filtrar con normalización robusta
    const ventanasCoincidentes = ventanas.filter((item) => {
      const catMatch = normalizarValor(item.categoria) === normalizarValor(docente.categoria);
      const modMatch = normalizarValor(item.modalidad) === normalizarValor(docente.modalidad);
      return catMatch && modMatch;
    });

    const ventanaEval = seleccionarVentanaMasRelevante(ventanasCoincidentes);
    const ventana = ventanaEval?.ventana || null;

    if (!ventana) {
      // Para ayudar al usuario a depurar, devolvemos qué estamos buscando
      const msg = `No se encontró una ventana de atención ACTIVA para su perfil:
        - Categoría: ${docente.categoria}
        - Modalidad: ${docente.modalidad}
        - Periodo: ${periodoActivo.codigo}
        - Fecha actual (Lima): ${fechaLima}
        
        Asegúrese de que exista una ventana configurada para exactamente estos atributos y que el horario coincida con la hora actual en Lima.`;

      return NextResponse.json({
        exito: false,
        mensaje: msg,
        debug: {
          docente: {
            id: docente.id_docente,
            categoria: docente.categoria,
            modalidad: docente.modalidad,
            categoria_norm: normalizarValor(docente.categoria),
            modalidad_norm: normalizarValor(docente.modalidad)
          },
          periodo: periodoActivo.codigo,
          fecha_lima: fechaLima,
          ventanas_encontradas_periodo: ventanas.length,
          ventanas_coincidentes_atributos: ventanasCoincidentes.length
        }
      });
    }

    return NextResponse.json({
      exito: true,
      datos: {
        ...ventana,
        estado: ventanaEval.estado,
        docente_info: {
          categoria: docente.categoria,
          modalidad: docente.modalidad
        }
      }
    });
  } catch (error: any) {
    console.error('Error verificando ventana:', error);
    return NextResponse.json({
      exito: false,
      mensaje: error.message
    }, { status: 500 });
  }
}
