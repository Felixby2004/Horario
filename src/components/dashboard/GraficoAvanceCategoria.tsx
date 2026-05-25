'use client';

import { useEffect, useState } from 'react';

export const GraficoAvanceCategoria: React.FC<{ idPeriodo: number }> = ({ idPeriodo }) => {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [idPeriodo]);

  const cargarDatos = async () => {
    try {
      const response = await fetch(`/api/estadisticas/avance-categoria?periodo=${idPeriodo}`);
      const data = await response.json();

      if (data.exito) {
        setDatos(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Avance por Categoría Docente</h3>
      <div className="space-y-4">
        {datos.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <span className="font-medium">
                {item.modalidad} - {item.categoria}
              </span>
              <span className="text-sm text-gray-600">
                {item.docentes_con_horario}/{item.total_docentes} ({item.porcentaje_avance}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all"
                style={{ width: `${item.porcentaje_avance}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
