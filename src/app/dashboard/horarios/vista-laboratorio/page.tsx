'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

export default function VistaLaboratorioPage() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState<any>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarLaboratorios();
  }, []);

  const cargarLaboratorios = async () => {
    try {
      const response = await fetch('/api/ambientes?tipo=laboratorio');
      const data = await response.json();
      if (data.exito) setLaboratorios(data.datos);
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
    if (!laboratorioSeleccionado) return;

    try {
      const response = await fetch('/api/reportes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'laboratorio',
          id_entidad: laboratorioSeleccionado.id_ambiente,
          id_periodo: 1
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horario-${laboratorioSeleccionado.codigo}.pdf`;
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
          <h1 className="text-2xl font-bold">Horarios por Laboratorio</h1>
          <p className="text-gray-600">Visualiza horarios de laboratorios</p>
        </div>
        {laboratorioSeleccionado && (
          <Boton onClick={descargarPDF}>📥 Descargar PDF</Boton>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Seleccionar Laboratorio</label>
        <select
          className="w-full md:w-96 border rounded px-3 py-2"
          onChange={(e) => {
            const lab = laboratorios.find((l: any) => l.id_ambiente === parseInt(e.target.value));
            setLaboratorioSeleccionado(lab);
            if (lab) cargarHorarios(lab.id_ambiente);
          }}
        >
          <option value="">-- Seleccionar --</option>
          {laboratorios.map((l: any) => (
            <option key={l.id_ambiente} value={l.id_ambiente}>
              {l.codigo} - {l.nombre} (Cap: {l.capacidad})
            </option>
          ))}
        </select>
      </div>

      {laboratorioSeleccionado && (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              💻 {laboratorioSeleccionado.codigo} - {laboratorioSeleccionado.nombre}
            </h2>
            {laboratorioSeleccionado.equipamiento && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Equipamiento:</strong> {laboratorioSeleccionado.equipamiento}
              </p>
            )}
          </div>
          
          {cargando ? (
            <div className="text-center py-12">Cargando horarios...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-purple-100">Bloque</th>
                  {dias.map(dia => (
                    <th key={dia} className="border p-2 bg-purple-100">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloques.map(bloque => (
                  <tr key={bloque}>
                    <td className="border p-2 bg-gray-50 font-semibold text-center">
                      B{bloque}
                    </td>
                    {dias.map(dia => {
                      const horario = horarios.find(h => h.dia === dia && h.bloque === bloque);
                      return (
                        <td key={`${dia}-${bloque}`} className="border p-2">
                          {horario ? (
                            <div className="text-sm">
                              <div className="font-semibold text-purple-700">
                                {horario.curso?.nombre || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {horario.docente?.apellidos || 'N/A'}
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
