import React, { useState, useEffect } from 'react';

interface BloqueTiempo {
  id: string;
  horario: string;
  disponible: boolean;
}

interface MatrizDisponibilidadProps {
  bloquesTiempo: number; // en minutos
  horaInicio: string;
  horaFin: string;
  onSeleccion: (matriz: Record<string, boolean[]>) => void;
  matrizInicial?: Record<string, boolean[]>;
}

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export default function MatrizDisponibilidad({
  bloquesTiempo,
  horaInicio,
  horaFin,
  onSeleccion,
  matrizInicial
}: MatrizDisponibilidadProps) {
  const [matriz, setMatriz] = useState<Record<string, boolean[]>>({});

  // Inicializar matriz
  useEffect(() => {
    const nuevaMatriz: Record<string, boolean[]> = {};
    
    // Generar bloques de tiempo
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    
    const minutoInicio = hInicio * 60 + mInicio;
    const minutoFin = hFin * 60 + mFin;
    
    const numBloques = Math.ceil((minutoFin - minutoInicio) / bloquesTiempo);

    DIAS_SEMANA.forEach(dia => {
      // Por defecto todo en false (No disponible) para que el docente seleccione
      nuevaMatriz[dia] = matrizInicial?.[dia] || Array(numBloques).fill(false);
    });

    setMatriz(nuevaMatriz);
    onSeleccion(nuevaMatriz);
  }, [bloquesTiempo, horaInicio, horaFin, matrizInicial, onSeleccion]);

  const handleToggleBloque = (dia: string, indiceBloque: number) => {
    const nuevaMatriz = { ...matriz };
    nuevaMatriz[dia][indiceBloque] = !nuevaMatriz[dia][indiceBloque];
    setMatriz(nuevaMatriz);
    onSeleccion(nuevaMatriz);
  };

  // Generar horas para el header
  const generarHoras = () => {
    const horas: string[] = [];
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    
    let minActual = hInicio * 60 + mInicio;
    const minFinal = hFin * 60 + mFin;

    while (minActual <= minFinal) {
      const h = Math.floor(minActual / 60);
      const m = minActual % 60;
      horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      minActual += bloquesTiempo;
    }

    return horas;
  };

  const horas = generarHoras();

  return (
    <div className="w-full overflow-x-auto">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Matriz de Disponibilidad
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Haga clic en los bloques para marcar su <strong>disponibilidad</strong>. 
          Por defecto, todos los bloques están marcados como <strong>No disponible (✗)</strong>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-100 p-2 text-left font-semibold text-sm border">
                  Día
                </th>
                {horas.map((hora, idx) => (
                  <th
                    key={idx}
                    className="bg-gray-100 p-2 text-center font-semibold text-sm border"
                  >
                    {hora}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIAS_SEMANA.map(dia => (
                <tr key={dia}>
                  <td className="bg-gray-50 p-2 font-medium text-sm border capitalize">
                    {dia}
                  </td>
                  {matriz[dia]?.map((disponible, idx) => (
                    <td
                      key={`${dia}-${idx}`}
                      className="p-2 border text-center"
                      onClick={() => handleToggleBloque(dia, idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <button
                        className={`w-full h-8 rounded transition-colors ${
                          disponible
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        title={disponible ? 'Disponible' : 'No disponible'}
                      >
                        {disponible ? '✓' : '✗'}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="inline-block w-4 h-4 bg-green-500 mr-2 rounded"></span>
            Disponible
          </p>
          <p>
            <span className="inline-block w-4 h-4 bg-gray-200 mr-2 rounded"></span>
            No disponible
          </p>
        </div>
      </div>
    </div>
  );
}
