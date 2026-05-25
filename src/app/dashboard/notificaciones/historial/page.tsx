'use client';

import { useState, useEffect } from 'react';
import { TablaDatos } from '@/components/ui/TablaDatos';

export default function HistorialNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    cargarHistorial();
  }, [filtro]);

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`/api/notificaciones/historial?estado=${filtro}`);
      const data = await response.json();
      if (data.exito) setNotificaciones(data.datos || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const columnas = [
    {
      campo: 'fecha_envio' as const,
      encabezado: 'Fecha',
      renderizar: (fecha: string) => new Date(fecha).toLocaleString()
    },
    { campo: 'destinatario' as const, encabezado: 'Destinatario' },
    { campo: 'canal' as const, encabezado: 'Canal' },
    { campo: 'asunto' as const, encabezado: 'Asunto' },
    {
      campo: 'estado' as const,
      encabezado: 'Estado',
      renderizar: (estado: string) => {
        const colores = {
          enviado: 'bg-green-100 text-green-800',
          pendiente: 'bg-yellow-100 text-yellow-800',
          fallido: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded text-xs ${colores[estado as keyof typeof colores] || ''}`}>
            {estado}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial de Notificaciones</h1>
        <p className="text-gray-600">Registro de todas las notificaciones enviadas</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-3">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded ${filtro === 'todas' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('enviado')}
            className={`px-4 py-2 rounded ${filtro === 'enviado' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Enviadas
          </button>
          <button
            onClick={() => setFiltro('pendiente')}
            className={`px-4 py-2 rounded ${filtro === 'pendiente' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('fallido')}
            className={`px-4 py-2 rounded ${filtro === 'fallido' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Fallidas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {cargando ? (
          <div className="flex justify-center py-12"><div className="loader"></div></div>
        ) : (
          <TablaDatos datos={notificaciones} columnas={columnas} keyField="id_historial" />
        )}
      </div>
    </div>
  );
}
