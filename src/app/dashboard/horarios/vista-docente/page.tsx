'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';

export default function VistaDocentePage() {
  const [docentes, setDocentes] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<any>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    try {
      const response = await fetch('/api/docentes');
      const data = await response.json();
      if (data.exito) setDocentes(data.datos);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarHorarios = async (idDocente: number) => {
    setCargando(true);
    try {
      const response = await fetch(`/api/horarios?docente=${idDocente}`);
      const data = await response.json();
      if (data.exito) setHorarios(data.datos || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    if (!docenteSeleccionado) return;

    try {
      const response = await fetch('/api/reportes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'docente',
          id_entidad: docenteSeleccionado.id_docente
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horario-${docenteSeleccionado.codigo_docente}.pdf`;
      a.click();
    } catch (error) {
      alert('Error al generar PDF');
    }
  };

  const calcularCargaHoraria = () => {
    const totalHoras = horarios.reduce((sum, h) => {
      const inicio = h.hora_inicio.split(':').map(Number);
      const fin = h.hora_fin.split(':').map(Number);
      const duracion = (fin[0] * 60 + fin[1] - inicio[0] * 60 - inicio[1]) / 60;
      return sum + duracion;
    }, 0);
    return totalHoras.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Horarios por Docente</h1>
          <p className="text-gray-600">Visualiza carga horaria de docentes</p>
        </div>
        {docenteSeleccionado && (
          <Boton onClick={descargarPDF}>📥 Descargar PDF</Boton>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Seleccionar Docente</label>
        <select
          className="w-full md:w-96 border rounded px-3 py-2"
          onChange={(e) => {
            const docente = docentes.find((d: any) => d.id_docente === parseInt(e.target.value));
            setDocenteSeleccionado(docente);
            if (docente) cargarHorarios(docente.id_docente);
          }}
        >
          <option value="">-- Seleccionar --</option>
          {docentes.map((d: any) => (
            <option key={d.id_docente} value={d.id_docente}>
              {d.apellidos}, {d.nombres} ({d.categoria})
            </option>
          ))}
        </select>
      </div>

      {docenteSeleccionado && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{horarios.length}</div>
              <div className="text-sm text-gray-600">Bloques asignados</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{calcularCargaHoraria()}</div>
              <div className="text-sm text-gray-600">Horas semanales</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(horarios.map(h => h.id_curso)).size}
              </div>
              <div className="text-sm text-gray-600">Cursos asignados</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(horarios.map(h => h.id_ambiente)).size}
              </div>
              <div className="text-sm text-gray-600">Ambientes diferentes</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {docenteSeleccionado.apellidos}, {docenteSeleccionado.nombres}
            </h2>
            
            {cargando ? (
              <div className="text-center py-12">Cargando horarios...</div>
            ) : horarios.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay horarios asignados a este docente
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((dia, diaIdx) => {
                  const horariosDia = horarios.filter(h => h.dia_semana === diaIdx);
                  if (horariosDia.length === 0) return null;

                  return (
                    <div key={dia} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-bold text-lg mb-3 border-b pb-2 text-primary-800">{dia}</h3>
                      <div className="space-y-3">
                        {horariosDia
                          .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                          .map((h, idx) => (
                            <div key={idx} className="bg-white border rounded p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="font-bold text-blue-900">{h.curso?.codigo}</div>
                              <div className="text-sm font-semibold">{h.curso?.nombre}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                🕐 {h.hora_inicio} - {h.hora_fin}
                              </div>
                              <div className="text-xs text-gray-500">
                                🏫 {h.ambiente?.nombre} | 👥 Grupo {h.grupo?.codigo_grupo}
                              </div>
                              <div className="mt-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                  h.tipo_clase === 'teoria' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {h.tipo_clase}
                                </span>
                                <span className="text-[10px] ml-2 text-gray-400">Ciclo {h.curso?.ciclo}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
