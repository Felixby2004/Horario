'use client';

import { useState, useEffect } from 'react';
import { obtenerEtiquetaCarreraCurso, obtenerCodigoTipoCurso } from '@/lib/cursos';
import { formatearTextoVisualOracion } from '@/lib/formatoTexto';

export default function PlanEstudiosDocentePage() {
  const [activeTab, setActiveTab] = useState('malla');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plan de Estudios</h1>
        <p className="text-gray-600 mt-2">Consulta del plan de estudios de la Escuela de Ingeniería de Sistemas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('malla')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'malla'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Malla Curricular
          </button>
          <button
            onClick={() => setActiveTab('cursos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cursos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Buscador de Cursos
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'malla' && <MallaCurricular />}
      {activeTab === 'cursos' && <BuscadorCursos />}
    </div>
  );
}

function MallaCurricular() {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPlan();
  }, []);

  const cargarPlan = async () => {
    try {
      const response = await fetch('/api/cursos/plan-estudios');
      const data = await response.json();
      if (data.exito) setPlan(data.datos);
    } catch (error) {
      console.error('Error cargando plan de estudios:', error);
    } finally {
      setLoading(false);
    }
  };

  const ciclos = [...new Set(plan.map(c => c.ciclo))].sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando malla curricular...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Malla Curricular - Ingeniería de Sistemas</h2>
        
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${ciclos.length}, minmax(200px, 1fr))`, gap: '1rem' }}>
              {ciclos.map(ciclo => (
                <div key={ciclo} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                    Ciclo {ciclo}
                  </div>
                  <div className="space-y-3">
                    {plan.filter(c => c.ciclo === ciclo).map(curso => (
                      <div key={curso.id_curso} className="bg-white rounded p-3 border shadow-sm">
                        <div className="font-medium text-sm text-gray-900">{curso.codigo}</div>
                        <div className="text-xs text-gray-600 mt-1">{formatearTextoVisualOracion(curso.nombre)}</div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {obtenerCodigoTipoCurso(curso.tipo_curso)} • {obtenerEtiquetaCarreraCurso(curso.departamento?.nombre || curso.escuela_profesional)}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>{(curso.horas_teoria || 0) + (curso.horas_practica || 0) + (curso.horas_laboratorio || 0)}h</span>
                          <span>{curso.creditos}cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuscadorCursos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCiclo, setSelectedCiclo] = useState('todos');
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPlan();
  }, []);

  const cargarPlan = async () => {
    try {
      const response = await fetch('/api/cursos/plan-estudios');
      const data = await response.json();
      if (data.exito) setPlan(data.datos);
    } catch (error) {
      console.error('Error cargando plan de estudios:', error);
    } finally {
      setLoading(false);
    }
  };

  const ciclos = ['todos', ...new Set(plan.map(c => c.ciclo))].sort((a, b) => {
    if (a === 'todos') return -1;
    if (b === 'todos') return 1;
    return a - b;
  });

  const filteredCursos = plan.filter((curso) => {
    const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          curso.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCiclo = selectedCiclo === 'todos' || curso.ciclo === parseInt(selectedCiclo);
    return matchesSearch && matchesCiclo;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando cursos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Curso</label>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Ciclo</label>
            <select
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ciclos.map((ciclo) => (
                <option key={ciclo} value={ciclo}>
                  {ciclo === 'todos' ? 'Todos los Ciclos' : `${ciclo}° Ciclo`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Resultados ({filteredCursos.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciclo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H. Teoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H. Práctica</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H. Laboratorio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCursos.map((curso) => (
                <tr key={curso.id_curso} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{curso.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearTextoVisualOracion(curso.nombre)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{obtenerCodigoTipoCurso(curso.tipo_curso)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{obtenerEtiquetaCarreraCurso(curso.departamento?.nombre || curso.escuela_profesional)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{curso.ciclo}°</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{curso.creditos}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{curso.horas_teoria || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{curso.horas_practica || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{curso.horas_laboratorio || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
