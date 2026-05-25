'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState('solicitado');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
  }, [filtro]);

  const cargarSolicitudes = async () => {
    try {
      const response = await fetch(`/api/solicitudes?estado=${filtro}`);
      const data = await response.json();
      if (data.exito) {
        setSolicitudes(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setCargando(false);
    }
  };

  const aprobarSolicitud = async (id: number) => {
    if (!confirm('¿Aprobar esta solicitud de horario?')) return;

    try {
      const response = await fetch(`/api/solicitudes/${id}/aprobar`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Solicitud aprobada');
        cargarSolicitudes();
      } else {
        alert('❌ ' + (data.mensaje || 'Error al aprobar'));
      }
    } catch (error) {
      alert('❌ Error al aprobar solicitud');
    }
  };

  const rechazarSolicitud = async (id: number) => {
    const motivo = prompt('Motivo del rechazo (opcional):');
    
    try {
      const response = await fetch(`/api/solicitudes/${id}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Solicitud rechazada');
        cargarSolicitudes();
      } else {
        alert('❌ ' + (data.mensaje || 'Error al rechazar'));
      }
    } catch (error) {
      alert('❌ Error al rechazar solicitud');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colores: any = {
      borrador: 'bg-yellow-100 text-yellow-800',
      solicitado: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      confirmado: 'bg-blue-100 text-blue-800'
    };

    const etiquetas: Record<string, string> = {
      borrador: 'PENDIENTE',
      solicitado: 'PENDIENTE',
      aprobado: 'APROBADA',
      cancelado: 'RECHAZADA',
      confirmado: 'CONFIRMADA'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colores[estado] || 'bg-gray-100 text-gray-800'}`}>
        {etiquetas[estado] || estado.toUpperCase()}
      </span>
    );
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Solicitudes de horarios</h1>
        <p className="text-gray-600 mt-1">
          Revisar y aprobar solicitudes de los docentes
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-2">
        <button
          onClick={() => setFiltro('solicitado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'solicitado'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltro('aprobado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'aprobado'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Aprobadas
        </button>
        <button
          onClick={() => setFiltro('cancelado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'cancelado'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rechazadas
        </button>
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'todos'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Lista de Solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {solicitudes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay solicitudes con este filtro
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Docente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ambiente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudes.map((sol: any) => (
                <tr key={sol.id_asignacion} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">
                      {sol.docente?.apellidos}, {sol.docente?.nombres}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sol.docente?.modalidad}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm">
                      {sol.docente?.categoria?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{sol.curso?.codigo}</div>
                    <div className="text-sm text-gray-500">{sol.curso?.nombre}</div>
                    <div className="text-xs text-gray-400">Ciclo {sol.curso?.ciclo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{DIAS[sol.dia_semana]}</div>
                    <div className="text-sm text-gray-600">
                      {sol.hora_inicio} - {sol.hora_fin}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sol.ambiente?.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(sol.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {['solicitado', 'borrador'].includes(sol.estado) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => aprobarSolicitud(sol.id_asignacion)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => rechazarSolicitud(sol.id_asignacion)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
