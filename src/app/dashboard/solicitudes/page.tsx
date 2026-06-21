'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { useAlerta } from '@/contexts/AlertaContext';
import { usePaginacion } from '@/hooks/usePaginacion';
import { formatearTextoVisualOracion } from '@/lib/formatoTexto';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function SolicitudesPage() {
  const { exito, error } = useAlerta();
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState('solicitado');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
  }, [filtro]);

  const {
    datosPaginados,
    paginaActual,
    totalPaginas,
    irAPagina,
    siguiente,
    anterior,
    primera,
    ultima,
    hayAnterior,
    haySiguiente
  } = usePaginacion(solicitudes);

  const [inputPagina, setInputPagina] = useState('');

  const handleIrAPagina = () => {
    const num = parseInt(inputPagina);
    if (num >= 1 && num <= totalPaginas) {
      irAPagina(num);
      setInputPagina('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleIrAPagina();
    }
  };

  const getPaginasVisibles = () => {
    const paginas = [];
    const delta = 2;
    
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);
      
      const start = Math.max(2, paginaActual - delta);
      const end = Math.min(totalPaginas - 1, paginaActual + delta);
      
      if (start > 2) {
        paginas.push(-1);
      }
      
      for (let i = start; i <= end; i++) {
        paginas.push(i);
      }
      
      if (end < totalPaginas - 1) {
        paginas.push(-2);
      }
      
      paginas.push(totalPaginas);
    }
    
    return paginas;
  };

  const cargarSolicitudes = async () => {
    try {
      const response = await fetch(`/api/solicitudes?estado=${filtro}`);
      const data = await response.json();
      if (data.exito) {
        setSolicitudes(data.datos || []);
        irAPagina(1); // Reset to first page when filter changes
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setCargando(false);
    }
  };

  const aprobarSolicitud = async (id: number) => {
    if (!window.confirm('¿Aprobar esta solicitud de horario?')) return;

    try {
      const response = await fetch(`/api/solicitudes/${id}/aprobar`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.exito) {
        exito('Solicitud aprobada', 'La solicitud ha sido aprobada exitosamente');
        cargarSolicitudes();
      } else {
        error('Error al aprobar', data.mensaje || 'Ocurrió un error al aprobar la solicitud');
      }
    } catch (err) {
      error('Error al aprobar', 'Ocurrió un error al aprobar la solicitud');
    }
  };

  const rechazarSolicitud = async (id: number) => {
    const motivo = window.prompt('Motivo del rechazo (opcional):');
    
    try {
      const response = await fetch(`/api/solicitudes/${id}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo })
      });

      const data = await response.json();
      if (data.exito) {
        exito('Solicitud rechazada', 'La solicitud ha sido rechazada exitosamente');
        cargarSolicitudes();
      } else {
        error('Error al rechazar', data.mensaje || 'Ocurrió un error al rechazar la solicitud');
      }
    } catch (err) {
      error('Error al rechazar', 'Ocurrió un error al rechazar la solicitud');
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
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {solicitudes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay solicitudes con este filtro
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Docente
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Categoría
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Curso
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Horario
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Ambiente
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Estado
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {datosPaginados.map((sol: any) => (
                    <tr key={sol.id_asignacion} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-medium text-sm">
                          {sol.docente?.apellidos}, {sol.docente?.nombres}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatearTextoVisualOracion(sol.docente?.modalidad)}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs">{formatearTextoVisualOracion(sol.docente?.categoria)}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-medium text-xs">{sol.curso?.codigo}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {formatearTextoVisualOracion(sol.curso?.nombre)}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="font-medium text-xs">{DIAS[sol.dia_semana]}</div>
                        <div className="text-xs text-gray-600">
                          {sol.hora_inicio} - {sol.hora_fin}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs truncate max-w-[120px]">
                        {formatearTextoVisualOracion(sol.ambiente?.nombre)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {getEstadoBadge(sol.estado)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {['solicitado', 'borrador'].includes(sol.estado) && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => aprobarSolicitud(sol.id_asignacion)}
                              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => rechazarSolicitud(sol.id_asignacion)}
                              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
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
            </div>
          )}
        </div>

        {/* Paginador */}
        {totalPaginas > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-600">
              Mostrando {(paginaActual - 1) * 8 + 1} a {Math.min(paginaActual * 8, solicitudes.length)} de {solicitudes.length} registros
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Boton
                variante="secondary"
                onClick={primera}
                disabled={!hayAnterior}
                tamaño="small"
              >
                ««
              </Boton>
              <Boton
                variante="secondary"
                onClick={anterior}
                disabled={!hayAnterior}
                tamaño="small"
              >
                ‹
              </Boton>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPaginasVisibles().map((pagina, index) => (
                  pagina < 0 ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <Boton
                      key={pagina}
                      variante={pagina === paginaActual ? 'primary' : 'secondary'}
                      onClick={() => irAPagina(pagina)}
                      tamaño="small"
                    >
                      {pagina}
                    </Boton>
                  )
                ))}
              </div>
              
              <Boton
                variante="secondary"
                onClick={siguiente}
                disabled={!haySiguiente}
                tamaño="small"
              >
                ›
              </Boton>
              <Boton
                variante="secondary"
                onClick={ultima}
                disabled={!haySiguiente}
                tamaño="small"
              >
                »»
              </Boton>
              
              {/* Direct page input */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-gray-500">Ir a:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPaginas}
                  value={inputPagina}
                  onChange={(e) => setInputPagina(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Boton
                  variante="primary"
                  onClick={handleIrAPagina}
                  tamaño="small"
                >
                  Ir
                </Boton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
