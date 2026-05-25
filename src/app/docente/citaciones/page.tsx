'use client';

import { useState, useEffect } from 'react';
import MisCitaciones from '@/components/citaciones/MisCitaciones';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

interface Periodo {
  id_periodo: number;
  nombre: string;
  codigo: string;
  estado: string;
  activo: boolean;
}

const ESTADO_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  programada: { label: 'Programada', bg: 'bg-blue-100', text: 'text-blue-800' },
  confirmada_docente: { label: 'Confirmada', bg: 'bg-green-100', text: 'text-green-800' },
  rechazada: { label: 'Rechazada', bg: 'bg-red-100', text: 'text-red-800' },
  completada: { label: 'Completada', bg: 'bg-purple-100', text: 'text-purple-800' },
  cancelada: { label: 'Cancelada', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function CitacionesPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [ventana, setVentana] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

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

          // Seleccionar automáticamente el período ACTIVO (activo=true y no finalizado)
          const activo = activos.find((p) => p.activo && p.estado !== 'finalizado');
          if (activo) {
            setPeriodoSeleccionado(activo.id_periodo);
          } else if (activos.length > 0) {
            setPeriodoSeleccionado(activos[0].id_periodo);
          }
        }
      } catch (err) {
        console.error('Error cargando períodos:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarPeriodos();
  }, []);

  // Cargar ventana actual del docente
  useEffect(() => {
    const cargarVentana = async () => {
      const userData = localStorage.getItem('user');
      const usuario = userData ? JSON.parse(userData) : null;
      if (usuario?.id_docente) {
        try {
          const res = await fetch(`/api/docente/ventana-actual?id_docente=${usuario.id_docente}`);
          const data = await res.json();
          if (data.exito) {
            setVentana(data.datos);
          }
        } catch (err) {
          console.error('Error cargando ventana:', err);
        }
      }
    };

    cargarVentana();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3 text-3xl">🗓️</div>
            <div>
              <h1 className="text-2xl font-bold">Mis Citaciones</h1>
              <p className="text-violet-100 mt-1">
                Revisa y confirma tu turno de atención para la asignación de horarios.
              </p>
            </div>
          </div>
        </div>

        {/* Banner de Ventana de Atención (Movido desde Disponibilidad) */}
        {ventana && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-200 overflow-hidden">
            <div className="bg-indigo-50 border-b border-indigo-100 p-4">
              <div className="flex items-center gap-2 text-indigo-800 font-bold">
                <span className="text-xl">🎟️</span>
                <h3>Tu Ventana de Atención para Selección de Horarios</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Según tu categoría (<span className="font-semibold text-gray-900">{ventana.docente_info?.categoria}</span>) 
                    y modalidad (<span className="font-semibold text-gray-900">{ventana.docente_info?.modalidad}</span>), 
                    tienes asignado el siguiente turno:
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
                      <p className="text-[10px] uppercase text-gray-500 font-bold">Fecha</p>
                      <p className="font-semibold text-gray-800">
                        {utilidadesFecha.formatearFechaBD(ventana.fecha)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
                      <p className="text-[10px] uppercase text-gray-500 font-bold">Horario</p>
                      <p className="font-semibold text-gray-800">
                        {ventana.hora_inicio} — {ventana.hora_fin}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
                      <p className="text-[10px] uppercase text-gray-500 font-bold">Estado</p>
                      <p className={`font-bold ${
                        ventana.estado === 'activa' ? 'text-green-600' : 
                        ventana.estado === 'proxima' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {ventana.estado === 'activa' ? '✅ AHORA' : 
                          ventana.estado === 'proxima' ? '⏳ PRÓXIMAMENTE' : '🔒 FINALIZADA'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {ventana.estado === 'activa' && (
                  <a
                    href="/docente/seleccionar-horarios"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all hover:scale-105 text-center"
                  >
                    Ir a Seleccionar Horarios →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ¿Qué es una citación? */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">ℹ️ ¿Qué es una citación?</h3>
          <p className="text-sm text-gray-600 mb-3">
            La secretaría asigna un <strong>turno de atención de 15 minutos</strong> a cada docente
            para que pueda seleccionar sus horarios. El orden se determina por{' '}
            <strong>categoría</strong> (Principal {'>'} Asociado {'>'} Auxiliar {'>'} Jefe de Práctica)
            y <strong>antigüedad</strong> dentro de cada categoría.
          </p>

          {/* Leyenda de estados */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(ESTADO_BADGE).map(([key, val]) => (
              <span
                key={key}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${val.bg} ${val.text}`}
              >
                {val.label}
              </span>
            ))}
          </div>
        </div>

        {/* Selector de período */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📅 Período Académico
          </label>
          {cargando ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
          ) : periodos.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay períodos disponibles.</p>
          ) : (
            <select
              value={periodoSeleccionado ?? ''}
              onChange={(e) => setPeriodoSeleccionado(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
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

        {/* Componente de citaciones */}
        {!cargando && periodoSeleccionado ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <MisCitaciones idPeriodo={periodoSeleccionado} />
          </div>
        ) : !cargando && !periodoSeleccionado ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Selecciona un período</h3>
            <p className="text-sm text-gray-500">
              Elige el período académico para ver tus citaciones.
            </p>
          </div>
        ) : null}

        {/* Pasos del proceso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">🔄 Proceso de asignación de horarios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="text-3xl mb-2">📆</div>
              <p className="text-sm font-semibold text-indigo-800">1. Registra tu disponibilidad</p>
              <p className="text-xs text-indigo-600 mt-1">
                Indica los bloques en que puedes dictar clases
              </p>
              <a
                href="/docente/disponibilidad"
                className="mt-3 text-xs text-indigo-700 underline hover:text-indigo-900"
              >
                Ir a Disponibilidad →
              </a>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
              <div className="text-3xl mb-2">🎟️</div>
              <p className="text-sm font-semibold text-violet-800">2. Confirma tu citación</p>
              <p className="text-xs text-violet-600 mt-1">
                Acepta el turno asignado por la secretaría
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm font-semibold text-green-800">3. Selecciona tus horarios</p>
              <p className="text-xs text-green-600 mt-1">
                En tu turno, elige los bloques de clase
              </p>
              <a
                href="/docente/seleccionar-horarios"
                className="mt-3 text-xs text-green-700 underline hover:text-green-900"
              >
                Ir a Horarios →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
