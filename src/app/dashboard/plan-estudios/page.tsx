'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

const tabs = [
  { id: 'cursos', name: 'Cursos por Ciclo' },
  { id: 'malla', name: 'Malla Curricular' },
  { id: 'gestion', name: 'Gestión del Plan' }
];

export default function PlanEstudiosPage() {
  const [activeTab, setActiveTab] = useState('cursos');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plan de Estudios</h1>
        <p className="text-gray-600 mt-2">Gestión y visualización del plan de estudios de la Escuela de Ingeniería de Sistemas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('cursos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cursos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cursos por Ciclo
          </button>
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
            onClick={() => setActiveTab('gestion')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gestion'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gestión del Plan
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'cursos' && <CursosPorCiclo />}
      {activeTab === 'malla' && <MallaCurricular />}
      {activeTab === 'gestion' && <GestionPlan />}
    </div>
  );
}

function CursosPorCiclo() {
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
        <div className="text-gray-500">Cargando plan de estudios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ciclos.map(ciclo => {
        const cursosCiclo = plan.filter(c => c.ciclo === ciclo);
        const totalCreditos = cursosCiclo.reduce((sum, c) => sum + c.creditos, 0);
        const totalTeoria = cursosCiclo.reduce((sum, c) => sum + (c.horas_teoria || 0), 0);
        const totalPractica = cursosCiclo.reduce((sum, c) => sum + (c.horas_practica || 0), 0);
        const totalLaboratorio = cursosCiclo.reduce((sum, c) => sum + (c.horas_laboratorio || 0), 0);

        return (
          <div key={ciclo} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ciclo {ciclo}</h2>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>Teoría: {totalTeoria}h</span>
                <span>Práctica: {totalPractica}h</span>
                <span>Lab: {totalLaboratorio}h</span>
                <span className="font-bold text-blue-600">Total: {totalCreditos} créditos</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cursosCiclo.map(curso => (
                <div key={curso.id_curso} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="font-medium text-gray-900">{curso.codigo} - {curso.nombre}</div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Teoría: {curso.horas_teoria}h</span>
                    <span>Práctica: {curso.horas_practica}h</span>
                    <span>Lab: {curso.horas_laboratorio}h</span>
                    <span className="font-medium">{curso.creditos} créditos</span>
                  </div>
                  {curso.prerequisitos && (
                    <div className="mt-2 text-xs text-gray-400">
                      Prerrequisitos: {curso.prerequisitos}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
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
                        <div className="text-xs text-gray-600 mt-1">{curso.nombre}</div>
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

function GestionPlan() {
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

  const totalCursos = plan.length;
  const totalCreditos = plan.reduce((sum, c) => sum + c.creditos, 0);
  const ciclos = [...new Set(plan.map(c => c.ciclo))].length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Cursos</h3>
          <p className="text-3xl font-bold text-blue-600">{totalCursos}</p>
          <p className="text-sm text-gray-500 mt-1">Cursos en el plan de estudios</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Créditos</h3>
          <p className="text-3xl font-bold text-green-600">{totalCreditos}</p>
          <p className="text-sm text-gray-500 mt-1">Créditos totales del plan</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ciclos</h3>
          <p className="text-3xl font-bold text-purple-600">{ciclos}</p>
          <p className="text-sm text-gray-500 mt-1">Ciclos del plan de estudios</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Versión</h3>
          <p className="text-3xl font-bold text-orange-600">2026</p>
          <p className="text-sm text-gray-500 mt-1">Versión del plan de estudios</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Acciones de Gestión</h2>
          <Boton>✏️ Editar Plan</Boton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
            <div className="text-2xl mb-2">📤</div>
            <h3 className="font-semibold text-gray-900">Importar Plan de Estudios</h3>
            <p className="text-sm text-gray-500">Cargar el plan desde un archivo Excel o CSV</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
            <div className="text-2xl mb-2">📥</div>
            <h3 className="font-semibold text-gray-900">Exportar Plan de Estudios</h3>
            <p className="text-sm text-gray-500">Descargar el plan en formato Excel o PDF</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900">Editar Información del Plan</h3>
            <p className="text-sm text-gray-500">Modificar datos generales del plan de estudios</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold text-gray-900">Historial de Versiones</h3>
            <p className="text-sm text-gray-500">Ver cambios y versiones anteriores del plan</p>
          </button>
        </div>
      </div>
    </div>
  );
}
