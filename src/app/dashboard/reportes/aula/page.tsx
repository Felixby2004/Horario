'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import Link from 'next/link';

export default function ReporteAulaPage() {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [aulaSeleccionada, setAulaSeleccionada] = useState('');
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [preview, setPreview] = useState<any>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resPeriodos, resAulas] = await Promise.all([
        fetch('/api/periodos'),
        fetch('/api/ambientes?tipo=aula')
      ]);

      const dataPeriodos = await resPeriodos.json();
      const dataAulas = await resAulas.json();

      if (dataPeriodos.exito || Array.isArray(dataPeriodos)) {
        const periodsData = Array.isArray(dataPeriodos) ? dataPeriodos : dataPeriodos.datos || [];
        setPeriodos(periodsData);
      }

      if (dataAulas.exito || Array.isArray(dataAulas)) {
        const aulasData = Array.isArray(dataAulas) ? dataAulas : dataAulas.datos || [];
        setAulas(aulasData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarPreview = async () => {
    if (!periodoSeleccionado || !aulaSeleccionada) {
      alert('Por favor selecciona un período y un aula');
      return;
    }

    setCargandoPreview(true);
    try {
      const response = await fetch(
        `/api/reportes/aula/preview?id_ambiente=${aulaSeleccionada}&id_periodo=${periodoSeleccionado}`
      );

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
    if (!periodoSeleccionado || !aulaSeleccionada) {
      alert('Por favor selecciona un período y un aula');
      return;
    }

    setGenerando(true);
    try {
      const response = await fetch('/api/reportes/aula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_ambiente: parseInt(aulaSeleccionada),
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
      a.download = `reporte-aula-${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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

  const aulaSeleccionadaData = aulas.find(a => a.id_ambiente === parseInt(aulaSeleccionada));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/reportes" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Volver a Reportes
        </Link>
        <h1 className="text-3xl font-bold mt-2">Reporte por Aula</h1>
        <p className="text-gray-600 mt-1">
          Genera un horario semanal completo de una aula específica
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
              onChange={(e) => {
                setPeriodoSeleccionado(e.target.value);
                setPreview(null);
              }}
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
              Selecciona un Aula
            </label>
            <select
              value={aulaSeleccionada}
              onChange={(e) => {
                setAulaSeleccionada(e.target.value);
                setPreview(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecciona un aula --</option>
              {aulas.map((aula: any) => (
                <option key={aula.id_ambiente} value={aula.id_ambiente}>
                  {aula.nombre} - Cap: {aula.capacidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {periodoSeleccionado && aulaSeleccionada && (
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
                  {preview.ambiente?.nombre || 'Aula'}
                </h3>
                <p className="text-sm text-gray-600">
                  Horarios encontrados: <span className="font-bold text-blue-600">{preview.totalHorarios}</span>
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
                  {preview.horarios.slice(0, 3).map((h: any, idx: number) => (
                    <li key={idx}>
                      • {h.dia_semana} {h.hora_inicio}-{h.hora_fin}: {h.curso.nombre} ({h.grupo?.codigo_grupo})
                    </li>
                  ))}
                  {preview.totalHorarios > 3 && (
                    <li>• ... y {preview.totalHorarios - 3} más</li>
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
          <li>• Selecciona un período y aula, luego haz clic en "Ver Vista Previa"</li>
          <li>• La vista previa muestra los primeros horarios para verificar que hay datos</li>
          <li>• El reporte muestra el horario semanal completo del aula en formato tabla</li>
          <li>• Incluye todos los cursos, grupos y docentes asignados</li>
          <li>• Se genera en PDF de alta calidad con formato institucional</li>
          <li>• También puedes exportar a Excel para análisis adicional</li>
        </ul>
      </div>
    </div>
  );
}
