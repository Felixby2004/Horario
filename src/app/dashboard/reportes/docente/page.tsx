'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReporteDocentePage() {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [tipoReporte, setTipoReporte] = useState<'horario' | 'carga'>('horario');
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resPeriodos, resDocentes] = await Promise.all([
        fetch('/api/periodos'),
        fetch('/api/docentes')
      ]);

      const dataPeriodos = await resPeriodos.json();
      const dataDocentes = await resDocentes.json();

      if (dataPeriodos.exito || Array.isArray(dataPeriodos)) {
        const periodsData = Array.isArray(dataPeriodos) ? dataPeriodos : dataPeriodos.datos || [];
        setPeriodos(periodsData);
      }

      if (dataDocentes.exito || Array.isArray(dataDocentes)) {
        const docentesData = Array.isArray(dataDocentes) ? dataDocentes : dataDocentes.datos || [];
        setDocentes(docentesData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const generarReporte = async (formato: 'pdf' | 'excel') => {
    if (!periodoSeleccionado || !docenteSeleccionado) {
      alert('Por favor selecciona un período y un docente');
      return;
    }

    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/docente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_docente: parseInt(docenteSeleccionado),
          id_periodo: parseInt(periodoSeleccionado),
          tipo: tipoReporte,
          formato
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error generando reporte');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const tipoNombre = tipoReporte === 'carga' ? 'carga-horaria' : 'horario';
      a.download = `reporte-docente-${tipoNombre}-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Error: ${error.message || 'Error generando reporte'}`);
    } finally {
      setGenerando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/reportes" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Reportes
        </Link>
        <h1 className="text-3xl font-bold mt-2">Reporte por Docente</h1>
        <p className="text-gray-600 mt-1">
          Genera reportes de carga horaria u horario semanal de un docente
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selecciona un Período Académico
            </label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un período --</option>
              {periodos.map((periodo: any) => (
                <option key={periodo.id_periodo} value={periodo.id_periodo}>
                  {periodo.nombre} ({periodo.anio})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selecciona un Docente
            </label>
            <select
              value={docenteSeleccionado}
              onChange={(e) => setDocenteSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un docente --</option>
              {docentes.map((docente: any) => (
                <option key={docente.id_docente} value={docente.id_docente}>
                  {docente.apellidos}, {docente.nombres}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Tipo de Reporte
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{ borderColor: tipoReporte === 'horario' ? '#1e40af' : '#e5e7eb', backgroundColor: tipoReporte === 'horario' ? '#eff6ff' : 'white' }}>
              <input
                type="radio"
                value="horario"
                checked={tipoReporte === 'horario'}
                onChange={(e) => setTipoReporte(e.target.value as any)}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="ml-3">
                <div className="font-semibold text-gray-900">📅 Horario Semanal</div>
                <div className="text-sm text-gray-600">Muestra el horario de clases por día y hora</div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{ borderColor: tipoReporte === 'carga' ? '#1e40af' : '#e5e7eb', backgroundColor: tipoReporte === 'carga' ? '#eff6ff' : 'white' }}>
              <input
                type="radio"
                value="carga"
                checked={tipoReporte === 'carga'}
                onChange={(e) => setTipoReporte(e.target.value as any)}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="ml-3">
                <div className="font-semibold text-gray-900">📊 Carga Horaria</div>
                <div className="text-sm text-gray-600">Resumen de horas y cursos asignados</div>
              </div>
            </label>
          </div>
        </div>

        {periodoSeleccionado && docenteSeleccionado && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              ✓ Período, Docente y Tipo seleccionados. Selecciona el formato para descargar el reporte.
            </p>
          </div>
        )}

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => generarReporte('pdf')}
            disabled={generando || !periodoSeleccionado || !docenteSeleccionado}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2 font-semibold transition-colors"
          >
            {generando ? (
              <>
                <span className="animate-spin">⏳</span>
                Generando...
              </>
            ) : (
              <>
                📄 Descargar PDF
              </>
            )}
          </button>

          <button
            onClick={() => generarReporte('excel')}
            disabled={generando || !periodoSeleccionado || !docenteSeleccionado}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 font-semibold transition-colors"
          >
            {generando ? (
              <>
                <span className="animate-spin">⏳</span>
                Generando...
              </>
            ) : (
              <>
                📊 Descargar Excel
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Información</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Horario Semanal:</strong> Muestra todos los cursos del docente organizados por día y hora</li>
          <li>• <strong>Carga Horaria:</strong> Resumen con total de horas y cursos asignados</li>
          <li>• Se genera en PDF de alta calidad con formato institucional</li>
          <li>• También puedes exportar a Excel para análisis adicional</li>
        </ul>
      </div>
    </div>
  );
}
