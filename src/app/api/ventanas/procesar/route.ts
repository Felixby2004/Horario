import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

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

function obtenerPrioridadModalidad(valor: unknown) {
  const modalidad = normalizarValor(valor);
  if (modalidad === 'nombrado') return 2;
  if (modalidad === 'contratado') return 1;
  return 0;
}

function obtenerPrioridadCategoria(valor: unknown) {
  const categoria = normalizarValor(valor);
  if (categoria === 'principal') return 4;
  if (categoria === 'asociado') return 3;
  if (categoria === 'auxiliar') return 2;
  if (categoria === 'jefepractica') return 1;
  return 0;
}

function obtenerAntiguedad(docente: any) {
  return docente.fecha_ingreso ? utilidadesFecha.calcularAntiguedad(docente.fecha_ingreso) : (docente.antiguedad || 0);
}

function compararPrioridadDocentes(a: any, b: any) {
  const modA = obtenerPrioridadModalidad(a.modalidad);
  const modB = obtenerPrioridadModalidad(b.modalidad);
  if (modA !== modB) return modB - modA;

  const catA = obtenerPrioridadCategoria(a.categoria);
  const catB = obtenerPrioridadCategoria(b.categoria);
  if (catA !== catB) return catB - catA;

  const antigA = obtenerAntiguedad(a);
  const antigB = obtenerAntiguedad(b);
  if (antigA !== antigB) return antigB - antigA;

  return a.codigo_docente.localeCompare(b.codigo_docente);
}

const ORDEN_CONVOCATORIA = [
  { modalidad: 'nombrado', categoria: 'principal' },
  { modalidad: 'contratado', categoria: 'principal' },
  { modalidad: 'nombrado', categoria: 'asociado' },
  { modalidad: 'contratado', categoria: 'asociado' },
  { modalidad: 'nombrado', categoria: 'auxiliar' },
  { modalidad: 'contratado', categoria: 'auxiliar' },
  { modalidad: 'nombrado', categoria: 'jefe_practica' },
  { modalidad: 'contratado', categoria: 'jefe_practica' }
];

export async function POST(request: NextRequest) {
  try {
    const { idPeriodo, convocatoria } = await request.json();

    if (!idPeriodo) {
      return NextResponse.json(
        { exito: false, mensaje: 'Debe especificar el ID del período' },
        { status: 400 }
      );
    }

    const modalidadFiltro = normalizarValor(convocatoria?.modalidad);
    const categoriaFiltro = normalizarValor(convocatoria?.categoria);
    const intervaloMinutos = Number.parseInt(
      String(convocatoria?.intervalo_minutos ?? convocatoria?.intervaloMinutos ?? 15),
      10
    ) || 15;
    const aplicarFiltro = Boolean(convocatoria?.modalidad && convocatoria?.categoria);

    const ventanasExistentes = await prisma.ventanaAtencion.findMany({
      where: {
        id_periodo: idPeriodo,
        activo: true
      },
      orderBy: {
        orden_prioridad: 'asc'
      }
    });

    if (aplicarFiltro) {
      const indiceActual = ORDEN_CONVOCATORIA.findIndex(
        (item) =>
          normalizarValor(item.modalidad) === modalidadFiltro &&
          normalizarValor(item.categoria) === categoriaFiltro
      );

      if (indiceActual === -1) {
        return NextResponse.json(
          { exito: false, mensaje: 'La combinación seleccionada no es válida' },
          { status: 400 }
        );
      }

      const combosPrevios = ORDEN_CONVOCATORIA.slice(0, indiceActual);
      const combosExistentes = new Set(
        ventanasExistentes.map((ventana) => `${normalizarValor(ventana.modalidad)}/${normalizarValor(ventana.categoria)}`)
      );
      const combosFaltantes = combosPrevios.filter(
        (combo) => !combosExistentes.has(`${normalizarValor(combo.modalidad)}/${normalizarValor(combo.categoria)}`)
      );

      if (combosFaltantes.length > 0) {
        return NextResponse.json(
          {
            exito: false,
            mensaje: `Primero debes crear las combinaciones anteriores en orden: ${combosFaltantes.map((combo) => `${combo.modalidad} / ${combo.categoria}`).join(', ')}`,
            faltantes: combosFaltantes
          },
          { status: 409 }
        );
      }
    }

    const ventanasFiltradas = aplicarFiltro
      ? ventanasExistentes.filter((ventana) =>
          normalizarValor(ventana.modalidad) === modalidadFiltro &&
          normalizarValor(ventana.categoria) === categoriaFiltro
        )
      : ventanasExistentes;

    const docentes = await prisma.docente.findMany({
      where: { activo: true }
    });

    const docentesFiltrados = aplicarFiltro
      ? docentes.filter(
          (docente) =>
            normalizarValor(docente.modalidad) === modalidadFiltro &&
            normalizarValor(docente.categoria) === categoriaFiltro
        )
      : docentes;

    if (aplicarFiltro && docentesFiltrados.length === 0) {
      return NextResponse.json(
        {
          exito: false,
          mensaje: `No hay docentes activos para la combinación ${convocatoria.modalidad} / ${convocatoria.categoria}`
        },
        { status: 404 }
      );
    }

    const ventanasPrevias = aplicarFiltro ? ventanasFiltradas : ventanasExistentes;

    if (ventanasPrevias.length > 0) {
      await prisma.citacionDocente.deleteMany({
        where: { id_ventana: { in: ventanasPrevias.map((ventana) => ventana.id_ventana) } }
      });

      await prisma.ventanaAtencion.deleteMany({
        where: { id_ventana: { in: ventanasPrevias.map((ventana) => ventana.id_ventana) } }
      });
    }

    const fechaBase = new Date(`${convocatoria?.fecha || new Date().toISOString().split('T')[0]}T00:00:00.000Z`);
    const horaBase = String(convocatoria?.hora_inicio || '08:00');
    const [hBase, mBase] = horaBase.split(':').map(Number);
    const minutosBase = (hBase * 60) + mBase;

    const docentesOrdenados = (aplicarFiltro ? docentesFiltrados : docentes).sort(compararPrioridadDocentes);

    let totalCitaciones = 0;
    let ordenTurno = 1;

    for (const docente of docentesOrdenados) {
      const horaInicioActual = minutosBase + ((ordenTurno - 1) * intervaloMinutos);
      const horaFinActual = horaInicioActual + intervaloMinutos;

      const hInicio = Math.floor(horaInicioActual / 60);
      const mInicio = horaInicioActual % 60;
      const hFin = Math.floor(horaFinActual / 60);
      const mFin = horaFinActual % 60;

      const horaInicioStr = `${String(hInicio).padStart(2, '0')}:${String(mInicio).padStart(2, '0')}`;
      const horaFinStr = `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`;

      const ventanaCreada = await prisma.ventanaAtencion.create({
        data: {
          id_periodo: idPeriodo,
          fecha: fechaBase,
          orden_prioridad: ordenTurno,
          modalidad: docente.modalidad,
          categoria: docente.categoria,
          hora_inicio: horaInicioStr,
          hora_fin: horaFinStr,
          intervalo_minutos: intervaloMinutos,
          cantidad_docentes: 1,
          cantidad_atendidos: 0,
          completado: false,
          activo: true
        }
      });

      await prisma.citacionDocente.create({
        data: {
          id_docente: docente.id_docente,
          id_periodo: idPeriodo,
          id_ventana: ventanaCreada.id_ventana,
          fecha_citacion: fechaBase,
          hora_inicio: horaInicioStr,
          hora_fin: horaFinStr,
          numero_orden_turno: ordenTurno,
          estado: 'programada'
        }
      });

      totalCitaciones++;
      ordenTurno++;
    }

    return NextResponse.json({
      exito: true,
      mensaje: `Convocatoria escalonada generada exitosamente. ${totalCitaciones} citaciones y ventanas creadas${aplicarFiltro ? ` para ${convocatoria.modalidad} / ${convocatoria.categoria}` : ''}.`,
      total: totalCitaciones,
      ventanasCreadas: totalCitaciones,
      filtroAplicado: aplicarFiltro ? { modalidad: convocatoria.modalidad, categoria: convocatoria.categoria } : null
    });
  } catch (error: any) {
    console.error('Error procesando convocatoria:', error);
    return NextResponse.json(
      {
        exito: false,
        mensaje: `Error: ${error.message}`
      },
      { status: 500 }
    );
  }
}
