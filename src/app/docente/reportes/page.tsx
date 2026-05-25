'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Periodo {
  id_periodo: number;
  nombre: string;
  codigo: string;
  anio: number;
  semestre: number;
  estado: string;
}

export default function ReportesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [tipoReporte, setTipoReporte] = useState('horario');
  const [formato, setFormato] = useState('pdf');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.rol !== 'docente') {
      router.push('/');
      return;
    }

    setUsuario(user);
    cargarPeriodos();
  }, [router]);

  const cargarPeriodos = async () => {
    try {
      const response = await fetch('/api/periodos');
      const data = await response.json();

      if (data.exito) {
        // Mostrar todos los periodos para que pueda ver reportes históricos
        setPeriodos(data.datos || []);
      }
    } catch (err) {
      console.error('Error cargando periodos:', err);
      setError('Error al cargar los períodos');
    }
  };

  const generarReporte = async () => {
    if (!periodoSeleccionado) {
      setError('Selecciona un período académico');
      return;
    }

    if (!usuario?.id_docente) {
      setError('No se encontraron datos del docente');
      return;
    }

    setGenerando(true);
    setError('');
    setExito('');

    try {
      const response = await fetch('/api/reportes/docente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_docente: usuario.id_docente,
          id_periodo: parseInt(periodoSeleccionado),
          tipo: tipoReporte,
          formato: formato
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generando reporte');
      }

      // Descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const tipoNombre = tipoReporte === 'carga' ? 'carga-horaria' : 'horario-docente';
      const extension = formato === 'excel' ? 'xlsx' : 'pdf';
      const fecha = new Date().toISOString().split('T')[0];
      a.download = `reporte-${tipoNombre}-${fecha}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExito(`Reporte de ${tipoReporte === 'carga' ? 'carga horaria' : 'horario'} generado exitosamente`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setExito(''), 3000);
    } catch (err: any) {
      console.error('Error generando reporte:', err);
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis reportes</h1>
          <p className="text-gray-600 mt-1">
            Genera reportes de tu horario y carga horaria
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Información del Docente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Docente</p>
            <p className="text-lg font-semibold text-blue-900 mt-1">
              {usuario.nombres} {usuario.apellidos}
            </p>
            <p className="text-sm text-blue-700 mt-1">Código: {usuario.codigo}</p>
          </div>

          {/* Seleccionar Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Académico
            </label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Selecciona un período --</option>
              {periodos.map((periodo) => (
                <option key={periodo.id_periodo} value={periodo.id_periodo}>
                  {periodo.nombre} ({periodo.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoReporte"
                  value="horario"
                  checked={tipoReporte === 'horario'}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm text-gray-700">
                  📅 Reporte de Horario - Muestra tu horario actual asignado
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoReporte"
                  value="carga"
                  checked={tipoReporte === 'carga'}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm text-gray-700">
                  ⏱️ Reporte de Carga Horaria - Muestra las horas asignadas por curso
                </span>
              </label>
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formato"
                  value="pdf"
                  checked={formato === 'pdf'}
                  onChange={(e) => setFormato(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm text-gray-700">
                  📄 PDF - Descarga en formato PDF
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formato"
                  value="excel"
                  checked={formato === 'excel'}
                  onChange={(e) => setFormato(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-sm text-gray-700">
                  📊 Excel - Descarga en formato Excel
                </span>
              </label>
            </div>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {exito && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">✅ {exito}</p>
            </div>
          )}

          {/* Botón Generar */}
          <button
            onClick={generarReporte}
            disabled={generando || !periodoSeleccionado}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {generando ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Generando reporte...
              </>
            ) : (
              <>
                📥 Descargar Reporte
              </>
            )}
          </button>

          {/* Información Adicional */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-2">
            <p>
              <strong>💡 Tip:</strong> El reporte de horario muestra todos los bloques horarios que ya han sido confirmados para ti.
            </p>
            <p>
              <strong>💡 Tip:</strong> El reporte de carga horaria muestra el total de horas asignadas por cada curso que dictas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
