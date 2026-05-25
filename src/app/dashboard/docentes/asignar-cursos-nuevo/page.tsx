'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';

interface Docente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  horas_maximas_semanales: number;
  horas_totales_asignadas: number;
}

interface Curso {
  id_curso: number;
  codigo: string;
  nombre: string;
  horas_teoria: number;
  horas_laboratorio: number;
  horas_practica: number;
  ciclo: number;
}

interface DocenteCurso {
  id_docente_curso: number;
  id_docente: number;
  id_curso: number;
  tipo_clase: string;
  horas_asignadas: number;
  curso: Curso;
}

const TIPOS_CLASE = [
  { valor: 'teoria', etiqueta: 'Teoría' },
  { valor: 'laboratorio', etiqueta: 'Laboratorio' },
  { valor: 'practica', etiqueta: 'Práctica' }
];

export default function AsignarCursosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_docente = searchParams.get('id_docente');

  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  const [docente, setDocente] = useState<Docente | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosAsignados, setCursosAsignados] = useState<DocenteCurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [horasAsignadas, setHorasAsignadas] = useState({
    teoria: 0,
    laboratorio: 0,
    practica: 0
  });
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    if (id_docente) {
      cargarDatos();
    }
  }, [id_docente]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resDocente, resCursos, resCursosAsignados] = await Promise.all([
        fetch(`/api/docentes/${id_docente}`),
        fetch('/api/cursos'),
        fetch(`/api/docentes/asignar-cursos?id_docente=${id_docente}`)
      ]);

      const [dataDocente, dataCursos, dataCursosAsignados] = await Promise.all([
        resDocente.json(),
        resCursos.json(),
        resCursosAsignados.json()
      ]);

      if (dataDocente.exito) setDocente(dataDocente.datos);
      if (dataCursos.exito) setCursos(dataCursos.datos || []);
      if (dataCursosAsignados.exito) setCursosAsignados(dataCursosAsignados.datos || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      error('Error al cargar', 'No pudimos cargar los datos. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirModal = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setHorasAsignadas({ teoria: 0, laboratorio: 0, practica: 0 });
    setModalAbierto(true);
  };

  const handleAsignarCurso = async () => {
    if (!docente || !cursoSeleccionado) return;

    // Validar que al menos un tipo de clase tenga horas
    const tiposConHoras = Object.entries(horasAsignadas)
      .filter(([_, horas]) => horas > 0)
      .map(([tipo]) => tipo);

    if (tiposConHoras.length === 0) {
      error('Validación', 'Debes asignar al menos una hora en algún tipo de clase');
      return;
    }

    setAsignando(true);
    let asignacionesExitosas = 0;
    let asignacionesFallidas = 0;
    const erroresDetalle: string[] = [];

    try {
      // Asignar cada tipo de clase por separado
      for (const [tipo, horas] of Object.entries(horasAsignadas)) {
        if (horas > 0) {
          try {
            const response = await fetch('/api/docentes/asignar-cursos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id_docente: docente.id_docente,
                id_curso: cursoSeleccionado.id_curso,
                tipo_clase: tipo,
                horas_asignadas: horas
              })
            });

            const data = await response.json();

            if (data.exito) {
              asignacionesExitosas++;
            } else {
              asignacionesFallidas++;
              erroresDetalle.push(`${tipo}: ${data.error}`);
            }
          } catch (err: any) {
            asignacionesFallidas++;
            erroresDetalle.push(`${tipo}: Error de conexión`);
          }
        }
      }

      // Mostrar resultado
      if (asignacionesExitosas > 0) {
        const tiposAsignados = tiposConHoras
          .map(
            (tipo) =>
              `${horasAsignadas[tipo as keyof typeof horasAsignadas]} hrs de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`
          )
          .join(', ');

        exito(
          '✅ Curso asignado',
          `${cursoSeleccionado.nombre} fue asignado exitosamente (${tiposAsignados})`
        );
        setModalAbierto(false);
        cargarDatos();
      }

      if (asignacionesFallidas > 0) {
        error(
          '⚠️ Algunas asignaciones fallaron',
          erroresDetalle.join('\n') || 'Revisa los datos e intenta nuevamente'
        );
      }
    } finally {
      setAsignando(false);
    }
  };

  const handleDesasignarCurso = async (id_curso: number) => {
    if (!docente) return;

    if (!confirm('¿Estás seguro de desasignar este curso?')) return;

    try {
      const response = await fetch('/api/docentes/asignar-cursos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_docente: docente.id_docente,
          id_curso
        })
      });

      const data = await response.json();

      if (data.exito) {
        exito(
          '✅ Curso desasignado',
          'El curso fue desasignado exitosamente'
        );
        cargarDatos();
      } else {
        error(
          '❌ Error al desasignar',
          data.error || 'No pudimos desasignar el curso.'
        );
      }
    } catch (err) {
      console.error('Error:', err);
      error(
        '❌ Error inesperado',
        'Ocurrió un error al desasignar el curso.'
      );
    }
  };

  const cursosDisponibles = cursos.filter(
    (c) => !cursosAsignados.some((ca) => ca.id_curso === c.id_curso)
  );

  const horasUsadas = docente?.horas_totales_asignadas || 0;
  const horasMaximas = docente?.horas_maximas_semanales || 40;
  const horasDisponibles = horasMaximas - horasUsadas;

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  if (!docente) {
    return <div className="p-6">Docente no encontrado</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Asignar Cursos a Docente</h1>
          <p className="text-gray-600 mt-1">
            {docente.apellidos}, {docente.nombres} ({docente.codigo_docente})
          </p>
        </div>
        <Boton
          variante="secondary"
          onClick={() => router.push('/dashboard/docentes')}
        >
          Volver
        </Boton>
      </div>

      {/* Información de Horas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium">Horas Máximas</p>
          <p className="text-2xl font-bold text-blue-800 mt-2">{horasMaximas} hrs</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-600 text-sm font-medium">Horas Asignadas</p>
          <p className="text-2xl font-bold text-purple-800 mt-2">{horasUsadas} hrs</p>
        </div>

        <div
          className={`rounded-lg p-4 ${
            horasDisponibles >= 0
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              horasDisponibles >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            Horas Disponibles
          </p>
          <p
            className={`text-2xl font-bold mt-2 ${
              horasDisponibles >= 0 ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {horasDisponibles} hrs
          </p>
        </div>
      </div>

      {/* Cursos Asignados */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg">Cursos Asignados ({cursosAsignados.length})</h3>
        </div>

        {cursosAsignados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cursos asignados aún
          </div>
        ) : (
          <div className="divide-y">
            {cursosAsignados.map((ca) => (
              <div key={ca.id_docente_curso} className="p-4 hover:bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">CÓDIGO</p>
                    <p className="font-semibold">{ca.curso.codigo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">NOMBRE</p>
                    <p className="text-sm">{ca.curso.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">HORAS TOTALES</p>
                    <p className="font-semibold">
                      {(ca.curso.horas_teoria || 0) +
                        (ca.curso.horas_laboratorio || 0) +
                        (ca.curso.horas_practica || 0)}{' '}
                      hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">TIPO CLASE</p>
                    <p className="text-sm capitalize font-semibold">{ca.tipo_clase}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">HORAS A ENSEÑAR</p>
                    <p className="text-sm font-semibold">{ca.horas_asignadas || 0} hrs</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleDesasignarCurso(ca.id_curso)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      ❌ Desasignar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cursos Disponibles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg">Cursos Disponibles ({cursosDisponibles.length})</h3>
        </div>

        {cursosDisponibles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cursos disponibles para asignar
          </div>
        ) : (
          <div className="divide-y">
            {cursosDisponibles.map((curso) => (
              <div key={curso.id_curso} className="p-4 hover:bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">CÓDIGO</p>
                    <p className="font-semibold">{curso.codigo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">NOMBRE</p>
                    <p className="text-sm">{curso.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">HORAS TOTALES</p>
                    <p className="font-semibold">
                      {(curso.horas_teoria || 0) +
                        (curso.horas_laboratorio || 0) +
                        (curso.horas_practica || 0)}{' '}
                      hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">CICLO</p>
                    <p className="font-semibold">{curso.ciclo || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleAbrirModal(curso)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      ➕ Asignar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para asignar curso */}
      {modalAbierto && cursoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">{cursoSeleccionado.nombre}</h2>
            <p className="text-xs text-gray-500 mb-4">Asigna horas en los tipos de clase que el docente enseñará</p>

            <div className="space-y-4">
              {/* Mostrar horas disponibles por tipo */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Horas Disponibles del Curso</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Teoría</p>
                    <p className="font-bold text-blue-800">{cursoSeleccionado.horas_teoria} hrs</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <p className="text-xs text-green-600 font-medium">Lab</p>
                    <p className="font-bold text-green-800">{cursoSeleccionado.horas_laboratorio} hrs</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">Práctica</p>
                    <p className="font-bold text-purple-800">{cursoSeleccionado.horas_practica} hrs</p>
                  </div>
                </div>
              </div>

              {/* Inputs para cada tipo de clase */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">¿Cuántas horas enseñará en cada tipo?</p>
                
                <div className="space-y-3">
                  {/* Teoría */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Teoría (máx: {cursoSeleccionado.horas_teoria} hrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={cursoSeleccionado.horas_teoria}
                      value={horasAsignadas.teoria}
                      onChange={(e) =>
                        setHorasAsignadas({
                          ...horasAsignadas,
                          teoria: Math.max(0, parseInt(e.target.value) || 0)
                        })
                      }
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Laboratorio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Laboratorio (máx: {cursoSeleccionado.horas_laboratorio} hrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={cursoSeleccionado.horas_laboratorio}
                      value={horasAsignadas.laboratorio}
                      onChange={(e) =>
                        setHorasAsignadas({
                          ...horasAsignadas,
                          laboratorio: Math.max(0, parseInt(e.target.value) || 0)
                        })
                      }
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Práctica */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Práctica (máx: {cursoSeleccionado.horas_practica} hrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={cursoSeleccionado.horas_practica}
                      value={horasAsignadas.practica}
                      onChange={(e) =>
                        setHorasAsignadas({
                          ...horasAsignadas,
                          practica: Math.max(0, parseInt(e.target.value) || 0)
                        })
                      }
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm font-bold text-yellow-800 mb-2">Resumen:</p>
                <div className="space-y-1 text-sm">
                  {horasAsignadas.teoria > 0 && (
                    <p className="text-yellow-700">• Teoría: <strong>{horasAsignadas.teoria} hrs</strong></p>
                  )}
                  {horasAsignadas.laboratorio > 0 && (
                    <p className="text-yellow-700">• Laboratorio: <strong>{horasAsignadas.laboratorio} hrs</strong></p>
                  )}
                  {horasAsignadas.practica > 0 && (
                    <p className="text-yellow-700">• Práctica: <strong>{horasAsignadas.practica} hrs</strong></p>
                  )}
                  <p className="text-yellow-800 border-t border-yellow-300 pt-1 mt-1">
                    Total a asignar: <strong>{horasAsignadas.teoria + horasAsignadas.laboratorio + horasAsignadas.practica} hrs</strong>
                  </p>
                  <p className="text-yellow-700">
                    Horas docente: <strong>{horasUsadas + horasAsignadas.teoria + horasAsignadas.laboratorio + horasAsignadas.practica} / {horasMaximas} hrs</strong>
                  </p>
                </div>
                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      horasUsadas + horasAsignadas.teoria + horasAsignadas.laboratorio + horasAsignadas.practica > horasMaximas
                        ? 'bg-red-600'
                        : 'bg-green-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        ((horasUsadas +
                          horasAsignadas.teoria +
                          horasAsignadas.laboratorio +
                          horasAsignadas.practica) /
                          horasMaximas) *
                          100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                disabled={asignando}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarCurso}
                disabled={asignando || (horasAsignadas.teoria + horasAsignadas.laboratorio + horasAsignadas.practica) === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {asignando
                  ? '⏳ Asignando...'
                  : `✅ Asignar ${horasAsignadas.teoria + horasAsignadas.laboratorio + horasAsignadas.practica} hrs`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
