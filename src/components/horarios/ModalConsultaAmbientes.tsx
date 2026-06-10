import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { utilidadesFecha } from '@/lib/utilidadesFecha';

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
  horas?: { inicio: string; fin: string }[];
  actividadesNoLectivas?: any[];
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const ModalConsultaAmbientes: React.FC<ModalConsultaAmbientesProps> = ({
  abierto,
  alCerrar,
  tipo,
  ambientes,
  horarios,
  horas: propsHoras,
  actividadesNoLectivas = []
}) => {
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState<Ambiente | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [horas, setHoras] = useState<{ inicio: string; fin: string }[]>([]);

  // Load config when modal opens
  useEffect(() => {
    if (abierto) {
      fetch('/api/configuracion')
        .then(res => res.json())
        .then(data => {
          if (data.exito && data.datos) {
            setConfig(data.datos);
            const intervalos = utilidadesFecha.generarIntervalosHorarios(
              data.datos.hora_inicio,
              data.datos.hora_fin,
              data.datos.duracion_bloque
            );
            setHoras(intervalos);
          }
        })
        .catch(err => console.error('Error loading config:', err));
    }
  }, [abierto]);

  // If propsHoras are provided, use those
  useEffect(() => {
    if (propsHoras) {
      setHoras(propsHoras);
    }
  }, [propsHoras]);

  const ambientesFiltrados = ambientes.filter(a => 
    tipo === 'aula' ? a.tipo === 'aula' : a.tipo === 'laboratorio'
  );

  const obtenerHorariosAmbiente = (idAmbiente: number) => {
    return horarios.filter(h => h.id_ambiente === idAmbiente);
  };

  const obtenerActividadesNoLectivasAmbiente = (idAmbiente: number) => {
    return actividadesNoLectivas.filter(act => act.datos_sustento?.id_ambiente === idAmbiente);
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
                    {horas.map((hora, hIdx) => (
                      <tr key={hIdx}>
                        <td className="border p-1 font-medium bg-gray-50">
                          {hora.inicio}
                          <br />
                          {hora.fin}
                        </td>
                        {DIAS.map((_, dIdx) => {
                          const hAmb = obtenerHorariosAmbiente(ambienteSeleccionado.id_ambiente);
                          const actividadesAmb = obtenerActividadesNoLectivasAmbiente(ambienteSeleccionado.id_ambiente);
                          
                          const asignacionesLectivas = hAmb.filter(h => 
                            h.dia_semana === dIdx && h.hora_inicio === hora.inicio
                          );
                          
                          const asignacionesNoLectivas = actividadesAmb.filter(act =>
                            act.horarios_actividad?.some((h: any) =>
                              DIAS.indexOf(h.dia) === dIdx && h.inicio === hora.inicio
                            )
                          );
                          
                          const estaOcupado = asignacionesLectivas.length > 0 || asignacionesNoLectivas.length > 0;

                          return (
                            <td 
                              key={dIdx} 
                              className={`border p-1 h-12 min-w-[80px] overflow-hidden ${
                                estaOcupado ? 'bg-red-50' : 'bg-green-50'
                              }`}
                            >
                              {estaOcupado ? (
                                <div className="flex flex-col gap-1">
                                  {asignacionesLectivas.map(asig => (
                                    <div key={asig.id_asignacion} className="text-red-700 leading-tight">
                                      <div className="font-bold">{asig.curso?.codigo}</div>
                                      <div>{asig.docente?.apellidos}</div>
                                      <div className="text-[8px] italic">Ciclo {asig.curso?.ciclo}</div>
                                    </div>
                                  ))}
                                  {asignacionesNoLectivas.map(asig => (
                                    <div key={asig.id_actividad} className="text-orange-700 leading-tight">
                                      <div className="font-bold">{asig.tipo_actividad?.replace(/_/g, ' ')}</div>
                                      <div>{asig.nombre}</div>
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
