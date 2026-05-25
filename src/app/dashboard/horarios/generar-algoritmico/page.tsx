'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';

interface Periodo {
  id_periodo: number;
  nombre: string;
  codigo: string;
  activo: boolean;
  estado: string;
}

interface DatosGeneracion {
  id_sesion_generacion: string;
  cantidad_asignaciones: number;
  aptitud: string;
  resumen: {
    docentes_cubiertos: number;
    grupos_cubiertos: number;
    ambientes_utilizados: number;
    conflictos_detectados: number;
    porcentaje_aptitud: string;
  };
}

export default function GeneradorHorariosAG() {
  const router = useRouter();
  const { alertas, eliminarAlerta, exito, error, info } = useAlertasTemporales();

  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodSeleccionado, setPeriodSeleccionado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [datosGeneracion, setDatosGeneracion] = useState<DatosGeneracion | null>(null);

  // Parámetros del algoritmo
  const [parametros, setParametros] = useState({
    tamanio_poblacion: 50,
    generaciones: 100,
    probabilidad_cruzamiento: 0.8,
    probabilidad_mutacion: 0.1
  });

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    try {
      setCargando(true);
      const response = await fetch('/api/periodos');
      const data = await response.json();

      if (data.exito) {
        const periodosActivos = (data.datos || []).filter((p: Periodo) => p.activo);
        setPeriodos(periodosActivos);

        if (periodosActivos.length > 0) {
          setPeriodSeleccionado(periodosActivos[0].id_periodo);
        }
      }
    } catch (err) {
      error('❌ Error', 'No pudimos cargar los períodos académicos');
    } finally {
      setCargando(false);
    }
  };

  const handleGenerarHorarios = async () => {
    if (!periodSeleccionado) {
      error('⚠️ Selecciona un período', 'Necesitas seleccionar un período académico');
      return;
    }

    setGenerando(true);
    try {
      info('⏳ Generando horarios', 'Por favor espera mientras el algoritmo genético trabaja...');

      const response = await fetch('/api/horarios/generar-algoritmico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periodo: periodSeleccionado,
          ...parametros
        })
      });

      const respuesta = await response.json();

      if (respuesta.exito) {
        setDatosGeneracion(respuesta.datos);
        exito(
          '✅ ¡Horarios generados!',
          `Se crearon ${respuesta.datos.cantidad_asignaciones} asignaciones con aptitud ${respuesta.datos.aptitud}/100`
        );
      } else {
        error('❌ Error en la generación', respuesta.mensaje);
      }
    } catch (err) {
      error('❌ Error inesperado', 'Ocurrió un error al generar los horarios');
    } finally {
      setGenerando(false);
    }
  };

  const handleGuardarDefinitivo = async () => {
    if (!datosGeneracion) return;

    try {
      info('💾 Guardando horarios', 'Procesando...');

      const response = await fetch('/api/horarios/guardar-generados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_periodo: periodSeleccionado,
          sesion_id: datosGeneracion.id_sesion_generacion
        })
      });

      const data = await response.json();

      if (data.exito) {
        exito(
          '✅ ¡Horarios guardados!',
          `Se guardaron ${data.datos.cantidad_guardada} horarios en el sistema`
        );
        setDatosGeneracion(null);
        setTimeout(() => router.push('/dashboard/horarios'), 2000);
      } else {
        error('❌ Error al guardar', data.mensaje);
      }
    } catch (err) {
      error('❌ Error', 'No pudimos guardar los horarios');
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
    <div className="max-w-6xl mx-auto space-y-6">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🧬 Generador de Horarios Inteligente</h1>
          <p className="text-gray-600 mt-2">
            Utiliza un algoritmo genético para generar horarios automáticos optimizados
          </p>
        </div>
        <Boton
          variante="secondary"
          onClick={() => router.push('/dashboard')}
        >
          ← Volver
        </Boton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Configuración */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">⚙️ Configuración</h2>

            {/* Selección de Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Académico *
              </label>
              <select
                value={periodSeleccionado || ''}
                onChange={(e) => setPeriodSeleccionado(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un período</option>
                {periodos.map((p) => (
                  <option key={p.id_periodo} value={p.id_periodo}>
                    {p.nombre} ({p.codigo})
                  </option>
                ))}
              </select>
              {periodos.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No hay períodos activos disponibles</p>
              )}
            </div>

            {/* Parámetros del Algoritmo */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3">Parámetros del AG</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tamaño Población: {parametros.tamanio_poblacion}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={parametros.tamanio_poblacion}
                    onChange={(e) =>
                      setParametros({
                        ...parametros,
                        tamanio_poblacion: parseInt(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mayor = más opciones, más lento</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Generaciones: {parametros.generaciones}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={parametros.generaciones}
                    onChange={(e) =>
                      setParametros({
                        ...parametros,
                        generaciones: parseInt(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mayor = mejor solución, más lento</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Prob. Cruzamiento: {(parametros.probabilidad_cruzamiento * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={parametros.probabilidad_cruzamiento}
                    onChange={(e) =>
                      setParametros({
                        ...parametros,
                        probabilidad_cruzamiento: parseFloat(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Prob. Mutación: {(parametros.probabilidad_mutacion * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.05"
                    value={parametros.probabilidad_mutacion}
                    onChange={(e) =>
                      setParametros({
                        ...parametros,
                        probabilidad_mutacion: parseFloat(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Botón Principal */}
            <Boton
              onClick={handleGenerarHorarios}
              disabled={!periodSeleccionado || generando}
              className="w-full"
            >
              {generando ? '⏳ Generando...' : '🚀 Generar Horarios'}
            </Boton>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
              <strong>💡 Consejo:</strong> Comienza con valores pequeños para probar. Mayor población
              y más generaciones = mejor resultado pero más tiempo.
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-2">
          {datosGeneracion ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-green-600">✅ ¡Éxito!</h2>
                <p className="text-gray-600 mt-1">Los horarios han sido generados exitosamente</p>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-4 border border-blue-200">
                  <p className="text-blue-600 text-sm font-medium">Asignaciones</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">
                    {datosGeneracion.cantidad_asignaciones}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded p-4 border border-purple-200">
                  <p className="text-purple-600 text-sm font-medium">Aptitud</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">
                    {datosGeneracion.aptitud}/100
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded p-4 border border-green-200">
                  <p className="text-green-600 text-sm font-medium">Docentes Cubiertos</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {datosGeneracion.resumen.docentes_cubiertos}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded p-4 border border-orange-200">
                  <p className="text-orange-600 text-sm font-medium">Grupos Asignados</p>
                  <p className="text-3xl font-bold text-orange-700 mt-1">
                    {datosGeneracion.resumen.grupos_cubiertos}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded p-4 border border-red-200 col-span-2">
                  <p className="text-red-600 text-sm font-medium">⚠️ Conflictos Detectados</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">
                    {datosGeneracion.resumen.conflictos_detectados}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Estos conflictos deben resolverse manualmente antes de guardar definitivamente
                  </p>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">📋 Próximos Pasos:</h3>
                <ol className="space-y-2 text-sm text-yellow-700">
                  <li>
                    1. <strong>Revisar</strong>: Haz clic en "Ver Horarios Generados" para visualizar
                  </li>
                  <li>
                    2. <strong>Ajustar</strong>: Resuelve los {datosGeneracion.resumen.conflictos_detectados} conflictos detectados
                  </li>
                  <li>
                    3. <strong>Guardar</strong>: Haz clic en "Guardar Definitivo" para confirmar
                  </li>
                </ol>
                <p className="text-xs text-yellow-600 mt-3">
                  ⏰ Los horarios generados vencen en 24 horas. Debes guardarlos antes de ese tiempo.
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <Boton
                  variante="secondary"
                  onClick={() => {
                    router.push(
                      `/dashboard/horarios/visualizar-generados?sesion=${datosGeneracion.id_sesion_generacion}`
                    );
                  }}
                >
                  👁️ Ver Horarios Generados
                </Boton>

                <Boton
                  onClick={handleGuardarDefinitivo}
                >
                  💾 Guardar Definitivo
                </Boton>

                <Boton
                  variante="secondary"
                  onClick={() => setDatosGeneracion(null)}
                >
                  🔄 Generar Nuevo
                </Boton>
              </div>

              <div className="bg-gray-100 rounded p-3 text-xs text-gray-600 font-mono">
                <p><strong>ID Sesión:</strong> {datosGeneracion.id_sesion_generacion}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🧬</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Generador de Horarios con IA</h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-6">
                Configura los parámetros a la izquierda y haz clic en "Generar Horarios" para comenzar.
                El algoritmo genético optimizará automáticamente los horarios basándose en tu configuración.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded p-6 text-left space-y-3">
                <h4 className="font-semibold text-gray-800">¿Cómo funciona?</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✅ Crea una población inicial de horarios aleatorios</li>
                  <li>✅ Evalúa la calidad de cada horario (sin conflictos, restricciones cumplidas)</li>
                  <li>✅ Selecciona los mejores horarios</li>
                  <li>✅ Combina y muta para crear nuevas generaciones</li>
                  <li>✅ Repite hasta encontrar la solución más óptima</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
