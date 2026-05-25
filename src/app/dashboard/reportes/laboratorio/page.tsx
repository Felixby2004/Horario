'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReporteLaboratorioPage() {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [laboratorios, setLaboratorios] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState('');
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resPeriodos, resLabs] = await Promise.all([
        fetch('/api/periodos'),
        fetch('/api/ambientes?tipo=laboratorio')
      ]);

      const dataPeriodos = await resPeriodos.json();
      const dataLabs = await resLabs.json();

      if (dataPeriodos.exito || Array.isArray(dataPeriodos)) {
        const periodsData = Array.isArray(dataPeriodos) ? dataPeriodos : dataPeriodos.datos || [];
        setPeriodos(periodsData);
      }

      if (dataLabs.exito || Array.isArray(dataLabs)) {
        const labsData = Array.isArray(dataLabs) ? dataLabs : dataLabs.datos || [];
        setLaboratorios(labsData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const generarReporte = async (formato: 'pdf' | 'excel') => {
    if (!periodoSeleccionado || !laboratorioSeleccionado) {
      alert('Por favor selecciona un período y un laboratorio');
      return;
    }

    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/laboratorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_ambiente: parseInt(laboratorioSeleccionado),
          id_periodo: parseInt(periodoSeleccionado),
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
      a.download = `reporte-laboratorio-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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
        <h1 className="text-3xl font-bold mt-2">Reporte por Laboratorio</h1>
        <p className="text-gray-600 mt-1">
          Genera un horario semanal completo de un laboratorio específico
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
              Selecciona un Laboratorio
            </label>
            <select
              value={laboratorioSeleccionado}
              onChange={(e) => setLaboratorioSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un laboratorio --</option>
              {laboratorios.map((lab: any) => (
                <option key={lab.id_ambiente} value={lab.id_ambiente}>
                  {lab.nombre} - Capacidad: {lab.capacidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {periodoSeleccionado && laboratorioSeleccionado && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              ✓ Período y Laboratorio seleccionados. Selecciona el formato para descargar el reporte.
            </p>
          </div>
        )}

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => generarReporte('pdf')}
            disabled={generando || !periodoSeleccionado || !laboratorioSeleccionado}
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
            disabled={generando || !periodoSeleccionado || !laboratorioSeleccionado}
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
          <li>• El reporte muestra el horario semanal completo del laboratorio</li>
          <li>• Incluye todos los cursos prácticos y sus grupos asignados</li>
          <li>• Se genera en PDF de alta calidad con formato institucional</li>
          <li>• También puedes exportar a Excel para análisis adicional</li>
        </ul>
      </div>
    </div>
  );
}
