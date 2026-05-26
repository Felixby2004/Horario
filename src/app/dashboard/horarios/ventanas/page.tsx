'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Calendar, Clock, Users, Trash2, Plus, RotateCcw, Save, Zap, Info, HelpCircle, List, ChevronDown, ChevronUp, GripVertical, CheckCircle2 } from 'lucide-react';

interface Turno {
  id: number;
  orden: number;
  categoria: string;
  tipo: string;
  desde: string;
  hasta: string;
  escalonado?: boolean;
  intervalo_minutos?: number;
  cantidad_docentes?: number;
  cantidad_atendidos?: number;
  docentes_nombres?: string;
}

interface Dia {
  id: number;
  fecha: string;
  turnos: Turno[];
}

interface FiltroVista {
  modalidad: string;
  categoria: string;
}

const CATEGORIAS = [
  { valor: 'principal', etiqueta: 'Principal' },
  { valor: 'asociado', etiqueta: 'Asociado' },
  { valor: 'auxiliar', etiqueta: 'Auxiliar' },
  { valor: 'jefe_practica', etiqueta: 'Jefe de práctica' }
];
const TIPOS = [
  { valor: 'nombrado', etiqueta: 'Nombrado' },
  { valor: 'contratado', etiqueta: 'Contratado' }
];

export default function VentanasPage() {
  const [dias, setDias] = useState<Dia[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [docentesGlobales, setDocentesGlobales] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [showConvModal, setShowConvModal] = useState(false);
  const [convFecha, setConvFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [convHora, setConvHora] = useState<string>('08:00');
  const [convIntervaloMinutos, setConvIntervaloMinutos] = useState<number>(15);
  const [convModalidad, setConvModalidad] = useState<string>('nombrado');
  const [convCategoria, setConvCategoria] = useState<string>('principal');
  const [convSubmitting, setConvSubmitting] = useState(false);
  const [filtroVista, setFiltroVista] = useState<FiltroVista | null>(null);

  useEffect(() => {
    cargarPeriodos();
    cargarDocentes();
  }, []);

  const normalizarValor = (valor: any) => {
    const s = String(valor ?? '').trim().toLowerCase();
    if (s.includes('jefe') && (s.includes('practica') || s.includes('práctica'))) return 'jefepractica';
    if (s.includes('nombrado') || s.includes('nombrada')) return 'nombrado';
    if (s.includes('contratado') || s.includes('contratada')) return 'contratado';
    if (s.includes('principal')) return 'principal';
    if (s.includes('asociado') || s.includes('asociada')) return 'asociado';
    if (s.includes('auxiliar')) return 'auxiliar';
    return s.replace(/[^a-z0-9]/g, '');
  };

  const obtenerAntiguedadDocente = (docente: any) => {
    if (docente?.fecha_ingreso) {
      const ingreso = new Date(docente.fecha_ingreso);
      if (!Number.isNaN(ingreso.getTime())) {
        const hoy = new Date();
        let antiguedad = hoy.getFullYear() - ingreso.getFullYear();
        const diferenciaMeses = hoy.getMonth() - ingreso.getMonth();

        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < ingreso.getDate())) {
          antiguedad--;
        }

        return Math.max(0, antiguedad);
      }
    }

    return Number(docente?.antiguedad ?? 0);
  };

  const obtenerDocentesFiltrados = (categoria: string, tipo: string, horaInicio: string, intervalo: number, esEscalonado: boolean) => {
    const catNorm = normalizarValor(categoria);
    const tipoNorm = normalizarValor(tipo);

    const filtrados = [...docentesGlobales]
      .filter(d => 
        normalizarValor(d.categoria) === catNorm && 
        normalizarValor(d.modalidad) === tipoNorm
      )
      .sort((a, b) => {
        const antigA = obtenerAntiguedadDocente(a);
        const antigB = obtenerAntiguedadDocente(b);

        if (antigA !== antigB) {
          return antigB - antigA;
        }

        const codigoA = String(a.codigo_docente ?? '');
        const codigoB = String(b.codigo_docente ?? '');
        return codigoA.localeCompare(codigoB);
      });

    if (!esEscalonado) {
      return {
        cantidad: filtrados.length,
        nombres: filtrados.map(d => `${d.nombres} ${d.apellidos}`).join(', '),
        minutosTotales: 0
      };
    }

    let currentMinutes = 0;
    if (horaInicio) {
      const [h, m] = horaInicio.split(':').map(Number);
      currentMinutes = h * 60 + m;
    }

    const docentesConHorario = filtrados.map((d, index) => {
      const start = currentMinutes + (index * intervalo);
      const end = start + intervalo;
      
      const format = (min: number) => {
        const h = Math.floor(min / 60).toString().padStart(2, '0');
        const m = (min % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      return `${format(start)} - ${format(end)}: ${d.nombres} ${d.apellidos}`;
    });

    return {
      cantidad: filtrados.length,
      nombres: docentesConHorario.join('\n'),
      minutosTotales: filtrados.length * intervalo
    };
  };

  const ordenarDiasPorFecha = (listaDias: Dia[]) => {
    return [...listaDias].sort((a, b) => a.fecha.localeCompare(b.fecha));
  };

  const cargarDocentes = async () => {
    try {
      const res = await fetch('/api/docentes?activo=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.exito) {
        setDocentesGlobales(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando docentes:', error);
    }
  };

  useEffect(() => {
    if (periodoSeleccionado !== null) {
      cargarVentanas(periodoSeleccionado);
    }
  }, [periodoSeleccionado, docentesGlobales]);

  const cargarPeriodos = async () => {
    try {
      const resPeriodos = await fetch('/api/periodos', { cache: 'no-store' });
      const dataPeriodos = await resPeriodos.json();

      if (dataPeriodos.exito) {
        const listaPeriodos = dataPeriodos.datos || [];
        setPeriodos(listaPeriodos);

        if (periodoSeleccionado === null && listaPeriodos.length > 0) {
          const periodoPorDefecto = listaPeriodos.find((p: any) => p.estado !== 'finalizado') || listaPeriodos[0];
          if (periodoPorDefecto) {
            setPeriodoSeleccionado(periodoPorDefecto.id_periodo);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarVentanas = async (idPeriodo: number) => {
    try {
      const resVentanas = await fetch(`/api/ventanas?id_periodo=${idPeriodo}`, { cache: 'no-store' });
      if (!resVentanas.ok) throw new Error('Error al cargar ventanas');
      const dataVentanas = await resVentanas.json();

      if (dataVentanas.exito && dataVentanas.datos.length > 0) {
        const ventanasPorFecha = dataVentanas.datos.reduce((acc: any, v: any) => {
          if (!acc[v.fecha]) {
            acc[v.fecha] = [];
          }
          acc[v.fecha].push(v);
          return acc;
        }, {});

        const diasCargados = Object.entries(ventanasPorFecha).map(([fecha, ventanas]: [string, any[]], idx) => ({
          id: idx + 1,
          fecha: fecha.split('T')[0],
          turnos: ventanas.sort((a, b) => a.orden_prioridad - b.orden_prioridad).map((v, i) => {
            const intMin = v.intervalo_minutos ?? 0;
            const isEscalonado = intMin > 0;
            const { cantidad, nombres } = obtenerDocentesFiltrados(v.categoria, v.modalidad, v.hora_inicio, isEscalonado ? intMin : 15, isEscalonado);
            
            const nombresFinales = v.docentes_nombres || nombres;

            return {
              id: v.id_ventana,
              orden: i + 1,
              categoria: v.categoria,
              tipo: v.modalidad,
              desde: v.hora_inicio,
              hasta: v.hora_fin,
              escalonado: isEscalonado,
              intervalo_minutos: isEscalonado ? intMin : 15,
              cantidad_docentes: v.cantidad_docentes || cantidad,
              cantidad_atendidos: v.cantidad_atendidos || 0,
              docentes_nombres: nombresFinales
            };
          })
        }));

        setDias(ordenarDiasPorFecha(diasCargados));
      } else {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 1);
        const fecha = hoy.toISOString().split('T')[0];
        
        // Crear un día inicial con un único turno por defecto
        const categoriaDefecto = 'principal';
        const tipoDefecto = 'nombrado';
        const { cantidad, nombres } = obtenerDocentesFiltrados(categoriaDefecto, tipoDefecto, '08:00', 15, false);

        setDias([{
          id: 1,
          fecha,
          turnos: [{
            id: Date.now(),
            orden: 1,
            categoria: categoriaDefecto,
            tipo: tipoDefecto,
            desde: '08:00',
            hasta: '09:30',
            escalonado: false,
            intervalo_minutos: 15,
            cantidad_docentes: cantidad,
            docentes_nombres: nombres
          }]
        }]);
      }
    } catch (error) {
      console.error('Error cargando ventanas:', error);
    }
  };

  const generarConvocatoria = () => {
    if (!periodoSeleccionado) {
      alert('⚠️ Seleccione un período académico');
      return;
    }
    setShowConvModal(true);
  };

  const submitConvocatoria = async (force = false) => {
    const convocatoria: any = { fecha: convFecha, hora_inicio: convHora, intervalo_minutos: convIntervaloMinutos, modalidad: convModalidad, categoria: convCategoria };
    setConvSubmitting(true);
    try {
      const res = await fetch('/api/ventanas/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPeriodo: periodoSeleccionado, convocatoria, force })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + (data.mensaje || 'Convocatoria generada'));
        setFiltroVista({ modalidad: convModalidad, categoria: convCategoria });
        setShowConvModal(false);
        await cargarVentanas(periodoSeleccionado!);
      } else if (data && data.advertenciaOrden) {
        const ok = confirm(`${data.mensaje}\nFaltantes: ${data.faltantes.join(', ')}\n¿Desea forzar la operación y continuar?`);
        if (ok) await submitConvocatoria(true);
      } else {
        alert('❌ ' + (data.error || data.mensaje || JSON.stringify(data)));
      }
    } catch (error) {
      alert('❌ Error al procesar la convocatoria');
    } finally {
      setConvSubmitting(false);
    }
  };

  const agregarDia = () => {
    const ultimoDia = dias[dias.length - 1];
    const nuevaFecha = new Date(ultimoDia.fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);

    setDias(ordenarDiasPorFecha([...dias, {
      id: Date.now(),
      fecha: nuevaFecha.toISOString().split('T')[0],
      turnos: []
    }]));
  };

  const agregarTurno = (diaId: number) => {
    setDias(ordenarDiasPorFecha(dias.map(dia => {
      if (dia.id === diaId) {
        const nuevoOrden = dia.turnos.length + 1;
        const ultimoTurno = dia.turnos[dia.turnos.length - 1];
        
        let desde = '08:00';
        let hasta = '09:30';
        
        if (ultimoTurno) {
          desde = ultimoTurno.hasta;
          const [h, m] = desde.split(':').map(Number);
          const nuevaHasta = new Date();
          nuevaHasta.setHours(h, m + 90);
          hasta = `${String(nuevaHasta.getHours()).padStart(2, '0')}:${String(nuevaHasta.getMinutes()).padStart(2, '0')}`;
        }

        const categoriaDefecto = 'principal';
        const tipoDefecto = 'nombrado';
        const isEscalonadoDefecto = false;
        const { cantidad, nombres } = obtenerDocentesFiltrados(categoriaDefecto, tipoDefecto, desde, 15, isEscalonadoDefecto);

        return {
          ...dia,
          turnos: [...dia.turnos, {
            id: Date.now(),
            orden: nuevoOrden,
            categoria: categoriaDefecto,
            tipo: tipoDefecto,
            desde,
            hasta,
            escalonado: isEscalonadoDefecto,
            intervalo_minutos: 15,
            cantidad_docentes: cantidad,
            docentes_nombres: nombres
          }]
        };
      }
      return dia;
    })));
  };

  const actualizarTurno = (diaId: number, turnoId: number, campo: string, valor: any) => {
    setDias(ordenarDiasPorFecha(dias.map(dia => {
      if (dia.id === diaId) {
        return {
          ...dia,
          turnos: dia.turnos.map(turno => {
            if (turno.id === turnoId) {
              const esEscalonadoActual = campo === 'escalonado' ? valor : (turno.escalonado || false);
              const intervaloActual = campo === 'intervalo_minutos' ? valor : (turno.intervalo_minutos || 15);
              
              const { cantidad, nombres, minutosTotales } = obtenerDocentesFiltrados(
                campo === 'categoria' ? valor : turno.categoria,
                campo === 'tipo' ? valor : turno.tipo,
                campo === 'desde' ? valor : turno.desde,
                intervaloActual,
                esEscalonadoActual
              );

              const nuevoTurno = { 
                ...turno, 
                [campo]: valor,
                cantidad_docentes: cantidad,
                docentes_nombres: nombres,
                escalonado: esEscalonadoActual,
                intervalo_minutos: intervaloActual
              };

              // Si es escalonado, auto-ajustamos la hora 'hasta'
              if (esEscalonadoActual && minutosTotales > 0) {
                const [h, m] = nuevoTurno.desde.split(':').map(Number);
                const totalMin = h * 60 + m + minutosTotales;
                const hFin = Math.floor(totalMin / 60).toString().padStart(2, '0');
                const mFin = (totalMin % 60).toString().padStart(2, '0');
                nuevoTurno.hasta = `${hFin}:${mFin}`;
              }
              
              return nuevoTurno;
            }
            return turno;
          })
        };
      }
      return dia;
    })));
  };

  const eliminarTurno = (diaId: number, turnoId: number) => {
    setDias(ordenarDiasPorFecha(dias.map(dia => {
      if (dia.id === diaId) {
        return {
          ...dia,
          turnos: dia.turnos.filter(t => t.id !== turnoId).map((t, idx) => ({ ...t, orden: idx + 1 }))
        };
      }
      return dia;
    })));
  };

  const actualizarFechaDia = (diaId: number, fecha: string) => {
    setDias(ordenarDiasPorFecha(dias.map(dia => {
      if (dia.id === diaId) {
        return { ...dia, fecha };
      }
      return dia;
    })));
  };

  const guardarConfiguracion = async () => {
    if (!periodoSeleccionado) {
      alert('⚠️ Por favor seleccione un período académico');
      return;
    }

    setGuardando(true);
    try {
      // Limpiar configuraciones previas del período usando el parámetro id_periodo
      const resDelete = await fetch(`/api/ventanas?id_periodo=${periodoSeleccionado}`, { method: 'DELETE' });
      if (!resDelete.ok) {
        const errorData = await resDelete.json();
        throw new Error(errorData.mensaje || 'Error al limpiar ventanas previas');
      }

      // Guardar todos los turnos visibles en la pantalla
      let ordenGlobal = 1;
      for (const dia of dias) {
        for (const turno of dia.turnos) {
          const res = await fetch('/api/ventanas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_periodo: periodoSeleccionado,
              fecha: dia.fecha,
              orden_prioridad: ordenGlobal,
              modalidad: turno.tipo,
              categoria: turno.categoria,
              hora_inicio: turno.desde,
              hora_fin: turno.hasta,
              intervalo_minutos: turno.escalonado ? (turno.intervalo_minutos || 15) : 0
            })
          });
          
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.mensaje || 'Error al guardar un turno');
          }
          ordenGlobal++;
        }
      }

      alert('✅ Configuración guardada exitosamente');
      
      // Tras guardar, recargar los datos del servidor
      await cargarPeriodos();
      if (periodoSeleccionado) {
        await cargarVentanas(periodoSeleccionado);
      }
      
    } catch (error: any) {
      console.error('Error detallado al guardar:', error);
      alert(`❌ Error al guardar: ${error.message || 'Error desconocido'}`);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50/50 min-h-screen">
      {showConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Generar Convocatoria Escalonada
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Solo se crearán citaciones para la combinación de modalidad y categoría que selecciones aquí.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Fecha inicio</label>
                <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={convFecha} onChange={(e) => setConvFecha(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Hora inicio</label>
                <input type="time" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={convHora} onChange={(e) => setConvHora(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Separación (min)</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={convIntervaloMinutos}
                  onChange={(e) => setConvIntervaloMinutos(parseInt(e.target.value || '15', 10))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Modalidad</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={convModalidad} onChange={(e) => setConvModalidad(e.target.value)}>
                  <option value="nombrado">Nombrado</option>
                  <option value="contratado">Contratado</option>
                </select>
              </div>
              <div className="col-span-full space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Categoría</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={convCategoria} onChange={(e) => setConvCategoria(e.target.value)}>
                  <option value="principal">Principal</option>
                  <option value="asociado">Asociado</option>
                  <option value="auxiliar">Auxiliar</option>
                  <option value="jefe_practica">Jefe de Práctica</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConvModal(false)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-all">Cancelar</button>
              <button onClick={() => submitConvocatoria(false)} disabled={convSubmitting} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 transition-all active:scale-95">{convSubmitting ? '⏳ Generando...' : 'Generar'}</button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Configurador de ventanas de atención
              </h1>
            </div>
            <p className="text-sm text-gray-500 max-w-4xl leading-relaxed font-medium">
              Configure los turnos horarios por categoría y tipo de docente. La convocatoria respeta el orden: <span className="font-bold text-indigo-600">Nombrado &gt; Contratado</span> y, dentro de cada tipo, <span className="font-bold text-indigo-600">Principal &gt; Asociado &gt; Auxiliar &gt; Jefe de Práctica</span> por antigüedad.
            </p>
          </div>

          <div className="p-8 bg-white flex flex-wrap justify-between items-center gap-6 border-b border-gray-50">
            <div className="flex flex-wrap items-center gap-8">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Período Académico</label>
                <select
                  className="min-w-[300px] border border-gray-200 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  value={periodoSeleccionado || ''}
                  onChange={(e) => setPeriodoSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Seleccione un período académico</option>
                  {periodos.map((p) => (
                    <option key={p.id_periodo} value={p.id_periodo}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {filtroVista && (
                <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-left-4">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                  </div>
                  <span className="text-sm text-indigo-700 font-black tracking-tight">
                    VISTA ACTIVA: {filtroVista.modalidad.toUpperCase()} / {filtroVista.categoria.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {periodoSeleccionado && (
              <button
                onClick={generarConvocatoria}
                disabled={procesando}
                className="group relative flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3.5 rounded-2xl text-sm font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 overflow-hidden"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>{procesando ? 'Procesando...' : 'Generar Convocatoria'}</span>
              </button>
            )}
          </div>

          <div className="p-6 space-y-6 bg-gray-50/30">
            {dias.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No hay ventanas configuradas para este período.</p>
              </div>
            ) : dias.map((dia) => (
              <div key={dia.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                        {dias.indexOf(dia) + 1}
                      </div>
                      <span className="font-black text-gray-800 uppercase tracking-tight text-sm">Día del Proceso</span>
                    </div>
                    <div className="h-6 w-px bg-gray-200" />
                    <input
                      type="date"
                      value={dia.fecha}
                      onChange={(e) => actualizarFechaDia(dia.id, e.target.value)}
                      className="border-0 bg-gray-50 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => agregarTurno(dia.id)}
                    className="flex items-center gap-2 bg-white hover:bg-green-50 text-green-600 px-4 py-2 rounded-lg text-xs font-black border border-green-200 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    AGREGAR TURNO
                  </button>
                </div>

                {dia.turnos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 w-12">#</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Categoría</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Tipo</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Modo</th>
                          <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Horario</th>
                          <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Docentes a citar</th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 w-20">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {dia.turnos.map((turno) => (
                          <tr key={turno.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-6">
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-xs font-black text-gray-500">
                                {turno.orden}
                              </span>
                            </td>
                            <td className="px-6 py-6">
                              <select
                                value={turno.categoria}
                                onChange={(e) => actualizarTurno(dia.id, turno.id, 'categoria', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                              >
                                {CATEGORIAS.map((c) => (
                                  <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-6">
                              <select
                                value={turno.tipo}
                                onChange={(e) => actualizarTurno(dia.id, turno.id, 'tipo', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                              >
                                {TIPOS.map((t) => (
                                  <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex flex-col gap-2">
                                <button 
                                  type="button"
                                  onClick={() => actualizarTurno(dia.id, turno.id, 'escalonado', !turno.escalonado)}
                                  className="flex items-center gap-2 group/toggle focus:outline-none"
                                >
                                  <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${turno.escalonado ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${turno.escalonado ? 'left-6' : 'left-1'}`} />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${turno.escalonado ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {turno.escalonado ? 'Escalonado ON' : 'Escalonado OFF'}
                                  </span>
                                </button>
                                {turno.escalonado && (
                                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                    <input 
                                      type="number"
                                      value={turno.intervalo_minutos || 15}
                                      onChange={(e) => actualizarTurno(dia.id, turno.id, 'intervalo_minutos', parseInt(e.target.value) || 15)}
                                      className="w-12 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                      min="5"
                                      step="5"
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">min</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={turno.desde}
                                  onChange={(e) => actualizarTurno(dia.id, turno.id, 'desde', e.target.value)}
                                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-600 bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                                <span className="text-gray-300">→</span>
                                <input
                                  type="time"
                                  value={turno.hasta}
                                  onChange={(e) => actualizarTurno(dia.id, turno.id, 'hasta', e.target.value)}
                                  disabled={turno.escalonado}
                                  className={`border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-600 bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none ${turno.escalonado ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-dashed' : ''}`}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex flex-col items-start">
                                <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2 self-center">
                                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                                  <span className="text-sm font-black text-indigo-600">{turno.cantidad_docentes || 0}</span>
                                </div>
                                {turno.docentes_nombres && (
                                  <div className="w-full max-w-[300px]">
                                    <div className="flex items-center justify-between mb-1 px-1">
                                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                        {turno.escalonado ? 'Slots Individuales' : 'Docentes en Bloque'}
                                      </span>
                                      {turno.escalonado && <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full">
                                      <div className="max-h-32 overflow-y-auto divide-y divide-gray-50">
                                        {turno.docentes_nombres.split('\n').map((line, idx) => (
                                          <div key={idx} className="px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                            {turno.escalonado ? (
                                              <>
                                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                                <span className="text-[10px] font-bold text-indigo-600 shrink-0">{line.split(': ')[0]}</span>
                                                <span className="text-[10px] text-gray-600 truncate font-medium">{line.split(': ')[1]}</span>
                                              </>
                                            ) : (
                                              <>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span className="text-[10px] text-gray-600 truncate font-medium">{line}</span>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => eliminarTurno(dia.id, turno.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                                title="Eliminar turno"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-gray-50/50">
                    <HelpCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No hay turnos para este día.</p>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <button
                onClick={agregarDia}
                className="flex items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 px-8 py-3 rounded-xl text-sm font-black border-2 border-dashed border-indigo-200 transition-all hover:border-indigo-400 active:scale-95 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                AGREGAR DÍA AL PROCESO
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
            <button
              onClick={() => {
                setFiltroVista(null);
                cargarPeriodos();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-10 py-2.5 rounded-lg text-sm font-black shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'GUARDAR CONFIGURACIÓN'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="font-black text-gray-800 uppercase tracking-tight">Guía de Referencia</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">Categorías:</strong> Principal, Asociado, Auxiliar, JP (Jefe de Práctica).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">Tipos:</strong> Nombrado, Contratado.
                </p>
              </div>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-700 leading-relaxed italic">
                <strong>Funcionamiento:</strong> Cada turno define qué categoría y tipo de docente puede ser citado en ese rango. Al generar la convocatoria, solo se crean citas para la combinación seleccionada en el modal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
