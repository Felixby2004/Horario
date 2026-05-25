'use client';

import { useState, useEffect } from 'react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function MisHorariosPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUsuario(user);
      cargarHorarios(user.id_docente);
    }
  }, []);

  const cargarHorarios = async (id_docente: number) => {
    try {
      const response = await fetch(`/api/docente/mis-horarios?id_docente=${id_docente}`);
      const data = await response.json();
      if (data.exito) {
        setHorarios(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const config: any = {
      solicitado: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PENDIENTE' },
      aprobado: { bg: 'bg-green-100', text: 'text-green-800', label: 'APROBADO' },
      cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'RECHAZADO' },
      confirmado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'CONFIRMADO' }
    };

    const { bg, text, label } = config[estado] || config.solicitado;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  const horariosFiltrados = horarios.filter(h => {
    if (filtro === 'todos') return true;
    return h.estado === filtro;
  });

  const countByEstado = (estado: string) => {
    return horarios.filter(h => h.estado === estado).length;
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mis horarios</h1>
          <p className="text-gray-600">Estado de tus solicitudes de horarios</p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{horarios.length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <div className="text-sm text-yellow-800">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-900">
              {countByEstado('solicitado')}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-800">Aprobados</div>
            <div className="text-2xl font-bold text-green-900">
              {countByEstado('aprobado')}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-sm text-red-800">Rechazados</div>
            <div className="text-2xl font-bold text-red-900">
              {countByEstado('cancelado')}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filtro === 'todos' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todos ({horarios.length})
          </button>
          <button
            onClick={() => setFiltro('solicitado')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filtro === 'solicitado' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pendientes ({countByEstado('solicitado')})
          </button>
          <button
            onClick={() => setFiltro('aprobado')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filtro === 'aprobado' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Aprobados ({countByEstado('aprobado')})
          </button>
          <button
            onClick={() => setFiltro('cancelado')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filtro === 'cancelado' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Rechazados ({countByEstado('cancelado')})
          </button>
        </div>

        {/* Lista de Horarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {horariosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay horarios con este filtro
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Día
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Horario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ambiente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {horariosFiltrados.map((h: any) => (
                  <tr key={h.id_asignacion} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{h.curso?.codigo}</div>
                      <div className="text-sm text-gray-500">{h.curso?.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {h.grupo?.codigo_grupo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {DIAS[h.dia_semana]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {h.hora_inicio} - {h.hora_fin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {h.ambiente?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm">
                        {h.tipo_clase}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(h.estado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Nota sobre rechazados */}
        {countByEstado('cancelado') > 0 && (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
            <p className="text-red-800 font-medium">
              ℹ️ Horarios rechazados: Puedes volver a solicitar otros horarios disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
