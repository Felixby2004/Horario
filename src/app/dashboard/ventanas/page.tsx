'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

interface Turno {
  id: number;
  orden: number;
  categoria: string;
  tipo: string;
  desde: string;
  hasta: string;
  minutos_turno: number;
}

interface Dia {
  id: number;
  fecha: string;
  turnos: Turno[];
}

interface FaseDisponibilidad {
  id_fase_disponibilidad?: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  bloques_tiempo: string;
  instrucciones: string;
}

const CATEGORIAS = ['Principal', 'Asociado', 'Auxiliar', 'Jefe de Práctica'];
const TIPOS = ['Nombrado', 'Contratado'];
const CRITERIOS = [
  { id: 'combinado', label: 'Categoría + Antigüedad (Recomendado)' },
  { id: 'antiguedad', label: 'Solo Antigüedad' },
  { id: 'categoria', label: 'Solo Categoría' }
];

export default function VentanasPage() {
  const [dias, setDias] = useState<Dia[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Estado para la Fase de Disponibilidad
  const [fase, setFase] = useState<FaseDisponibilidad>({
    estado: 'no_iniciada',
    fecha_inicio: new Date().toISOString().split('T')[0] + 'T08:00',
    fecha_fin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T18:00',
    bloques_tiempo: '30',
    instrucciones: ''
  });
  const [procesando, setProcesando] = useState(false);
  const [criterioOrden, setCriterioOrden] = useState('combinado');
  const [showConvModal, setShowConvModal] = useState(false);
  const [convFecha, setConvFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [convHora, setConvHora] = useState<string>('08:00');
  const [convModalidad, setConvModalidad] = useState<string>('nombrado');
  const [convCategoria, setConvCategoria] = useState<string>('principal');
  const [convSubmitting, setConvSubmitting] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar fase cuando cambia el período
  useEffect(() => {
    if (periodoSeleccionado) {
      cargarFase(periodoSeleccionado);
    }
  }, [periodoSeleccionado]);

  const cargarFase = async (idPeriodo: number) => {
    try {
      const res = await fetch(`/api/disponibilidad/fase?idPeriodo=${idPeriodo}`);
      if (res.ok) {
        const data = await res.json();
        setFase({
          id_fase_disponibilidad: data.id_fase_disponibilidad,
          estado: data.estado,
          fecha_inicio: new Date(data.fecha_inicio).toISOString().slice(0, 16),
          fecha_fin: new Date(data.fecha_fin).toISOString().slice(0, 16),
          bloques_tiempo: data.bloques_tiempo,
          instrucciones: data.instrucciones || ''
        });
      } else {
        setFase({
          estado: 'no_iniciada',
          fecha_inicio: new Date().toISOString().slice(0, 16),
          fecha_fin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          bloques_tiempo: '30',
          instrucciones: ''
        });
      }
    } catch (error) {
      console.error('Error cargando fase:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      const [resPeriodos, resVentanas] = await Promise.all([
        fetch('/api/periodos'),
        fetch('/api/ventanas')
      ]);

      const dataPeriodos = await resPeriodos.json();
      const dataVentanas = await resVentanas.json();

      if (dataPeriodos.exito) {
        setPeriodos(dataPeriodos.datos || []);
        const activo = dataPeriodos.datos?.find((p: any) => p.activo);
        if (activo) setPeriodoSeleccionado(activo.id_periodo);
      }

      if (dataVentanas.exito) {
        const datos = dataVentanas.datos;
        let ventanasPorFecha: Record<string, any[]> = {};

        if (Array.isArray(datos) && datos.length > 0) {
          ventanasPorFecha = datos.reduce((acc: any, v: any) => {
            if (!acc[v.fecha]) acc[v.fecha] = [];
            acc[v.fecha].push(v);
            return acc;
          }, {});
        } else if (datos && typeof datos === 'object') {
          // Si el backend ya devuelve un map { fecha: [...ventanas] }
          for (const [k, val] of Object.entries(datos)) {
            ventanasPorFecha[k] = Array.isArray(val) ? val as any[] : [val as any];
          }
        }

        if (Object.keys(ventanasPorFecha).length > 0) {
          const diasCargados: Dia[] = (Object.entries(ventanasPorFecha) as [string, any[]][]).map(([fecha, ventanas], idx) => ({
            id: idx + 1,
            fecha: new Date(fecha).toISOString().split('T')[0],
            turnos: (ventanas || []).sort((a: any, b: any) => a.orden_prioridad - b.orden_prioridad).map((v: any, i: number) => ({
              id: v.id_ventana,
              orden: v.orden_prioridad,
              categoria: v.categoria,
              tipo: v.modalidad,
              desde: v.hora_inicio,
              hasta: v.hora_fin,
              minutos_turno: v.intervalo_minutos || 15
            }))
          }));

          setDias(diasCargados);
        } else {
          const hoy = new Date();
          hoy.setDate(hoy.getDate() + 1);
          setDias([{
            id: 1,
            fecha: hoy.toISOString().split('T')[0],
            turnos: []
          }]);
        }
      } else {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 1);
        setDias([{
          id: 1,
          fecha: hoy.toISOString().split('T')[0],
          turnos: []
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarFase = async () => {
    if (!periodoSeleccionado) return;
    
    setGuardando(true);
    try {
      const method = fase.id_fase_disponibilidad ? 'PUT' : 'POST';
      const body = {
        ...fase,
        idPeriodo: periodoSeleccionado,
        idFase: fase.id_fase_disponibilidad
      };

      const res = await fetch('/api/disponibilidad/fase', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert('✅ Fase de disponibilidad guardada');
        cargarFase(periodoSeleccionado);
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  const handleProcesarDisponibilidad = () => {
    if (!fase.id_fase_disponibilidad) {
      alert('⚠️ Primero debe guardar la fase de disponibilidad');
      return;
    }

    if (fase.estado !== 'cerrada') {
      alert('⚠️ La fase debe estar CERRADA para poder procesar las citaciones');
      return;
    }

    // Abrir modal para recoger convocatoria
    setShowConvModal(true);
  };

  const submitConvocatoria = async (force = false) => {
    const convocatoria: any = {
      fecha: convFecha,
      hora_inicio: convHora,
      intervalo_minutos: parseInt(fase.bloques_tiempo || '30')
    };
    // incluir modalidad/categoria si fueron seleccionadas
    if (convModalidad) convocatoria.modalidad = convModalidad;
    if (convCategoria) convocatoria.categoria = convCategoria;

    setConvSubmitting(true);
    try {
      const res = await fetch('/api/disponibilidad/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idFase: fase.id_fase_disponibilidad,
          criterioOrdenamiento: criterioOrden,
          convocatoria,
          force
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Procesamiento completado. Se generaron ${data.citacionesCreadas || 0} citaciones.`);
        setShowConvModal(false);
        cargarFase(periodoSeleccionado!);
      } else if (data && data.advertenciaOrden) {
        const ok = confirm(`${data.mensaje}\nFaltantes: ${data.faltantes.join(', ')}\n¿Desea forzar la operación y continuar?`);
        if (ok) {
          await submitConvocatoria(true);
        } else {
          // keep modal open for adjustments
        }
      } else {
        alert(`❌ Error: ${data.error || data.mensaje || JSON.stringify(data)}`);
      }
    } catch (error) {
      alert('❌ Error al procesar');
    } finally {
      setConvSubmitting(false);
    }
  };

  const agregarDia = () => {
    const ultimoDia = dias[dias.length - 1];
    const nuevaFecha = new Date(ultimoDia.fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);

    setDias([...dias, {
      id: Date.now(),
      fecha: nuevaFecha.toISOString().split('T')[0],
      turnos: []
    }]);
  };

  const agregarTurno = (diaId: number) => {
    setDias(dias.map(dia => {
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

        return {
          ...dia,
          turnos: [...dia.turnos, {
            id: Date.now(),
            orden: nuevoOrden,
            categoria: 'Principal',
            tipo: 'Nombrado',
            desde,
            hasta,
            minutos_turno: 15
          }]
        };
      }
      return dia;
    }));
  };

  const actualizarTurno = (diaId: number, turnoId: number, campo: keyof Turno, valor: string | number) => {
    setDias(dias.map(dia => {
      if (dia.id === diaId) {
        return {
          ...dia,
          turnos: dia.turnos.map(turno => {
            if (turno.id === turnoId) {
              return { ...turno, [campo]: valor };
            }
            return turno;
          })
        };
      }
      return dia;
    }));
  };

  const eliminarTurno = (diaId: number, turnoId: number) => {
    setDias(dias.map(dia => {
      if (dia.id === diaId) {
        return {
          ...dia,
          turnos: dia.turnos.filter(t => t.id !== turnoId).map((t, idx) => ({ ...t, orden: idx + 1 }))
        };
      }
      return dia;
    }));
  };

  const actualizarFechaDia = (diaId: number, fecha: string) => {
    setDias(dias.map(dia => {
      if (dia.id === diaId) {
        return { ...dia, fecha };
      }
      return dia;
    }));
  };

  const guardarConfiguracion = async () => {
    if (!periodoSeleccionado) {
      alert('⚠️ Por favor seleccione un período académico');
      return;
    }

    // Alerta si la fase de disponibilidad no ha terminado
    const ahora = new Date();
    const finFase = new Date(fase.fecha_fin);
    if (fase.estado === 'abierta' || ahora < finFase) {
      if (!confirm('⚠️ La fase de disponibilidad aún está abierta o no ha vencido el plazo. Se recomienda cerrar la fase antes de configurar las ventanas de atención. ¿Desea continuar de todos modos?')) {
        return;
      }
    }

    setGuardando(true);
    try {
      await fetch('/api/ventanas', { method: 'DELETE' });

      for (const dia of dias) {
        for (const turno of dia.turnos) {
          await fetch('/api/ventanas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_periodo: periodoSeleccionado,
              fecha: dia.fecha,
              orden_prioridad: turno.orden,
              modalidad: turno.tipo,
              categoria: turno.categoria,
              hora_inicio: turno.desde,
              hora_fin: turno.hasta,
              intervalo_minutos: turno.minutos_turno
            })
          });
        }
      }

      alert('✅ Configuración de ventanas guardada');
    } catch (error) {
      alert('❌ Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12"><div className="loader"></div></div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Modal de Convocatoria */}
      {showConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-3">Generar Convocatoria Escalonada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-semibold">Fecha inicio</label>
                <input type="date" className="w-full border px-2 py-1" value={convFecha} onChange={(e) => setConvFecha(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold">Hora inicio</label>
                <input type="time" className="w-full border px-2 py-1" value={convHora} onChange={(e) => setConvHora(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold">Modalidad</label>
                <select className="w-full border px-2 py-1" value={convModalidad} onChange={(e) => setConvModalidad(e.target.value)}>
                  <option value="nombrado">Nombrado</option>
                  <option value="contratado">Contratado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Categoría</label>
                <select className="w-full border px-2 py-1" value={convCategoria} onChange={(e) => setConvCategoria(e.target.value)}>
                  <option value="principal">Principal</option>
                  <option value="asociado">Asociado</option>
                  <option value="auxiliar">Auxiliar</option>
                  <option value="jefe_practica">Jefe de Práctica</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConvModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button onClick={() => submitConvocatoria(false)} disabled={convSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded">{convSubmitting ? '⏳ Generando...' : 'Generar'}</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* SECCIÓN 1: FASE DE DISPONIBILIDAD (NUEVO) */}
        <div className="bg-white border-2 border-gray-400 shadow-md overflow-hidden">
          <div className="bg-gradient-to-b from-indigo-500 to-indigo-700 border-b-2 border-indigo-800 px-4 py-2 flex justify-between items-center">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              📝 Fase de Disponibilidad de Docentes
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
              fase.estado === 'abierta' ? 'bg-green-100 text-green-700 border-green-500' :
              fase.estado === 'cerrada' ? 'bg-red-100 text-red-700 border-red-500' :
              'bg-gray-100 text-gray-700 border-gray-500'
            }`}>
              {fase.estado.toUpperCase().replace('_', ' ')}
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Configuración de Tiempos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estado de la Fase:</label>
                  <select 
                    value={fase.estado}
                    onChange={(e) => setFase({...fase, estado: e.target.value})}
                    className="w-full border-2 border-gray-300 p-2 text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="no_iniciada">No Iniciada</option>
                    <option value="abierta">Abierta (Docentes pueden registrar)</option>
                    <option value="cerrada">Cerrada (Bloquear registros)</option>
                    <option value="procesada">Procesada (Citaciones generadas)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Inicio:</label>
                    <input 
                      type="datetime-local" 
                      value={fase.fecha_inicio}
                      onChange={(e) => setFase({...fase, fecha_inicio: e.target.value})}
                      className="w-full border-2 border-gray-300 p-2 text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Fin:</label>
                    <input 
                      type="datetime-local" 
                      value={fase.fecha_fin}
                      onChange={(e) => setFase({...fase, fecha_fin: e.target.value})}
                      className="w-full border-2 border-gray-300 p-2 text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Parámetros de Registro */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bloques de Tiempo (min):</label>
                  <select 
                    value={fase.bloques_tiempo}
                    onChange={(e) => setFase({...fase, bloques_tiempo: e.target.value})}
                    className="w-full border-2 border-gray-300 p-2 text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Instrucciones para Docentes:</label>
                  <textarea 
                    value={fase.instrucciones}
                    onChange={(e) => setFase({...fase, instrucciones: e.target.value})}
                    className="w-full border-2 border-gray-300 p-2 text-sm focus:border-indigo-500 outline-none h-20"
                    placeholder="Ej: Registre su disponibilidad antes del viernes..."
                  />
                </div>
              </div>

              {/* Acciones de Procesamiento */}
              <div className="bg-white border-2 border-indigo-200 p-4 rounded shadow-inner">
                <h3 className="font-bold text-indigo-900 mb-3 border-b border-indigo-100 pb-1">⚙️ Generación de Citaciones</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-indigo-700 mb-1">Criterio de Prioridad:</label>
                    <select 
                      value={criterioOrden}
                      onChange={(e) => setCriterioOrden(e.target.value)}
                      className="w-full border border-indigo-300 p-2 text-sm outline-none"
                    >
                      {CRITERIOS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleProcesarDisponibilidad}
                    disabled={procesando || fase.estado !== 'cerrada'}
                    className={`w-full py-2 rounded font-bold text-sm shadow transition-all ${
                      procesando || fase.estado !== 'cerrada' 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                    }`}
                  >
                    {procesando ? '⏳ Procesando...' : '🚀 Generar Turnos Escalonados'}
                  </button>
                  <p className="text-[10px] text-gray-500 italic text-center">
                    * Solo disponible cuando la fase está en estado "CERRADA".
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-indigo-100 border-t-2 border-gray-400 flex justify-end">
            <button 
              onClick={handleGuardarFase}
              disabled={guardando || !periodoSeleccionado}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 text-sm font-bold border-2 border-indigo-900 shadow-md active:shadow-none disabled:bg-gray-400"
            >
              {guardando ? '💾 Guardando...' : '💾 Guardar Configuración de Fase'}
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: VENTANAS DE ATENCIÓN (EXISTENTE MEJORADA) */}
        <div className="bg-white border-2 border-gray-400 shadow-md">
          <div className="bg-gradient-to-b from-gray-200 to-gray-300 border-b-2 border-gray-400 px-4 py-2">
            <h1 className="text-lg font-bold text-gray-800">
              📅 Configurador de Ventanas de Atención (Citaciones)
            </h1>
            <p className="text-sm text-gray-600">
              Defina los horarios generales por día para la atención de los docentes
            </p>
          </div>

          <div className="p-4 border-b border-gray-300 bg-gray-50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Período Académico:</label>
                <select
                  className="border-2 border-gray-400 bg-white px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  value={periodoSeleccionado || ''}
                  onChange={(e) => setPeriodoSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Seleccione período</option>
                  {periodos.map((p) => (
                    <option key={p.id_periodo} value={p.id_periodo}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {dias.map((dia) => (
              <div key={dia.id} className="bg-white border-2 border-gray-400 shadow-sm">
                <div className="bg-gradient-to-b from-blue-500 to-blue-600 border-b-2 border-blue-700 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">Día {dias.indexOf(dia) + 1}</span>
                    <input
                      type="date"
                      value={dia.fecha}
                      onChange={(e) => actualizarFechaDia(dia.id, e.target.value)}
                      className="border-2 border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => agregarTurno(dia.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm font-semibold border-2 border-green-700 shadow-sm active:shadow-none"
                    >
                      ➕ Agregar Turno de Atención
                    </button>
                  </div>
                </div>

                {dia.turnos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border-2 border-gray-400 px-3 py-2 text-left text-sm font-bold text-gray-700 w-16">Orden</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-left text-sm font-bold text-gray-700">Categoría</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-left text-sm font-bold text-gray-700">Tipo</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-left text-sm font-bold text-gray-700">Desde</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-left text-sm font-bold text-gray-700">Hasta</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-left text-sm font-bold text-gray-700 w-24">Duración Turno</th>
                          <th className="border-2 border-gray-400 px-3 py-2 text-center text-sm font-bold text-gray-700 w-24">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dia.turnos.map((turno) => (
                          <tr key={turno.id} className="hover:bg-yellow-50">
                            <td className="border-2 border-gray-400 px-3 py-2 text-center font-mono">
                              <span className="font-bold">{turno.orden}</span>
                            </td>
                            <td className="border-2 border-gray-400 px-2 py-1">
                              <select
                                value={turno.categoria}
                                onChange={(e) => actualizarTurno(dia.id, turno.id, 'categoria', e.target.value)}
                                className="w-full border border-gray-300 px-2 py-1 text-sm bg-white"
                              >
                                {CATEGORIAS.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </td>
                            <td className="border-2 border-gray-400 px-2 py-1">
                              <select
                                value={turno.tipo}
                                onChange={(e) => actualizarTurno(dia.id, turno.id, 'tipo', e.target.value)}
                                className="w-full border border-gray-300 px-2 py-1 text-sm bg-white"
                              >
                                {TIPOS.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </td>
                            <td className="border-2 border-gray-400 px-2 py-1">
                              <input
                                type="time"
                                value={turno.desde}
                                onChange={(e) => actualizarTurno(dia.id, turno.id, 'desde', e.target.value)}
                                className="w-full border border-gray-300 px-2 py-1 text-sm font-mono"
                              />
                            </td>
                            <td className="border-2 border-gray-400 px-2 py-1">
                              <input
                                type="time"
                                value={turno.hasta}
                                onChange={(e) => actualizarTurno(dia.id, turno.id, 'hasta', e.target.value)}
                                className="w-full border border-gray-300 px-2 py-1 text-sm font-mono"
                              />
                            </td>
                            <td className="border-2 border-gray-400 px-2 py-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="5"
                                  max="60"
                                  step="5"
                                  value={turno.minutos_turno}
                                  onChange={(e) => actualizarTurno(dia.id, turno.id, 'minutos_turno', parseInt(e.target.value))}
                                  className="w-16 border border-gray-300 px-2 py-1 text-sm font-mono"
                                />
                                <span className="text-[10px] text-gray-500">min</span>
                              </div>
                            </td>
                            <td className="border-2 border-gray-400 px-2 py-1 text-center">
                              <button
                                onClick={() => eliminarTurno(dia.id, turno.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-semibold border border-red-700"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No hay ventanas configuradas para este día.
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <button
                onClick={agregarDia}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm font-bold border-2 border-blue-700 shadow-md active:shadow-none"
              >
                ➕ Agregar Día de Atención
              </button>
            </div>
          </div>

          <div className="p-4 border-t-2 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 flex justify-end gap-3">
            <button
              onClick={cargarDatos}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 text-sm font-bold border-2 border-gray-600 shadow-md active:shadow-none"
            >
              🔄 Restablecer
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-2 text-sm font-bold border-2 border-green-800 shadow-md active:shadow-none"
            >
              {guardando ? '💾 Guardando...' : '💾 Guardar Configuración de Ventanas'}
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 shadow-md p-4">
          <h3 className="font-bold text-gray-700 mb-2">📋 Guía de Uso</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>1. Configurar Fase:</strong> Abra la fase para que los docentes registren su disponibilidad. Establezca la fecha límite.</p>
            <p><strong>2. Configurar Ventanas:</strong> Defina qué días y en qué horarios atenderá a los docentes para asignarles sus cursos.</p>
            <p><strong>3. Generar Turnos:</strong> Una vez cerrada la fase de disponibilidad, use el botón "Generar Turnos Escalonados" para asignar una cita a cada docente según su prioridad.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
