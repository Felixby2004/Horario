'use client';

import React, { useState, useEffect } from 'react';
import MatrizDisponibilidad from './MatrizDisponibilidad';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

interface RegistroDisponibilidadProps {
  idFase: number;
}

interface FaseInfo {
  id_fase_disponibilidad: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  bloques_tiempo: string;
  instrucciones?: string;
}

interface RegistroDisponibilidadProps {
  fase: FaseInfo;
}

export default function RegistroDisponibilidad({ fase }: RegistroDisponibilidadProps) {
  const [registro, setRegistro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [matrizActual, setMatrizActual] = useState<Record<string, boolean[]>>({});
  const [notas, setNotas] = useState('');

  // Cargar información de la fase y registro existente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const idFase = fase.id_fase_disponibilidad;

        // Cargar registro actual
        const resRegistro = await fetch(`/api/disponibilidad/registro?idFase=${idFase}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (resRegistro.ok) {
          const registroData = await resRegistro.json();
          setRegistro(registroData);
          if (registroData.matriz_disponibilidad) {
            setMatrizActual(registroData.matriz_disponibilidad);
          }
          if (registroData.notas) {
            setNotas(registroData.notas);
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [fase.id_fase_disponibilidad]);

  const handleGuardar = async () => {
    if (Object.keys(matrizActual).length === 0) {
      setError('Por favor selecciona tu disponibilidad');
      return;
    }

    setGuardando(true);
    setError('');
    setExito('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/disponibilidad/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idFase: fase.id_fase_disponibilidad,
          matrizDisponibilidad: matrizActual,
          notas: notas || undefined
        })
      });

      if (response.ok) {
        setExito('¡Disponibilidad registrada exitosamente!');
        const data = await response.json();
        setRegistro(data.registro);
        setTimeout(() => setExito(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al registrar disponibilidad');
      }
    } catch (err) {
      console.error('Error guardando:', err);
      setError('Error al guardar la disponibilidad');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!fase) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">No hay fase de disponibilidad activa en este período</p>
      </div>
    );
  }

  const estaAbierta = fase.estado === 'abierta';
  const ahora = utilidadesFecha.ahoraLima();
  const inicioFase = new Date(fase.fecha_inicio);
  const finFase = new Date(fase.fecha_fin);
  const dentroDelPeriodo = ahora >= inicioFase && ahora <= finFase;

  return (
    <div className="space-y-6">
      {/* Información de la Fase */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Registro de Disponibilidad de Horarios
        </h2>
        <p className="text-blue-800 mb-3">
          Por favor registra tu disponibilidad para la asignación de horarios del período.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-900">Inicio del registro:</p>
            <p className="text-blue-800">
              {utilidadesFecha.formatearFechaHora(fase.fecha_inicio)}
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Fin del registro:</p>
            <p className="text-blue-800">
              {utilidadesFecha.formatearFechaHora(fase.fecha_fin)}
            </p>
          </div>
        </div>

        {fase.instrucciones && (
          <div className="mt-3 p-3 bg-blue-100 rounded">
            <p className="text-sm text-blue-900 font-semibold mb-1">Instrucciones:</p>
            <p className="text-sm text-blue-800">{fase.instrucciones}</p>
          </div>
        )}

        {!estaAbierta && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ La fase de disponibilidad no está abierta ({fase.estado})
            </p>
          </div>
        )}

        {estaAbierta && !dentroDelPeriodo && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ Actualmente no estamos en el período de registro de disponibilidad
            </p>
          </div>
        )}
      </div>

      {/* Matriz de Disponibilidad */}
      {estaAbierta && dentroDelPeriodo && (
        <>
          <MatrizDisponibilidad
            bloquesTiempo={parseInt(fase.bloques_tiempo)}
            horaInicio="08:00"
            horaFin="18:00"
            onSeleccion={setMatrizActual}
            matrizInicial={registro?.matriz_disponibilidad}
          />

          {/* Notas */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Preferencia por horarios matutinos, restricciones especiales, etc."
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Mensajes */}
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

          {/* Estado del Registro */}
          {registro?.completado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-semibold">
                ✓ Tu disponibilidad ha sido registrada
              </p>
              <p className="text-sm text-green-600 mt-1">
                Última actualización: {new Date(registro.fecha_actualizacion).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}

          {/* Botón Guardar */}
          <button
            onClick={handleGuardar}
            disabled={guardando || !Object.keys(matrizActual).length}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar Disponibilidad'}
          </button>
        </>
      )}

      {!estaAbierta && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-center">
            La fase de disponibilidad no está disponible para registro en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
