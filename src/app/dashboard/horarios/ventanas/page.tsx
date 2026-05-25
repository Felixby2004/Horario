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
  }, []);

  useEffect(() => {
    if (periodoSeleccionado !== null) {
      cargarVentanas(periodoSeleccionado);
    }
  }, [periodoSeleccionado]);

  const cargarPeriodos = async () => {
    try {
      const resPeriodos = await fetch('/api/periodos');
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
      const resVentanas = await fetch(`/api/ventanas?id_periodo=${idPeriodo}`);
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
          turnos: ventanas.sort((a, b) => a.orden_prioridad - b.orden_prioridad).map((v, i) => ({
            id: v.id_ventana,
            orden: i + 1,
            categoria: v.categoria,
            tipo: v.modalidad,
            desde: v.hora_inicio,
            hasta: v.hora_fin,
            cantidad_docentes: v.cantidad_docentes || 0,
            cantidad_atendidos: v.cantidad_atendidos || 0
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
    } catch (error) {
      console.error('Error:', error);
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + 1);
      setDias([{
        id: 1,
        fecha: hoy.toISOString().split('T')[0],
        turnos: []
      }]);
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
            categoria: 'principal',
            tipo: 'nombrado',
            desde,
            hasta
          }]
        };
      }
      return dia;
    }));
  };

  const actualizarTurno = (diaId: number, turnoId: number, campo: keyof Turno, valor: string) => {
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

    setGuardando(true);
    try {
      await fetch(`/api/ventanas?id_periodo=${periodoSeleccionado}`, { method: 'DELETE' });

      let ordenGlobal = 1;
      for (const dia of dias) {
        for (const turno of dia.turnos) {
          await fetch('/api/ventanas', {
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
              intervalo_minutos: 15
            })
          });
          ordenGlobal++;
        }
      }

      alert('✅ Configuración guardada exitosamente');
      await cargarVentanas(periodoSeleccionado);
    } catch (error) {
      alert('❌ Error al guardar la configuración');
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
    <div className="p-4 bg-gray-100 min-h-screen">
      {showConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-3">Generar Convocatoria Escalonada</h3>
            <p className="text-sm text-gray-600 mb-3">
              Solo se crearán citaciones para la combinación de modalidad y categoría que selecciones aquí.
            </p>
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
                <label className="block text-sm font-semibold">Separación entre citas (min)</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  className="w-full border px-2 py-1"
                  value={convIntervaloMinutos}
                  onChange={(e) => setConvIntervaloMinutos(parseInt(e.target.value || '15', 10))}
                />
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-2 border-gray-400 shadow-md mb-4">
          <div className="bg-gradient-to-b from-gray-200 to-gray-300 border-b-2 border-gray-400 px-4 py-2">
            <h1 className="text-lg font-bold text-gray-800">
              📅 Configurador de Ventanas de Atención
            </h1>
            <p className="text-sm text-gray-600">
              Configure los turnos horarios por categoría y tipo de docente. La convocatoria respeta el orden: Nombrado > Contratado y, dentro de cada tipo, Principal > Asociado > Auxiliar > Jefe de Práctica por antigüedad.
            </p>
          </div>

          <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
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
              {filtroVista && (
                <div className="text-sm text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 px-3 py-2 rounded">
                  Última combinación generada: {filtroVista.modalidad} / {filtroVista.categoria}
                </div>
              )}
            </div>

            {periodoSeleccionado && (
              <button
                onClick={generarConvocatoria}
                disabled={procesando}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 text-sm font-bold border-2 border-indigo-800 shadow-md flex items-center gap-2"
              >
                {procesando ? '⏳ Procesando...' : '⚡ Generar Convocatoria Escalonada'}
              </button>
            )}
          </div>

          <div className="p-4 space-y-4">
            {dias.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                No hay ventanas para la combinación seleccionada.
              </div>
            ) : dias.map((dia) => (
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
                      ➕ Agregar Turno
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
                          <th className="border-2 border-gray-400 px-3 py-2 text-center text-sm font-bold text-gray-700">Docentes a citar</th>
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
                                  <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
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
                                  <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
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
                            <td className="border-2 border-gray-400 px-2 py-1 text-center font-bold text-indigo-600">
                              {turno.cantidad_docentes || 0}
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
                    No hay turnos configurados para este día. Haga clic en "Agregar Turno" para comenzar.
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <button
                onClick={agregarDia}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 text-sm font-bold border-2 border-blue-700 shadow-md active:shadow-none"
              >
                ➕ Agregar Día
              </button>
            </div>
          </div>

          <div className="p-4 border-t-2 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 flex justify-end gap-3">
            <button
              onClick={() => {
                setFiltroVista(null);
                cargarPeriodos();
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 text-sm font-bold border-2 border-gray-600 shadow-md active:shadow-none"
            >
              🔄 Restablecer
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-2 text-sm font-bold border-2 border-green-800 shadow-md active:shadow-none"
            >
              {guardando ? '💾 Guardando...' : '💾 Guardar Configuración'}
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400 shadow-md p-4">
          <h3 className="font-bold text-gray-700 mb-2">📋 Ayuda</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Categorías:</strong> Principal, Asociado, Auxiliar, JP (Jefe de Práctica)</p>
            <p><strong>Tipos:</strong> Nombrado, Contratado</p>
            <p><strong>Funcionamiento:</strong> Cada turno define qué categoría y tipo de docente puede ser citado en ese rango. Al generar la convocatoria, solo se crean citas para la combinación seleccionada en el modal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
