'use client';

import { useState, useEffect } from 'react';

interface CeldaHorario {
  dia: string;
  bloque: number;
  hora_inicio: string;
  hora_fin: string;
  ocupado: boolean;
  horarios: any[];
  temporal?: boolean;
}

interface MatrizDisponibilidadProps {
  idDocente: number;
  idPeriodo: number;
  tipoClaseSeleccionada?: string;
  alSeleccionar?: (celda: CeldaHorario) => void;
}

export const MatrizDisponibilidad: React.FC<MatrizDisponibilidadProps> = ({
  idDocente,
  idPeriodo,
  tipoClaseSeleccionada = 'teoria',
  alSeleccionar
}) => {
  const [matriz, setMatriz] = useState<CeldaHorario[][]>([]);
  const [cargando, setCargando] = useState(true);

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const bloques = [
    { bloque: 1, hora_inicio: '07:00', hora_fin: '08:30' },
    { bloque: 2, hora_inicio: '08:30', hora_fin: '10:00' },
    { bloque: 3, hora_inicio: '10:00', hora_fin: '11:30' },
    { bloque: 4, hora_inicio: '11:30', hora_fin: '13:00' },
    { bloque: 5, hora_inicio: '13:00', hora_fin: '14:30' },
    { bloque: 6, hora_inicio: '14:30', hora_fin: '16:00' },
    { bloque: 7, hora_inicio: '16:00', hora_fin: '17:30' },
    { bloque: 8, hora_inicio: '17:30', hora_fin: '19:00' },
    { bloque: 9, hora_inicio: '19:00', hora_fin: '20:30' },
    { bloque: 10, hora_inicio: '20:30', hora_fin: '22:00' }
  ];

  useEffect(() => {
    cargarDisponibilidad();
  }, [idDocente, idPeriodo, tipoClaseSeleccionada]);

  const cargarDisponibilidad = async () => {
    try {
      const response = await fetch(
        `/api/horarios/disponibilidad-matriz?docente=${idDocente}&periodo=${idPeriodo}`
      );
      const data = await response.json();
      
      if (data.exito) {
        const matrizData = dias.map(dia =>
          bloques.map(bloque => {
            const horariosEnBloque = data.datos.filter((h: any) => 
              h.dia === dia && h.bloque === bloque.bloque
            );

            // REGLA DE OCUPACIÓN:
            // 1. Si hay teoría -> BLOQUEADO
            // 2. Si hay 2 o más laboratorios/prácticas -> BLOQUEADO
            // 3. Si hay 1 laboratorio y queremos poner teoría -> BLOQUEADO
            // 4. Si hay 1 laboratorio y queremos poner otro laboratorio -> DISPONIBLE
            
            const tieneTeoria = horariosEnBloque.some((h: any) => h.tipo_clase === 'teoria');
            const numLabPractica = horariosEnBloque.filter((h: any) => 
              h.tipo_clase === 'laboratorio' || h.tipo_clase === 'practica'
            ).length;

            let ocupado = false;
            if (tieneTeoria) ocupado = true;
            else if (numLabPractica >= 2) ocupado = true;
            else if (numLabPractica === 1 && tipoClaseSeleccionada === 'teoria') ocupado = true;

            return {
              dia,
              bloque: bloque.bloque,
              hora_inicio: bloque.hora_inicio,
              hora_fin: bloque.hora_fin,
              ocupado,
              horarios: horariosEnBloque,
              temporal: false
            };
          })
        );
        setMatriz(matrizData);
      }
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleClick = (celda: CeldaHorario) => {
    if (!celda.ocupado && alSeleccionar) {
      alSeleccionar(celda);
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">Hora</th>
            {dias.map(dia => (
              <th key={dia} className="border p-2 bg-primary-100 text-primary-900">
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloques.map((bloque, indexBloque) => (
            <tr key={bloque.bloque}>
              <td className="border p-2 bg-gray-50 text-sm">
                <div className="font-semibold text-xs">Bloque {bloque.bloque}</div>
                <div className="text-[10px] text-gray-600">
                  {bloque.hora_inicio} - {bloque.hora_fin}
                </div>
              </td>
              {dias.map((dia, indexDia) => {
                const celda = matriz[indexDia]?.[indexBloque];
                const tieneHorarios = celda?.horarios && celda.horarios.length > 0;
                
                return (
                  <td
                    key={`${dia}-${bloque.bloque}`}
                    className={`border p-0 cursor-pointer transition-colors min-w-[120px] ${
                      celda?.ocupado
                        ? 'bg-red-50 cursor-not-allowed'
                        : celda?.temporal
                        ? 'bg-yellow-100'
                        : tieneHorarios 
                        ? 'bg-blue-50 hover:bg-blue-100' // Caso: 1 lab ya puesto, se puede poner otro
                        : 'bg-green-50 hover:bg-green-100'
                    }`}
                    onClick={() => celda && handleClick(celda)}
                  >
                    <div className="min-h-[60px] flex flex-col items-center justify-center p-1">
                      {tieneHorarios ? (
                        <div className="w-full space-y-1">
                          {celda.horarios.map((h, i) => (
                            <div key={i} className="text-[9px] bg-white border border-blue-200 rounded p-1 leading-tight">
                              <div className="font-bold text-blue-800 uppercase">{h.tipo_clase}</div>
                              <div className="truncate">{h.curso}</div>
                              <div className="text-gray-500">Ciclo {h.ciclo}</div>
                            </div>
                          ))}
                          {!celda.ocupado && (
                            <div className="text-[10px] text-blue-600 font-bold text-center mt-1 animate-pulse">
                              + AGREGAR OTRO
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-lg">{celda?.temporal ? '⏳' : '+'}</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
