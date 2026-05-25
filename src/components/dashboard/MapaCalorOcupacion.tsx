'use client';

import { useEffect, useState } from 'react';

export const MapaCalorOcupacion: React.FC<{ idPeriodo: number }> = ({ idPeriodo }) => {
  const [datos, setDatos] = useState<any[][]>([]);
  const [cargando, setCargando] = useState(true);

  const dias = ['L', 'M', 'X', 'J', 'V'];
  const bloques = Array.from({ length: 10 }, (_, i) => `B${i + 1}`);

  useEffect(() => {
    cargarDatos();
  }, [idPeriodo]);

  const cargarDatos = async () => {
    try {
      const response = await fetch(`/api/estadisticas/mapa-calor?periodo=${idPeriodo}`);
      const data = await response.json();
      if (data.exito) {
        setDatos(data.datos || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerColor = (porcentaje: number) => {
    if (porcentaje >= 80) return 'bg-red-500';
    if (porcentaje >= 60) return 'bg-orange-400';
    if (porcentaje >= 40) return 'bg-yellow-300';
    if (porcentaje >= 20) return 'bg-green-300';
    return 'bg-blue-200';
  };

  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;



  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Mapa de Calor - Ocupación</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2"></th>
              {dias.map(dia => (
                <th key={dia} className="border p-2 text-sm">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloques.map((bloque, i) => (
              <tr key={bloque}>
                <td className="border p-2 text-sm font-medium">{bloque}</td>
                {dias.map((dia, j) => {
                  const valor = datos[i]?.[j] || 0;
                  return (
                    <td key={`${dia}-${bloque}`} className="border p-0">
                      <div
                        className={`h-12 flex items-center justify-center text-sm font-semibold ${obtenerColor(valor)}`}
                        title={`${valor}% ocupado`}
                      >
                        {valor}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <span>Leyenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200"></div>
          <span>0-20%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300"></div>
          <span>20-40%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300"></div>
          <span>40-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400"></div>
          <span>60-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>80-100%</span>
        </div>
      </div>
    </div>
  );
};
