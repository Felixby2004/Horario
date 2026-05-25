'use client';

import { useState, useEffect } from 'react';
import RegistroDisponibilidad from '@/components/disponibilidad/RegistroDisponibilidad';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

interface Periodo {
  id_periodo: number;
  nombre: string;
  codigo: string;
  estado: string;
  activo: boolean;
}

interface FaseDisponibilidad {
  id_fase_disponibilidad: number;
  id_periodo: number;
  estado: 'no_iniciada' | 'abierta' | 'cerrada' | 'procesada';
  fecha_inicio: string;
  fecha_fin: string;
  bloques_tiempo: string;
  instrucciones?: string;
}

const ESTADO_INFO: Record<string, { label: string; color: string; icon: string; descripcion: string }> = {
  no_iniciada: {
    label: 'No iniciada',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: '⏸️',
    descripcion: 'La fase de disponibilidad aún no ha sido abierta por el administrador.',
  },
  abierta: {
    label: 'Abierta',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✅',
    descripcion: 'Puedes registrar tu disponibilidad ahora.',
  },
  cerrada: {
    label: 'Cerrada',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '🔒',
    descripcion: 'El período de registro ha finalizado. Ya no puedes modificar tu disponibilidad.',
  },
  procesada: {
    label: 'Procesada',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '🎯',
    descripcion: 'Tu disponibilidad fue procesada. Pronto recibirás tu citación para la asignación de horarios.',
  },
};

export default function DisponibilidadPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [fase, setFase] = useState<FaseDisponibilidad | null>(null);
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true);
  const [cargandoFase, setCargandoFase] = useState(false);
  const [errorFase, setErrorFase] = useState('');

  // Cargar períodos activos al montar
  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        const res = await fetch('/api/periodos');
        const data = await res.json();
        if (data.exito) {
          const activos = (data.datos as Periodo[]).filter(
            (p) => p.estado !== 'finalizado'
          );
          setPeriodos(activos);

          // Seleccionar automáticamente el período activo
          const activo = activos.find((p) => p.activo);
          if (activo) {
            setPeriodoSeleccionado(activo.id_periodo);
          } else if (activos.length > 0) {
            setPeriodoSeleccionado(activos[0].id_periodo);
          }
        }
      } catch (err) {
        console.error('Error cargando períodos:', err);
      } finally {
        setCargandoPeriodos(false);
      }
    };

    cargarPeriodos();
  }, []);

  // Cargar fase cuando cambia el período
  useEffect(() => {
    if (!periodoSeleccionado) return;

    const cargarDatosRelacionados = async () => {
      setCargandoFase(true);
      setErrorFase('');
      setFase(null);

      const token = localStorage.getItem('token');

      try {
        // Cargar fase de disponibilidad
        const resFase = await fetch(`/api/disponibilidad/fase?idPeriodo=${periodoSeleccionado}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const dataFase = await resFase.json();
        
        if (resFase.ok) {
          setFase(dataFase);
        } else {
          setErrorFase(dataFase.error || dataFase.mensaje || 'Error al obtener la fase de disponibilidad');
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setErrorFase('Error de conexión al cargar la información.');
      } finally {
        setCargandoFase(false);
      }
    };

    cargarDatosRelacionados();
  }, [periodoSeleccionado]);

  const faseInfo = fase ? ESTADO_INFO[fase.estado] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3 text-3xl">📆</div>
            <div>
              <h1 className="text-2xl font-bold">Mi Disponibilidad de Horarios</h1>
              <p className="text-indigo-100 mt-1">
                Registra los días y horas en que estás disponible para dictar clases este ciclo.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de período */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📅 Período Académico
          </label>
          {cargandoPeriodos ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
          ) : periodos.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay períodos activos disponibles.</p>
          ) : (
            <select
              value={periodoSeleccionado ?? ''}
              onChange={(e) => setPeriodoSeleccionado(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="" disabled>Selecciona un período</option>
              {periodos.map((p) => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre} {p.activo ? '(Activo)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Estado de la fase */}
        {periodoSeleccionado && (
          <>
            {cargandoFase && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-gray-400 animate-pulse">Cargando información de disponibilidad...</div>
              </div>
            )}

            {!cargandoFase && errorFase && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold text-amber-800 text-lg">Fase de Disponibilidad no disponible</p>
                  <p className="text-amber-700 mt-2 p-3 bg-white/50 rounded-lg border border-amber-100 font-mono text-xs">
                    Error: {errorFase}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-amber-600 text-sm">
                      Esto suele ocurrir por una de las siguientes razones:
                    </p>
                    <ul className="text-amber-600 text-sm list-disc list-inside space-y-1">
                      <li>El administrador aún no ha creado la fase para el periodo {periodoSeleccionado}.</li>
                      <li>La fase existe pero no ha sido abierta para registro.</li>
                      <li>Hay un problema técnico con la base de datos (Error 500).</li>
                    </ul>
                    <p className="text-amber-800 font-semibold text-sm mt-4">
                      💡 Por favor, contacta al coordinador académico para que habilite la fase de disponibilidad.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!cargandoFase && fase && faseInfo && (
              <>

                {/* Componente de registro (solo si está abierta y dentro de fecha) */}
                {fase.estado === 'abierta' && (
                  (() => {
                    const ahora = utilidadesFecha.ahoraLima();
                    const fin = new Date(fase.fecha_fin);
                    const inicio = new Date(fase.fecha_inicio);
                    
                    if (ahora < inicio) {
                      return (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                          <div className="text-5xl mb-4">⏳</div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aún no inicia el registro</h3>
                          <p className="text-gray-500 text-sm">
                            El registro de disponibilidad estará habilitado a partir del {utilidadesFecha.formatearFechaHora(inicio)}.
                          </p>
                        </div>
                      );
                    }
                    
                    if (ahora > fin) {
                      return (
                        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-8 text-center">
                          <div className="text-5xl mb-4">🚫</div>
                          <h3 className="text-lg font-semibold text-red-800 mb-2">Plazo Vencido</h3>
                          <p className="text-red-700 text-sm">
                            Lo sentimos, el plazo para registrar tu disponibilidad venció el {utilidadesFecha.formatearFechaHora(fin)}.
                            Por favor, comunícate con la secretaría académica si necesitas realizar un registro extemporáneo.
                          </p>
                        </div>
                      );
                    }
                    
                    return <RegistroDisponibilidad fase={fase} />;
                  })()
                )}

                {/* Mensaje para fases cerradas/procesadas */}
                {(fase.estado === 'cerrada' || fase.estado === 'procesada') && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="text-5xl mb-4">
                      {fase.estado === 'procesada' ? '🎯' : '🔒'}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {fase.estado === 'procesada'
                        ? 'Tu disponibilidad fue registrada y procesada'
                        : 'El período de registro ha cerrado'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {fase.estado === 'procesada'
                        ? 'El coordinador procesó las disponibilidades. Revisa la sección "Mis Citaciones" para ver tu turno asignado.'
                        : 'Ya no es posible registrar o modificar tu disponibilidad para este período.'}
                    </p>
                    {fase.estado === 'procesada' && (
                      <a
                        href="/docente/citaciones"
                        className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                      >
                        Ver mis citaciones →
                      </a>
                    )}
                  </div>
                )}

                {/* Mensaje para fase no iniciada */}
                {fase.estado === 'no_iniciada' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      La fase aún no ha iniciado
                    </h3>
                    <p className="text-gray-500 text-sm">
                      El administrador habilitará el registro de disponibilidad próximamente.
                      Estará disponible entre el{' '}
                      <strong>{new Date(fase.fecha_inicio).toLocaleDateString('es-ES')}</strong> y el{' '}
                      <strong>{new Date(fase.fecha_fin).toLocaleDateString('es-ES')}</strong>.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Información de ayuda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">ℹ️ ¿Cómo funciona?</h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>El coordinador habilita una fase de disponibilidad antes del inicio del ciclo.</li>
            <li>Tú marcas los bloques horarios en los que <strong>sí puedes dictar clases</strong>.</li>
            <li>La secretaría genera citaciones escalonadas según tu <strong>categoría y antigüedad</strong>.</li>
            <li>Recibes una cita (ej. Martes 28/05 — 08:15 a 08:30) para asignarte tu horario.</li>
            <li>Confirmas o rechazas tu citación desde <strong>"Mis Citaciones"</strong>.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
