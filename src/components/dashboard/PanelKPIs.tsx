'use client';

import { useEffect, useState } from 'react';

interface KPI {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
}

export const PanelKPIs: React.FC<{ idPeriodo: number }> = ({ idPeriodo }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarKPIs();
  }, [idPeriodo]);

  const cargarKPIs = async () => {
    try {
      const response = await fetch(`/api/estadisticas/resumen?periodo=${idPeriodo}`);
      const data = await response.json();

      if (data.exito) {
        const stats = data.datos;
        setKpis([
          {
            titulo: 'Docentes con Horario',
            valor: stats.total_docentes_con_horario || 0,
            icono: '👨‍🏫',
            color: 'bg-blue-500'
          },
          {
            titulo: 'Cursos Programados',
            valor: stats.total_cursos_programados || 0,
            icono: '📚',
            color: 'bg-green-500'
          },
          {
            titulo: 'Ambientes en Uso',
            valor: stats.total_ambientes_utilizados || 0,
            icono: '🏫',
            color: 'bg-purple-500'
          },
          {
            titulo: 'Horas Asignadas',
            valor: Math.round(stats.total_horas_asignadas || 0),
            icono: '⏰',
            color: 'bg-orange-500'
          },
          {
            titulo: 'Grupos',
            valor: stats.total_grupos || 0,
            icono: '👥',
            color: 'bg-pink-500'
          },
          {
            titulo: 'Bloques Asignados',
            valor: stats.total_bloques_asignados || 0,
            icono: '📊',
            color: 'bg-yellow-500'
          }
        ]);
      }
    } catch (error) {
      console.error('Error cargando KPIs:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className={`${kpi.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3`}>
            {kpi.icono}
          </div>
          <div className="text-3xl font-bold text-gray-900">{kpi.valor}</div>
          <div className="text-sm text-gray-600 mt-1">{kpi.titulo}</div>
        </div>
      ))}
    </div>
  );
};
