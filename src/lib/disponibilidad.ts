import { prisma } from '@/lib/prisma';
import { enviarNotificacionCitacion } from './notificaciones';

/**
 * Procesa los registros de disponibilidad y genera citaciones automáticamente
 * @param idFase ID de la fase de disponibilidad
 * @param idPeriodo ID del período académico
 * @param criterioOrdenamiento Criterio para ordenar docentes: 'antiguedad', 'categoria' o 'combinado'
 */
export async function procesarDisponibilidadYGenerarCitaciones(
  idFase: number,
  idPeriodo: number,
  criterioOrdenamiento: string = 'combinado',
  convocatoria?: { fecha: string; hora_inicio: string; intervalo_minutos?: number; cantidad?: number; modalidad?: string; categoria?: string },
  force: boolean = false
) {
  // Obtener la configuración de la fase para conocer el tamaño de los bloques
  const fase = await prisma.faseDisponibilidad.findUnique({
    where: { id_fase_disponibilidad: idFase },
    include: { periodo: true }
  });

  // Obtener todos los registros de disponibilidad completados
  const registrosDisponibilidad = await prisma.disponibilidadDocenteRegistro.findMany({
    where: {
      id_fase: idFase,
      completado: true
    },
    include: {
      docente: {
        select: {
          id_docente: true,
          codigo_docente: true,
          nombres: true,
          apellidos: true,
          antiguedad: true,
          categoria: true,
          modalidad: true
        }
      }
    }
  });

  if (registrosDisponibilidad.length === 0) {
    return {
      mensaje: 'No hay registros de disponibilidad completados',
      citacionesCreadas: 0
    };
  }

  // Ordenar docentes según criterio
  const docentesOrdenados = ordenarDocentes(registrosDisponibilidad, criterioOrdenamiento);

  // Contadores globales para citaciones y resultados (se usan en varios caminos)
  let citacionesCreadas = 0;
  const resultados: any[] = [];

  // Si viene una convocatoria explícita, crear una ventana y asignar slots secuenciales
  let ventanas: any[] = [];
  if (convocatoria) {
    const intervaloConv = convocatoria.intervalo_minutos || parseInt(fase?.bloques_tiempo || '30');
    const fechaBase = new Date(convocatoria.fecha + 'T00:00:00.000Z');

    // Si admin especificó modalidad y categoría, crear solo la ventana para esa combinación
    if (convocatoria.modalidad && convocatoria.categoria) {
      // filtrar docentes que coinciden con la modalidad/categoria
      const docentesFiltrados = docentesOrdenados.filter(r => {
        const mod = String(r.docente.modalidad).toLowerCase();
        const cat = String(r.docente.categoria).toLowerCase();
        return mod === String(convocatoria.modalidad).toLowerCase() && cat === String(convocatoria.categoria).toLowerCase();
      });

      const cantidad = docentesFiltrados.length;
      if (cantidad === 0) {
        return { mensaje: 'No hay docentes que coincidan con la modalidad/categoría seleccionada', citacionesCreadas: 0 };
      }

      // calcular hora_fin a partir de cantidad
      const [hInit, mInit] = convocatoria.hora_inicio.split(':').map(Number);
      const inicio = new Date(fechaBase);
      inicio.setHours(hInit, mInit, 0, 0);
      const totalMin = intervaloConv * cantidad;
      const fin = new Date(inicio.getTime() + totalMin * 60 * 1000);

      // comprobar orden: si no existen ventanas de mayor prioridad para la misma fecha/periodo, advertir
      const ordenCategoria = { principal: 4, asociado: 3, auxiliar: 2, jefe_practica: 1 } as Record<string, number>;
      const catSelOrder = ordenCategoria[String(convocatoria.categoria).toLowerCase()];
      if (catSelOrder) {
        const mayores = Object.entries(ordenCategoria).filter(([k, v]) => v > catSelOrder).map(([k]) => k);
        const ventanasExistentes = await prisma.ventanaAtencion.findMany({ where: { id_periodo: idPeriodo, fecha: fechaBase } });
        const existentesCategorias = ventanasExistentes.map(v => String(v.categoria));
        const faltantes = mayores.filter(mc => !existentesCategorias.includes(mc));
        if (faltantes.length > 0 && !force) {
          // Devolver un mensaje que frontend usará para preguntar confirmación
          return { advertenciaOrden: true, faltantes, mensaje: 'Faltan ventanas de mayor prioridad para esta fecha. Confirme para continuar.' } as any;
        }
      }

      // crear ventana específica
      const nuevaVentana = await prisma.ventanaAtencion.create({
        data: {
          id_periodo: idPeriodo,
          fecha: fechaBase,
          orden_prioridad: 1,
          modalidad: convocatoria.modalidad as any,
          categoria: convocatoria.categoria as any,
          hora_inicio: convocatoria.hora_inicio,
          hora_fin: `${String(fin.getHours()).padStart(2, '0')}:${String(fin.getMinutes()).padStart(2, '0')}`,
          intervalo_minutos: intervaloConv,
          activo: true,
          cantidad_docentes: cantidad
        }
      });

      ventanas = [nuevaVentana];

      // generar turnos y asignar citaciones sólo para docentesFiltrados
      const turnosDisponibles = generarTurnosVentana(nuevaVentana);
      let indiceturno = 0;
      for (const registroDisp of docentesFiltrados) {
        if (indiceturno >= turnosDisponibles.length) break;
        const turno = turnosDisponibles[indiceturno];
        try {
          const nuevaCitacion = await prisma.citacionDocente.create({
            data: {
              id_docente: registroDisp.id_docente,
              id_periodo: idPeriodo,
              id_ventana: nuevaVentana.id_ventana,
              fecha_citacion: nuevaVentana.fecha,
              hora_inicio: turno.hora_inicio,
              hora_fin: turno.hora_fin,
              numero_orden_turno: indiceturno + 1,
              estado: 'programada',
              observaciones: `Citación generada por convocatoria admin para ${convocatoria.modalidad}/${convocatoria.categoria}`
            }
          });
          try { await enviarNotificacionCitacion(registroDisp.id_docente, nuevaCitacion, fase?.periodo); } catch (e) { console.error(e); }
          citacionesCreadas++;
          indiceturno++;
          resultados.push({ docente: registroDisp.docente, ventana: nuevaVentana.id_ventana, turno: indiceturno, estado: 'asignado' });
        } catch (error: any) {
          console.error('Error creando citación en convocatoria específica:', error);
        }
      }

      return {
        mensaje: 'Convocatoria procesada para modalidad/categoría',
        citacionesCreadas,
        resultados
      } as any;
    }

    // Si no especifica modalidad/categoría, crear ventanas para todas las combinaciones y calcular cantidad automáticamente
    const modalidades = ['nombrado', 'contratado'];
    const categorias = ['principal', 'asociado', 'auxiliar', 'jefe_practica'];
    let orden = 1;
    const creadas: any[] = [];

    for (const mod of modalidades) {
      for (const cat of categorias) {
        // contar docentes que coinciden
        const docentesCoinciden = docentesOrdenados.filter(r => {
          const modr = String(r.docente.modalidad).toLowerCase();
          const catr = String(r.docente.categoria).toLowerCase();
          return modr === mod && catr === cat;
        });
        const cantidad = docentesCoinciden.length;
        if (cantidad === 0) { orden++; continue; }

        const [hInit, mInit] = convocatoria.hora_inicio.split(':').map(Number);
        const inicio = new Date(fechaBase);
        inicio.setHours(hInit, mInit, 0, 0);
        const totalMin = intervaloConv * cantidad;
        const fin = new Date(inicio.getTime() + totalMin * 60 * 1000);

        try {
          const v = await prisma.ventanaAtencion.create({
            data: {
              id_periodo: idPeriodo,
              fecha: fechaBase,
              orden_prioridad: orden,
              modalidad: mod as any,
              categoria: cat as any,
              hora_inicio: convocatoria.hora_inicio,
              hora_fin: `${String(fin.getHours()).padStart(2, '0')}:${String(fin.getMinutes()).padStart(2, '0')}`,
              intervalo_minutos: intervaloConv,
              activo: true,
              cantidad_docentes: cantidad
            }
          });
          creadas.push(v);

          // asignar citaciones para estos docentesCoinciden
          const turnos = generarTurnosVentana(v);
          let idxTurno = 0;
          for (const registroDisp of docentesCoinciden) {
            if (idxTurno >= turnos.length) break;
            try {
              const nuevaCitacion = await prisma.citacionDocente.create({
                data: {
                  id_docente: registroDisp.id_docente,
                  id_periodo: idPeriodo,
                  id_ventana: v.id_ventana,
                  fecha_citacion: v.fecha,
                  hora_inicio: turnos[idxTurno].hora_inicio,
                  hora_fin: turnos[idxTurno].hora_fin,
                  numero_orden_turno: idxTurno + 1,
                  estado: 'programada',
                  observaciones: `Citación generada por convocatoria admin para ${mod}/${cat}`
                }
              });
              try { await enviarNotificacionCitacion(registroDisp.id_docente, nuevaCitacion, fase?.periodo); } catch (e) { console.error(e); }
              citacionesCreadas++;
              resultados.push({ docente: registroDisp.docente, ventana: v.id_ventana, turno: idxTurno + 1, estado: 'asignado' });
            } catch (err) { console.error('Error asignando citación:', err); }
            idxTurno++;
          }

        } catch (e: any) {
          console.warn('No se pudo crear ventana para', mod, cat, e?.message || e);
        }

        orden++;
      }
    }

    ventanas = creadas;
  } else {
    // Obtener ventanas de atención para el período
    ventanas = await prisma.ventanaAtencion.findMany({
      where: { id_periodo: idPeriodo },
      include: { configuracion_turnos: true },
      orderBy: { orden_prioridad: 'asc' }
    });

    if (ventanas.length === 0) {
      return {
        mensaje: 'No hay ventanas de atención configuradas',
        citacionesCreadas: 0
      };
    }
  }

  // Generar citaciones basadas en disponibilidad y ventanas

  for (const ventana of ventanas) {
    const turnosDisponibles = generarTurnosVentana(ventana);
    let indiceturno = 0;

    // Si convocatoria presente, asignar secuencialmente según orden, sin chequear matriz
    if (convocatoria) {
      for (const registroDisp of docentesOrdenados) {
        if (indiceturno >= turnosDisponibles.length) break;

        // Evitar duplicados
        const citacionExistente = await prisma.citacionDocente.findFirst({
          where: { id_docente: registroDisp.id_docente, id_periodo: idPeriodo }
        });
        if (citacionExistente) continue;

        const turno = turnosDisponibles[indiceturno];
        try {
          const nuevaCitacion = await prisma.citacionDocente.create({
            data: {
              id_docente: registroDisp.id_docente,
              id_periodo: idPeriodo,
              id_ventana: ventana.id_ventana,
              fecha_citacion: ventana.fecha,
              hora_inicio: turno.hora_inicio,
              hora_fin: turno.hora_fin,
              numero_orden_turno: indiceturno + 1,
              estado: 'programada',
              observaciones: `Citación generada por convocatoria admin`
            }
          });

          try { await enviarNotificacionCitacion(registroDisp.id_docente, nuevaCitacion, fase?.periodo); } catch (e) { console.error(e); }

          citacionesCreadas++;
          indiceturno++;

          resultados.push({ docente: registroDisp.docente, ventana: ventana.id_ventana, turno: indiceturno, estado: 'asignado' });
        } catch (error: any) {
          console.error('Error creando citación en convocatoria:', error);
        }
      }
    } else {
      // Asignar docentes a turnos según su disponibilidad
      for (const registroDisp of docentesOrdenados) {
        if (indiceturno >= turnosDisponibles.length) {
          break; // Sin más turnos disponibles en esta ventana
        }

        const turno = turnosDisponibles[indiceturno];
        const matrizDisp = registroDisp.matriz_disponibilidad as any;

        // Verificar si el docente ya tiene citación para este periodo
        const citacionExistente = await prisma.citacionDocente.findFirst({
          where: {
            id_docente: registroDisp.id_docente,
            id_periodo: idPeriodo
          }
        });

        if (citacionExistente) continue;

        // Verificar si el docente está disponible en este turno
        if (estaDisponibleEnTurno(registroDisp.docente, matrizDisp, turno, ventana.fecha, parseInt(fase?.bloques_tiempo || '30'))) {
          try {
            const nuevaCitacion = await prisma.citacionDocente.create({
              data: {
                id_docente: registroDisp.id_docente,
                id_periodo: idPeriodo,
                id_ventana: ventana.id_ventana,
                fecha_citacion: ventana.fecha,
                hora_inicio: turno.hora_inicio,
                hora_fin: turno.hora_fin,
                numero_orden_turno: indiceturno + 1,
                estado: 'programada',
                observaciones: `Citación generada automáticamente basada en disponibilidad registrada`
              }
            });

            // Enviar notificación (opcionalmente asíncrono)
            try {
              await enviarNotificacionCitacion(registroDisp.id_docente, nuevaCitacion, fase?.periodo);
            } catch (notifError) {
              console.error(`Error enviando notificación al docente ${registroDisp.id_docente}:`, notifError);
            }

            citacionesCreadas++;
            indiceturno++;

            resultados.push({
              docente: registroDisp.docente,
              ventana: ventana.id_ventana,
              turno: indiceturno,
              estado: 'asignado'
            });
          } catch (error: any) {
            console.error('Error creando citación:', error);
          }
        }
      }
    }
  }

  return {
    mensaje: 'Disponibilidad procesada y citaciones generadas',
    citacionesCreadas,
    docentesProcesados: registrosDisponibilidad.length,
    resultados
  };
}

/**
 * Ordena docentes según criterio especificado
 */
function ordenarDocentes(registros: any[], criterio: string): any[] {
  const copia = [...registros];

  switch (criterio) {
    case 'antiguedad':
      // Mayor antigüedad primero
      return copia.sort((a, b) => {
        const antigA = a.docente.antiguedad || 0;
        const antigB = b.docente.antiguedad || 0;
        return antigB - antigA;
      });

    case 'categoria':
      // Orden: Principal > Asociado > Auxiliar > Jefe de Práctica
      const ordenCategoria = { principal: 4, asociado: 3, auxiliar: 2, jefe_practica: 1 };
      return copia.sort((a, b) => {
        const ordA = ordenCategoria[a.docente.categoria.toLowerCase() as keyof typeof ordenCategoria] || 0;
        const ordB = ordenCategoria[b.docente.categoria.toLowerCase() as keyof typeof ordenCategoria] || 0;
        return ordB - ordA;
      });

    case 'combinado':
    default:
      // Orden: Nombrado > Contratado
      // Luego por categoría: Principal > Asociado > Auxiliar > Jefe de Práctica
      // Finalmente por antigüedad: Mayor a menor
      const ordenMod = { nombrado: 2, contratado: 1 };
      const ordenCat = { principal: 4, asociado: 3, auxiliar: 2, jefe_practica: 1 };
      
      return copia.sort((a, b) => {
        // 1. Modalidad
        const modA = ordenMod[a.docente.modalidad.toLowerCase() as keyof typeof ordenMod] || 0;
        const modB = ordenMod[b.docente.modalidad.toLowerCase() as keyof typeof ordenMod] || 0;
        
        if (modA !== modB) return modB - modA;

        // 2. Categoría
        const catA = ordenCat[a.docente.categoria.toLowerCase() as keyof typeof ordenCat] || 0;
        const catB = ordenCat[b.docente.categoria.toLowerCase() as keyof typeof ordenCat] || 0;

        if (catA !== catB) return catB - catA;

        // 3. Antigüedad
        const antigA = a.docente.antiguedad || 0;
        const antigB = b.docente.antiguedad || 0;
        return antigB - antigA;
      });
  }
}

/**
 * Genera los turnos disponibles para una ventana de atención
 */
function generarTurnosVentana(ventana: any): Array<{ hora_inicio: string; hora_fin: string }> {
  const turnos = [];
  const [horaIni, minIni] = ventana.hora_inicio.split(':').map(Number);
  const [horaFin, minFin] = ventana.hora_fin.split(':').map(Number);

  const bloquesTiempo = ventana.intervalo_minutos || 15;

  let minutoActual = horaIni * 60 + minIni;
  const minutoFinal = horaFin * 60 + minFin;

  while (minutoActual + bloquesTiempo <= minutoFinal) {
    const horaInicio = Math.floor(minutoActual / 60);
    const minInicio = minutoActual % 60;

    const minutoProximo = minutoActual + bloquesTiempo;
    const horaProxima = Math.floor(minutoProximo / 60);
    const minProximo = minutoProximo % 60;

    turnos.push({
      hora_inicio: `${String(horaInicio).padStart(2, '0')}:${String(minInicio).padStart(2, '0')}`,
      hora_fin: `${String(horaProxima).padStart(2, '0')}:${String(minProximo).padStart(2, '0')}`
    });

    minutoActual = minutoProximo;
  }

  return turnos;
}

/**
 * Verifica si un docente está disponible en un turno específico
 */
function estaDisponibleEnTurno(
  docente: any,
  matrizDisp: any,
  turno: any,
  fechaVentana: Date,
  bloqueTiempoMinutos: number = 30
): boolean {
  // Obtener día de la semana (0 = domingo, 1 = lunes, etc.)
  const diaSemana = fechaVentana.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  const diasEspañol = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const dias = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Buscar correspondencia
  let diaIngles = dias[diasEspañol.indexOf(diaSemana)];
  if (!diaIngles) {
    // Intentar con la matriz como está
    diaIngles = diaSemana;
  }

  // Obtener disponibilidad del día
  const disponibilidadDia = matrizDisp[diaIngles] || matrizDisp[diaSemana] || [];

  if (!Array.isArray(disponibilidadDia) || disponibilidadDia.length === 0) {
    return false;
  }

  // Convertir hora del turno a índice de bloque
  const [horaMinuto] = turno.hora_inicio.split(':').map(Number);
  const minutosTotales = horaMinuto * 60 + (turno.hora_inicio.split(':')[1] ? parseInt(turno.hora_inicio.split(':')[1]) : 0);

  // Asumir bloques de tiempo especificados como estándar para la matriz
  const indiceBloque = Math.floor(minutosTotales / bloqueTiempoMinutos);

  return disponibilidadDia[indiceBloque] === true;
}

/**
 * Obtiene estadísticas de disponibilidad de un período
 */
export async function obtenerEstadisticasDisponibilidad(idFase: number) {
  const registros = await prisma.disponibilidadDocenteRegistro.findMany({
    where: { id_fase: idFase },
    include: {
      docente: {
        select: {
          id_docente: true,
          nombres: true,
          apellidos: true,
          categoria: true
        }
      }
    }
  });

  const total = registros.length;
  const completados = registros.filter(r => r.completado).length;
  const incompletos = total - completados;

  const porCategoria = registros.reduce((acc, r) => {
    const cat = r.docente.categoria;
    if (!acc[cat]) {
      acc[cat] = { total: 0, completados: 0 };
    }
    acc[cat].total++;
    if (r.completado) acc[cat].completados++;
    return acc;
  }, {} as Record<string, { total: number; completados: number }>);

  return {
    total,
    completados,
    incompletos,
    porcentajeCompletacion: total > 0 ? ((completados / total) * 100).toFixed(2) : 0,
    porCategoria
  };
}
