'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface Grupo {
  id_grupo: number;
  codigo_grupo: string;
  capacidad_maxima: number;
  cantidad_matriculados: number;
  asignado: boolean;
  curso: {
    id_curso: number;
    codigo: string;
    nombre: string;
  };
}

export default function AsignarGruposPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_docente = searchParams.get('id_docente');

  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  const [docente, setDocente] = useState<Docente | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  useEffect(() => {
    const docenteId = Number(id_docente);
    if (!id_docente || !Number.isInteger(docenteId) || docenteId <= 0) {
      router.push('/dashboard/docentes');
      return;
    }

    cargarDatos();
  }, [id_docente]);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // Obtener docente
      const respDocente = await fetch(`/api/docentes/${id_docente}`);
      const dataDocente = await respDocente.json();

      if (dataDocente.exito) {
        setDocente(dataDocente.datos);
      }

      // Obtener grupos disponibles
      const respGrupos = await fetch(`/api/docentes/asignar-grupos?id_docente=${id_docente}`);
      const dataGrupos = await respGrupos.json();

      if (dataGrupos.exito) {
        setGrupos(dataGrupos.datos || []);
      } else {
        const dbActual =
          dataGrupos?.diagnostico?.db ? ` (BD: ${dataGrupos.diagnostico.db})` : '';
        error('Error', (dataGrupos.error || 'No se pudieron cargar los grupos') + dbActual);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      error('Error', 'No se pudieron cargar los datos. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const handleAsignarGrupo = async (grupo: Grupo) => {
    if (procesando === grupo.id_grupo) return;

    try {
      setProcesando(grupo.id_grupo);

      const accion = grupo.asignado ? 'desasignar' : 'asignar';
      const metodo = grupo.asignado ? 'DELETE' : 'POST';

      let url = `/api/docentes/asignar-grupos`;
      let opciones: RequestInit = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' }
      };

      if (metodo === 'POST') {
        opciones.body = JSON.stringify({
          id_docente: Number(id_docente),
          id_grupo: grupo.id_grupo,
          accion: 'asignar'
        });
      } else {
        url += `?id_docente=${id_docente}&id_grupo=${grupo.id_grupo}`;
      }

      const respuesta = await fetch(url, opciones);
      const data = await respuesta.json();

      if (data.exito) {
        exito(
          grupo.asignado ? '✅ Grupo desasignado' : '✅ Grupo asignado',
          `${grupo.codigo_grupo} de ${grupo.curso.nombre}`
        );
        cargarDatos();
      } else {
        error('Error', data.error || 'No se pudo actualizar la asignación');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error', 'No se pudo procesar la solicitud');
    } finally {
      setProcesando(null);
    }
  };

  const gruposFiltrados = grupos.filter(grupo =>
    grupo.codigo_grupo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    grupo.curso.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    grupo.curso.codigo.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const gruposAsignados = gruposFiltrados.filter(g => g.asignado);
  const gruposNoAsignados = gruposFiltrados.filter(g => !g.asignado);

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Asignar Grupos
          </h1>

          {docente && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Docente:</strong> {docente.nombres} {docente.apellidos} ({docente.codigo_docente})
              </p>
              <p className="text-gray-600 text-sm">
                Puedes asignar grupos de los cursos que ya tienes asignados
              </p>
            </div>
          )}
        </div>

        {/* Filtro */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar por código de grupo o nombre de curso..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {grupos.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 font-medium">
              ℹ️ No hay grupos disponibles
            </p>
            <p className="text-yellow-600 text-sm mt-2">
              Primero asigna cursos al docente para que aparezcan los grupos disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grupos Asignados */}
            {gruposAsignados.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  ✓ Grupos Asignados ({gruposAsignados.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gruposAsignados.map(grupo => (
                    <div
                      key={grupo.id_grupo}
                      className="bg-green-50 border-2 border-green-300 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {grupo.curso.codigo} - {grupo.codigo_grupo}
                          </h3>
                          <p className="text-sm text-gray-600">{grupo.curso.nombre}</p>
                        </div>
                        <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">
                          Asignado
                        </span>
                      </div>

                      <div className="bg-green-100 rounded p-2 text-sm text-gray-700 mb-3">
                        <p>Capacidad: {grupo.capacidad_maxima}</p>
                        <p>Matriculados: {grupo.cantidad_matriculados}</p>
                      </div>

                      <button
                        onClick={() => handleAsignarGrupo(grupo)}
                        disabled={procesando === grupo.id_grupo}
                        className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {procesando === grupo.id_grupo ? '⏳ Procesando...' : '✕ Desasignar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grupos Disponibles */}
            {gruposNoAsignados.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                  ◎ Grupos Disponibles ({gruposNoAsignados.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gruposNoAsignados.map(grupo => (
                    <div
                      key={grupo.id_grupo}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition hover:border-blue-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {grupo.curso.codigo} - {grupo.codigo_grupo}
                          </h3>
                          <p className="text-sm text-gray-600">{grupo.curso.nombre}</p>
                        </div>
                      </div>

                      <div className="bg-gray-100 rounded p-2 text-sm text-gray-700 mb-3">
                        <p>Capacidad: {grupo.capacidad_maxima}</p>
                        <p>Matriculados: {grupo.cantidad_matriculados}</p>
                      </div>

                      <button
                        onClick={() => handleAsignarGrupo(grupo)}
                        disabled={procesando === grupo.id_grupo}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {procesando === grupo.id_grupo ? '⏳ Asignando...' : '✓ Asignar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sin resultados de filtro */}
            {gruposFiltrados.length === 0 && filtroTexto && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600">
                  No hay grupos que coincidan con tu búsqueda
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
