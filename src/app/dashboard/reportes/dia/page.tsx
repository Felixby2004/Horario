'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DIAS_SEMANA = [
  { valor: 1, nombre: 'Lunes', emoji: '🌅' },
  { valor: 2, nombre: 'Martes', emoji: '🌄' },
  { valor: 3, nombre: 'Miércoles', emoji: '☀️' },
  { valor: 4, nombre: 'Jueves', emoji: '🌤️' },
  { valor: 5, nombre: 'Viernes', emoji: '🌥️' },
  { valor: 6, nombre: 'Sábado', emoji: '🌦️' }
];

export default function ReporteDiaPage() {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resPeriodos = await fetch('/api/periodos');
      const dataPeriodos = await resPeriodos.json();

      if (dataPeriodos.exito || Array.isArray(dataPeriodos)) {
        const periodsData = Array.isArray(dataPeriodos) ? dataPeriodos : dataPeriodos.datos || [];
        setPeriodos(periodsData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const generarReporte = async (formato: 'pdf' | 'excel') => {
    if (!periodoSeleccionado || !diaSeleccionado) {
      alert('Por favor selecciona un período y un día');
      return;
    }

    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/dia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periodo: parseInt(periodoSeleccionado),
          dia_semana: parseInt(diaSeleccionado),
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
      const nombreDia = DIAS_SEMANA.find(d => d.valor === parseInt(diaSeleccionado))?.nombre || 'dia';
      a.download = `reporte-auditoria-${nombreDia}-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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
        <h1 className="text-3xl font-bold mt-2">📅 Reporte de Auditoría por Día</h1>
        <p className="text-gray-600 mt-1">
          Audita y verifica cómo se imparten las clases en un día específico, qué profesor enseña cada curso y en qué ambiente
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
              Selecciona un Día de la Semana
            </label>
            <select
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un día --</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia.valor} value={dia.valor}>
                  {dia.emoji} {dia.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {periodoSeleccionado && diaSeleccionado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              ✓ Período y Día seleccionados. Selecciona el formato para descargar el reporte de auditoría.
            </p>
          </div>
        )}

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => generarReporte('pdf')}
            disabled={generando || !periodoSeleccionado || !diaSeleccionado}
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
            disabled={generando || !periodoSeleccionado || !diaSeleccionado}
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">🎯 ¿Qué es el Reporte de Auditoría por Día?</h3>
        <div className="space-y-3 text-sm text-amber-800">
          <p>
            Este reporte permite auditar y verificar cómo se imparten las clases en un día específico.
            Es ideal para que el Rector o autoridades académicas puedan:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Verificar profesores:</strong> Qué docente enseña cada curso</li>
            <li><strong>Revisar ambientes:</strong> En qué aula o laboratorio se imparten las clases</li>
            <li><strong>Auditar grupos:</strong> Qué grupos están asignados a cada clase</li>
            <li><strong>Validar horarios:</strong> Confirmar que los horarios se respetan correctamente</li>
            <li><strong>Detectar anomalías:</strong> Identificar sobrecargas o conflictos de disponibilidad</li>
          </ul>
          <p className="pt-2">
            El reporte muestra todas las actividades académicas del día, organizadas por hora y ambiente.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Información Técnica</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Se genera en PDF de alta calidad con formato institucional de la Universidad Nacional de Trujillo</li>
          <li>• También puedes exportar a Excel para análisis adicional y comparativas</li>
          <li>• El reporte incluye todos los cursos, docentes, ambientes y grupos del día seleccionado</li>
          <li>• Los datos se ordenan cronológicamente por hora para facilitar el seguimiento</li>
        </ul>
      </div>
    </div>
  );
}
