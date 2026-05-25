'use client';

import React, { useState, useEffect } from 'react';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

interface Citacion {
  id_citacion: number;
  fecha_citacion: string;
  hora_inicio: string;
  hora_fin: string;
  numero_orden_turno: number;
  estado: string;
  confirmado_docente: boolean;
  observaciones?: string;
}

interface MisCitacionesProps {
  idPeriodo: number;
}

export default function MisCitaciones({ idPeriodo }: MisCitacionesProps) {
  const [citaciones, setCitaciones] = useState<Citacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [confiromandoId, setConfirmandoId] = useState<number | null>(null);
  const [razonRechazo, setRazonRechazo] = useState('');
  const [citacionRechazandoId, setCitacionRechazandoId] = useState<number | null>(null);

  // Cargar citaciones
    useEffect(() => {
      if (!idPeriodo) return;
      let mounted = true;
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      fetch(`/api/citaciones?idPeriodo=${idPeriodo}`, { headers })
        .then((r) => r.json())
        .then(async (data) => {
            if (!mounted) return;
            const list = Array.isArray(data) ? data : (data?.datos ?? []);
            if (!Array.isArray(list) || list.length === 0) {
              // Fallback: pedir todas las citaciones del docente si no hay para el período seleccionado
              const fallbackRaw = await fetch(`/api/citaciones`, { headers }).then((r) => r.json()).catch(() => []);
              const fallback = Array.isArray(fallbackRaw) ? fallbackRaw : (fallbackRaw?.datos ?? []);
              if (mounted) setCitaciones(fallback || []);
            } else {
              setCitaciones(list);
            }
        })
        .catch(async () => {
            // En caso de error, intentar fallback sin idPeriodo
            const fallbackRaw = await fetch(`/api/citaciones`, { headers }).then((r) => r.json()).catch(() => []);
            const fallback = Array.isArray(fallbackRaw) ? fallbackRaw : (fallbackRaw?.datos ?? []);
            if (mounted) setCitaciones(fallback || []);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [idPeriodo]);

  const handleConfirmar = async (idCitacion: number) => {
    setConfirmandoId(idCitacion);
    setError('');
    setExito('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch('/api/citaciones', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ idCitacion, confirmadoDocente: true })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setExito('Citación confirmada exitosamente');
        setCitaciones(
          citaciones.map(c =>
            c.id_citacion === idCitacion
              ? { ...c, confirmado_docente: true, estado: 'confirmada_docente' }
              : c
          )
        );
        setTimeout(() => setExito(''), 5000);
      } else {
        setError(data?.mensaje || data?.error || 'Error al confirmar citación');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al confirmar citación');
    } finally {
      setConfirmandoId(null);
    }
  };

  const handleRechazar = async (idCitacion: number) => {
    if (!razonRechazo.trim()) {
      setError('Por favor ingresa el motivo del rechazo');
      return;
    }

    setError('');
    setExito('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch('/api/citaciones', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ idCitacion, estado: 'rechazada', razonRechazo })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setExito('Citación rechazada. Por favor contacta al coordinador para reprogramación');
        setCitaciones(
          citaciones.map(c =>
            c.id_citacion === idCitacion
              ? { ...c, estado: 'rechazada' }
              : c
          )
        );
        setRazonRechazo('');
        setCitacionRechazandoId(null);
        setTimeout(() => setExito(''), 5000);
      } else {
        setError(data?.mensaje || data?.error || 'Error al rechazar citación');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al rechazar citación');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estilos: Record<string, string> = {
      programada: 'bg-blue-100 text-blue-800',
      confirmada_docente: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      completada: 'bg-purple-100 text-purple-800',
      cancelada: 'bg-gray-100 text-gray-800'
    };
    return estilos[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoTexto = (estado: string) => {
    const textos: Record<string, string> = {
      programada: 'Programada',
      confirmada_docente: 'Confirmada',
      rechazada: 'Rechazada',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando citaciones...</div>;
  }

  if (citaciones.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          No tienes citaciones programadas en este período.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Mis Citaciones para Asignación de Horarios</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {exito}
        </div>
      )}

      <div className="space-y-3">
        {citaciones.map(citacion => (
          <div key={citacion.id_citacion} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-800">
                    Turno #{citacion.numero_orden_turno}
                  </h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getEstadoBadge(citacion.estado)}`}>
                    {getEstadoTexto(citacion.estado)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    📅 <strong>Fecha:</strong> {utilidadesFecha.formatearFechaBD(citacion.fecha_citacion)}
                  </p>
                  <p>
                    ⏰ <strong>Hora:</strong> {citacion.hora_inicio} - {citacion.hora_fin}
                  </p>
                </div>
              </div>
            </div>

            {citacion.observaciones && (
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                <strong>Notas:</strong> {citacion.observaciones}
              </p>
            )}

            {/* Acciones según estado */}
            {citacion.estado === 'programada' && !citacion.confirmado_docente && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmar(citacion.id_citacion)}
                  disabled={confiromandoId === citacion.id_citacion}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {confiromandoId === citacion.id_citacion ? 'Confirmando...' : '✓ Confirmar Asistencia'}
                </button>
                <button
                  onClick={() => setCitacionRechazandoId(citacion.id_citacion)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  ✕ Rechazar
                </button>
              </div>
            )}

            {/* Modal de rechazo */}
            {citacionRechazandoId === citacion.id_citacion && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo
                </label>
                <textarea
                  value={razonRechazo}
                  onChange={(e) => setRazonRechazo(e.target.value)}
                  placeholder="Explica por qué rechazas esta citación..."
                  className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRechazar(citacion.id_citacion)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Confirmar Rechazo
                  </button>
                  <button
                    onClick={() => {
                      setCitacionRechazandoId(null);
                      setRazonRechazo('');
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {citacion.confirmado_docente && (
              <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                ✓ Tu asistencia ha sido confirmada
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
