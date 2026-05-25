'use client';

import { useState, useEffect } from 'react';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

interface Citacion {
  id_citacion: number;
  id_docente: number;
  fecha_citacion: string;
  hora_inicio: string;
  hora_fin: string;
  numero_orden_turno: number;
  estado: string;
  docente: {
    nombres: string;
    apellidos: string;
    codigo_docente: string;
    categoria: string;
  };
  ventana: {
    fecha: string;
  };
}

interface Periodo {
  id_periodo: number;
  nombre: string;
  activo: boolean;
}

export default function GestionCitacionesPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [citaciones, setCitaciones] = useState<Citacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoSeleccionado) {
      cargarCitaciones(periodoSeleccionado);
    }
  }, [periodoSeleccionado]);

  const cargarPeriodos = async () => {
    try {
      const res = await fetch('/api/periodos');
      const data = await res.json();
      if (data.exito) {
        setPeriodos(data.datos || []);
        const activo = data.datos?.find((p: any) => p.activo);
        if (activo) setPeriodoSeleccionado(activo.id_periodo);
      }
    } catch (error) {
      console.error('Error cargando períodos:', error);
    }
  };

  const cargarCitaciones = async (idPeriodo: number) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/citaciones?idPeriodo=${idPeriodo}`);
      if (res.ok) {
        const data = await res.json();
        setCitaciones(data);
      }
    } catch (error) {
      console.error('Error cargando citaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async (idCitacion: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/citaciones/${idCitacion}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.ok) {
        cargarCitaciones(periodoSeleccionado!);
      } else {
        alert('Error al cambiar el estado');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleEliminarCitacion = async (idCitacion: number) => {
    if (!confirm('¿Está seguro de eliminar esta citación?')) return;

    try {
      const res = await fetch(`/api/citaciones/${idCitacion}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setCitaciones(citaciones.filter(c => c.id_citacion !== idCitacion));
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const citacionesFiltradas = citaciones.filter(c => {
    const matchBusqueda = `${c.docente.nombres} ${c.docente.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
                         c.docente.codigo_docente.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria === '' || c.docente.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    const matchEstado = filtroEstado === '' || c.estado === filtroEstado;
    
    return matchBusqueda && matchCategoria && matchEstado;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📋 Gestión de Citaciones</h1>
            <p className="text-gray-600">Administre los turnos de atención asignados a los docentes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">📅 Período</label>
              <select
                value={periodoSeleccionado || ''}
                onChange={(e) => setPeriodoSeleccionado(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccione un período</option>
                {periodos.map(p => (
                  <option key={p.id_periodo} value={p.id_periodo}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-semibold text-gray-700 mb-1">🔍 Buscar Docente</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, apellido o código..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => cargarCitaciones(periodoSeleccionado!)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold border border-gray-300 transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                <option value="principal">Principal</option>
                <option value="asociado">Asociado</option>
                <option value="auxiliar">Auxiliar</option>
                <option value="jefe_practica">Jefe de Práctica</option>
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos</option>
                <option value="programada">Programada</option>
                <option value="confirmada_docente">Confirmada</option>
                <option value="rechazada">Rechazada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex-1 flex justify-end items-end">
              <button
                onClick={() => {
                  setBusqueda('');
                  setFiltroCategoria('');
                  setFiltroEstado('');
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Docente</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Horario</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Turno</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando citaciones...</td></tr>
              ) : citacionesFiltradas.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No se encontraron citaciones</td></tr>
              ) : (
                citacionesFiltradas.map((c) => (
                  <tr key={c.id_citacion} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{c.docente.nombres} {c.docente.apellidos}</p>
                      <p className="text-xs text-gray-500">{c.docente.codigo_docente} • {c.docente.categoria}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {utilidadesFecha.formatearFechaBD(c.fecha_citacion)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-indigo-600 font-semibold">
                      {c.hora_inicio} - {c.hora_fin}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                        #{c.numero_orden_turno}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        c.estado === 'confirmada_docente' ? 'bg-green-100 text-green-700' :
                        c.estado === 'programada' ? 'bg-blue-100 text-blue-700' :
                        c.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {c.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <select
                          className="text-xs border border-gray-300 rounded px-1 py-1"
                          value={c.estado}
                          onChange={(e) => handleCambiarEstado(c.id_citacion, e.target.value)}
                        >
                          <option value="programada">Programada</option>
                          <option value="confirmada_docente">Confirmada</option>
                          <option value="rechazada">Rechazada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                        <button
                          onClick={() => handleEliminarCitacion(c.id_citacion)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar citación"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
