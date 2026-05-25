'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ReporteCicloPage() {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [cicloSeleccionado, setCicloSeleccionado] = useState('');
  const [ciclosDisponibles, setCiclosDisponibles] = useState<number[]>([]);
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [preview, setPreview] = useState<any>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!periodoSeleccionado) {
      setCiclosDisponibles([]);
      setCicloSeleccionado('');
      return;
    }

    const periodo = periodos.find((p: any) => p.id_periodo === parseInt(periodoSeleccionado));
    if (!periodo) return;

    if (periodo.codigo?.endsWith('-I')) {
      setCiclosDisponibles([1, 3, 5, 7, 9]);
    } else if (periodo.codigo?.endsWith('-II')) {
      setCiclosDisponibles([2, 4, 6, 8, 10]);
    } else {
      setCiclosDisponibles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    setCicloSeleccionado('');
    setPreview(null);
  }, [periodoSeleccionado, periodos]);

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
      console.error('Error cargando periodos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarPreview = async () => {
    if (!periodoSeleccionado || !cicloSeleccionado) {
      alert('Por favor selecciona un período y un ciclo');
      return;
    }

    setCargandoPreview(true);
    try {
      const response = await fetch(`/api/reportes/ciclo/preview?id_periodo=${periodoSeleccionado}&ciclo=${cicloSeleccionado}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error cargando preview');
      }

      const datos = await response.json();
      setPreview(datos);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setPreview(null);
    } finally {
      setCargandoPreview(false);
    }
  };

  const generarReporte = async (formato: 'pdf' | 'excel') => {
    if (!periodoSeleccionado || !cicloSeleccionado) {
      alert('Por favor selecciona un período y un ciclo');
      return;
    }

    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/ciclo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periodo: parseInt(periodoSeleccionado),
          ciclo: parseInt(cicloSeleccionado),
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
      a.download = `reporte-ciclo-${cicloSeleccionado}-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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
      <div className="flex justify-center py-12"><div className="loader"></div></div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/reportes" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Reportes
        </Link>
        <h1 className="text-3xl font-bold mt-2">Reporte por Ciclo</h1>
        <p className="text-gray-600 mt-1">
          Genera un reporte con todos los horarios y cursos asignados de un ciclo específico
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
              Selecciona un Ciclo
            </label>
            <select
              value={cicloSeleccionado}
              onChange={(e) => {
                setCicloSeleccionado(e.target.value);
                setPreview(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!periodoSeleccionado}
            >
              <option value="">-- Selecciona un ciclo --</option>
              {ciclosDisponibles.map((ciclo) => (
                <option key={ciclo} value={ciclo}>
                  Ciclo {ciclo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {periodoSeleccionado && cicloSeleccionado && (
          <div className="mb-6">
            <button
              onClick={cargarPreview}
              disabled={cargandoPreview}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 font-semibold transition-colors"
            >
              {cargandoPreview ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Cargando...
                </>
              ) : (
                <>
                  👁️ Ver Vista Previa
                </>
              )}
            </button>
          </div>
        )}

        {preview && (
          <div className="mb-8 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Ciclo {preview.ciclo}
                </h3>
                <p className="text-sm text-gray-600">
                  Horarios encontrados: <span className="font-bold text-blue-600">{preview.totalHorarios}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Cursos asignados: <span className="font-bold text-blue-600">{preview.totalCursos}</span>
                </p>
              </div>
              {preview.totalHorarios === 0 && (
                <div className="text-yellow-600 text-sm">
                  ⚠️ No hay horarios asignados
                </div>
              )}
              {preview.totalHorarios > 0 && (
                <div className="text-green-600 text-sm">
                  ✓ Listo para descargar
                </div>
              )}
            </div>

            {preview.totalHorarios > 0 && (
              <div className="bg-white rounded p-3 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Primeros horarios:</p>
                <ul className="space-y-1 text-gray-600">
                  {preview.horarios.slice(0, 5).map((h: any, idx: number) => (
                    <li key={idx}>
                      • {h.curso?.codigo} - {h.curso?.nombre} | {h.grupo?.codigo_grupo} | {h.docente ? `${h.docente.apellidos}, ${h.docente.nombres}` : 'N/A'} | {h.dia_semana} {h.hora_inicio}-{h.hora_fin}
                    </li>
                  ))}
                  {preview.totalHorarios > 5 && (
                    <li>• ... y {preview.totalHorarios - 5} más</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {preview && preview.totalHorarios > 0 && (
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => generarReporte('pdf')}
              disabled={generando}
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
              disabled={generando}
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
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Información</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• El reporte muestra todos los cursos y horarios asignados del ciclo seleccionado</li>
          <li>• Incluye un resumen de cursos únicos y sus bloques asignados</li>
          <li>• Se genera en PDF de alta calidad con formato institucional</li>
          <li>• También puedes exportar a Excel para análisis adicional</li>
        </ul>
      </div>
    </div>
  );
}
