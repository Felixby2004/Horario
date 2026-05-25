'use client';

import { useState, useEffect } from 'react';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';

interface Horario {
  id_asignacion: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  docente: {
    codigo_docente: string;
    nombres: string;
    apellidos: string;
  };
  curso: {
    codigo: string;
    nombre: string;
    ciclo: number;
  };
  grupo: {
    codigo_grupo: string;
  };
  ambiente: {
    codigo: string;
    nombre: string;
  };
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = [
  '07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'
];

export default function VistaPorCicloPage() {
  const { alertas, eliminarAlerta, error } = useAlertasTemporales();

  const [ciclos, setCiclos] = useState<any[]>([]);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<number>(1);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarHorarios();
  }, []);

  useEffect(() => {
    if (cicloSeleccionado && horarios.length > 0) {
      // Agrupar por ciclo
      const ciclosMap = new Map<number, Horario[]>();
      horarios.forEach(h => {
        const ciclo = h.curso?.ciclo || 0;
        if (!ciclosMap.has(ciclo)) ciclosMap.set(ciclo, []);
        ciclosMap.get(ciclo)!.push(h);
      });

      const ciclosArray = Array.from(ciclosMap.keys()).sort((a, b) => a - b);
      setCiclos(ciclosArray);

      if (ciclosArray.length > 0 && !ciclosArray.includes(cicloSeleccionado)) {
        setCicloSeleccionado(ciclosArray[0]);
      }
    }
  }, [horarios]);

  const cargarHorarios = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/horarios');
      const data = await res.json();

      if (data.exito) {
        setHorarios(data.datos || []);
      } else {
        error('Error', data.error || 'No se pudieron cargar los horarios');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const horariosFiltrados = horarios.filter(h => h.curso?.ciclo === cicloSeleccionado);

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🎓 Vista por Ciclo</h1>

          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un ciclo:</label>
            <select
              value={cicloSeleccionado}
              onChange={(e) => setCicloSeleccionado(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {ciclos.map(ciclo => (
                <option key={ciclo} value={ciclo}>Ciclo {ciclo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">Ciclo {cicloSeleccionado}</h2>
          <MatrizHoraria horarios={horariosFiltrados} />
        </div>
      </div>
    </div>
  );
}

function MatrizHoraria({ horarios }: { horarios: Horario[] }) {
  if (horarios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay horarios para este ciclo</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Hora</th>
            {DIAS.map(dia => (
              <th key={dia} className="border p-2 text-center font-bold">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map(hora => (
            <tr key={hora}>
              <td className="border p-2 font-bold text-gray-700 bg-gray-50">{hora}</td>
              {DIAS.map((dia, diaIdx) => {
                const items = horarios.filter(
                  h => h.dia_semana === diaIdx && h.hora_inicio === hora
                );
                return (
                  <td key={`${hora}-${dia}`} className="border p-2 text-center bg-white">
                    {items.length > 0 ? (
                      <div className="space-y-1">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-1 bg-blue-100 text-blue-900 rounded text-xs font-semibold"
                          >
                            <div className="font-bold">{item.curso?.codigo}</div>
                            <div>{item.grupo?.codigo_grupo}</div>
                            <div className="text-xs">{item.docente?.apellidos}</div>
                            <div className="text-xs">{item.ambiente?.codigo}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
