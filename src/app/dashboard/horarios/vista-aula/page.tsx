'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
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

export default function VistaAulaPage() {
  const { alertas, eliminarAlerta, error } = useAlertasTemporales();

  const [horas, setHoras] = useState<string[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState<any>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resAmbientes, resConfig] = await Promise.all([
        fetch('/api/ambientes?tipo=aula'),
        fetch('/api/configuracion')
      ]);

      const [dataAmbientes, dataConfig] = await Promise.all([
        resAmbientes.json(),
        resConfig.json()
      ]);

      if (dataAmbientes.exito) setAmbientes(dataAmbientes.datos);

      if (dataConfig.exito && dataConfig.datos) {
        setConfig(dataConfig.datos);
        const { utilidadesFecha } = await import('@/lib/utilidadesFecha');
        const intervalos = utilidadesFecha.generarIntervalosHorarios(
          dataConfig.datos.hora_inicio,
          dataConfig.datos.hora_fin,
          dataConfig.datos.duracion_bloque
        );
        setHoras(intervalos.map(i => i.inicio));
      } else {
        setHoras(['07:00', '08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30']);
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const cargarHorarios = async (idAmbiente: number) => {
    setCargando(true);
    try {
      const response = await fetch(`/api/horarios?ambiente=${idAmbiente}`);
      const data = await response.json();
      if (data.exito) setHorarios(data.datos || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    if (!ambienteSeleccionado) return;

    try {
      const response = await fetch('/api/reportes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'aula',
          id_entidad: ambienteSeleccionado.id_ambiente,
          id_periodo: 1
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horario-${ambienteSeleccionado.codigo}.pdf`;
      a.click();
    } catch (err) {
      alert('Error al generar PDF');
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🏫 Horarios por Aula</h1>
            <p className="text-gray-600">Visualiza horarios de aulas</p>
          </div>
          {ambienteSeleccionado && (
            <Boton onClick={descargarPDF}>📥 Descargar PDF</Boton>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium mb-2">Seleccionar Aula</label>
          <select
            value={ambienteSeleccionado?.id_ambiente || ''}
            onChange={(e) => {
              const ambiente = ambientes.find((a: any) => a.id_ambiente === parseInt(e.target.value));
              setAmbienteSeleccionado(ambiente);
              if (ambiente) cargarHorarios(ambiente.id_ambiente);
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Seleccionar --</option>
            {ambientes.map((a: any) => (
              <option key={a.id_ambiente} value={a.id_ambiente}>
                {a.codigo} - {a.nombre} (Capacidad: {a.capacidad})
              </option>
            ))}
          </select>
        </div>

        {ambienteSeleccionado && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {ambienteSeleccionado.codigo} - {ambienteSeleccionado.nombre}
            </h2>
            <MatrizHoraria horarios={horarios} horas={horas} />
          </div>
        )}
      </div>
    </div>
  );
}

function MatrizHoraria({ horarios, horas }: { horarios: Horario[]; horas: string[] }) {
  if (horarios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay horarios para esta aula</p>
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
              <th key={dia} className="border p-2 text-center font-bold bg-primary-100">{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map(hora => (
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
