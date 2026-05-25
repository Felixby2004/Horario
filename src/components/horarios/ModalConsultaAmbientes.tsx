import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface Ambiente {
  id_ambiente: number;
  nombre: string;
  codigo: string;
  tipo: string;
  capacidad: number;
}

interface ModalConsultaAmbientesProps {
  abierto: boolean;
  alCerrar: () => void;
  tipo: 'aula' | 'laboratorio';
  ambientes: Ambiente[];
  horarios: any[];
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = [
  '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'
];

export const ModalConsultaAmbientes: React.FC<ModalConsultaAmbientesProps> = ({
  abierto,
  alCerrar,
  tipo,
  ambientes,
  horarios
}) => {
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState<Ambiente | null>(null);

  const ambientesFiltrados = ambientes.filter(a => 
    tipo === 'aula' ? a.tipo === 'aula' : a.tipo === 'laboratorio'
  );

  const obtenerHorariosAmbiente = (idAmbiente: number) => {
    return horarios.filter(h => h.id_ambiente === idAmbiente);
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={`Consulta de disponibilidad: ${tipo === 'aula' ? 'Aulas (Teoría)' : 'Laboratorios (Práctica)'}`}
      tamaño="xl"
    >
      <div className="flex gap-4 h-[600px]">
        {/* Lista de Ambientes */}
        <div className="w-1/3 border-r pr-4 overflow-y-auto">
          <h4 className="font-semibold mb-2 text-gray-700">Seleccione un ambiente:</h4>
          <div className="space-y-2">
            {ambientesFiltrados.map(a => (
              <button
                key={a.id_ambiente}
                onClick={() => setAmbienteSeleccionado(a)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  ambienteSeleccionado?.id_ambiente === a.id_ambiente
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="font-bold">{a.nombre}</div>
                <div className="text-xs text-gray-500">Código: {a.codigo} | Cap: {a.capacidad}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Matriz de Disponibilidad */}
        <div className="w-2/3 flex flex-col">
          {ambienteSeleccionado ? (
            <>
              <div className="mb-4">
                <h4 className="font-bold text-lg">{ambienteSeleccionado.nombre}</h4>
                <p className="text-sm text-gray-600">Disponibilidad semanal para el período actual</p>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr>
                      <th className="border p-1 bg-gray-50 sticky top-0">Hora</th>
                      {DIAS.map(dia => (
                        <th key={dia} className="border p-1 bg-gray-50 sticky top-0">{dia}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORAS.map((hora, hIdx) => (
                      <tr key={hora}>
                        <td className="border p-1 font-medium bg-gray-50">{hora}</td>
                        {DIAS.map((_, dIdx) => {
                          const hAmb = obtenerHorariosAmbiente(ambienteSeleccionado.id_ambiente);
                          const asignaciones = hAmb.filter(h => 
                            h.dia_semana === dIdx && h.hora_inicio === hora
                          );

                          return (
                            <td 
                              key={dIdx} 
                              className={`border p-1 h-12 min-w-[80px] ${
                                asignaciones.length > 0 ? 'bg-red-50' : 'bg-green-50'
                              }`}
                            >
                              {asignaciones.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {asignaciones.map(asig => (
                                    <div key={asig.id_asignacion} className="text-red-700 leading-tight">
                                      <div className="font-bold">{asig.curso?.codigo}</div>
                                      <div>{asig.docente?.apellidos}</div>
                                      <div className="text-[8px] italic">Ciclo {asig.curso?.ciclo}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-green-600 text-center font-bold">Libres</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 border-2 border-dashed rounded-lg">
              Seleccione un ambiente de la lista para ver su disponibilidad
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
