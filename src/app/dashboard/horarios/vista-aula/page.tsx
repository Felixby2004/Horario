'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

export default function VistaAulaPage() {
  const [ambientes, setAmbientes] = useState([]);
  const [ambienteSeleccionado, setAmbienteSeleccionado] = useState<any>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarAmbientes();
  }, []);

  const cargarAmbientes = async () => {
    try {
      const response = await fetch('/api/ambientes?tipo=aula');
      const data = await response.json();
      if (data.exito) setAmbientes(data.datos);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarHorarios = async (idAmbiente: number) => {
    setCargando(true);
    try {
      const response = await fetch(`/api/horarios?ambiente=${idAmbiente}&periodo=1`);
      const data = await response.json();
      if (data.exito) setHorarios(data.datos || []);
    } catch (error) {
      console.error('Error:', error);
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
    } catch (error) {
      alert('Error al generar PDF');
    }
  };

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const bloques = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Horarios por Aula</h1>
          <p className="text-gray-600">Visualiza horarios de aulas</p>
        </div>
        {ambienteSeleccionado && (
          <Boton onClick={descargarPDF}>📥 Descargar PDF</Boton>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Seleccionar Aula</label>
        <select
          className="w-full md:w-96 border rounded px-3 py-2"
          onChange={(e) => {
            const ambiente = ambientes.find((a: any) => a.id_ambiente === parseInt(e.target.value));
            setAmbienteSeleccionado(ambiente);
            if (ambiente) cargarHorarios(ambiente.id_ambiente);
          }}
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
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">
            {ambienteSeleccionado.codigo} - {ambienteSeleccionado.nombre}
          </h2>
          
          {cargando ? (
            <div className="text-center py-12">Cargando horarios...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100">Bloque</th>
                  {dias.map(dia => (
                    <th key={dia} className="border p-2 bg-primary-100">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloques.map(bloque => (
                  <tr key={bloque}>
                    <td className="border p-2 bg-gray-50 font-semibold text-center">
                      Bloque {bloque}
                    </td>
                    {dias.map(dia => {
                      const horario = horarios.find(h => h.dia === dia && h.bloque === bloque);
                      return (
                        <td key={`${dia}-${bloque}`} className="border p-2">
                          {horario ? (
                            <div className="text-sm">
                              <div className="font-semibold text-primary-700">
                                {horario.curso?.nombre || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {horario.docente?.apellidos || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Grupo {horario.grupo?.numero_grupo || 'N/A'}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
