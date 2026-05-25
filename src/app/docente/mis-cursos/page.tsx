'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Curso {
  id_docente_curso: number;
  id_curso: number;
  id_docente: number;
  tipo_clase: string;
  experiencia_anios: number;
  prioridad: number;
  curso: {
    id_curso: number;
    codigo: string;
    nombre: string;
    horas_teoria: number;
    horas_laboratorio: number;
    horas_practica: number;
    creditos: number;
    ciclo: number;
  };
}

interface Grupo {
  id_grupo: number;
  codigo_grupo: string;
  capacidad_maxima: number;
  cantidad_matriculados?: number | null;
  activo?: boolean;
  id_periodo: number;
  curso: {
    id_curso: number;
    codigo: string;
    nombre: string;
    ciclo?: number | null;
  };
  periodo?: {
    id_periodo: number;
    nombre: string;
    codigo?: string;
  };
}

export default function MisCursosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [horasTotales, setHorasTotales] = useState(0);
  const [tabActiva, setTabActiva] = useState<'cursos' | 'grupos'>('cursos');

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
    cargarDatos(user.id_docente);
  }, [router]);

  const cargarDatos = async (id_docente: number) => {
    try {
      const [resCursos, resGrupos] = await Promise.all([
        fetch(`/api/docentes/asignar-cursos?id_docente=${id_docente}`),
        fetch(`/api/grupos?id_docente=${id_docente}`)
      ]);

      const dataCursos = await resCursos.json();
      const dataGrupos = await resGrupos.json();

      if (dataCursos.exito) {
        setCursos(dataCursos.datos || []);
        setHorasTotales(dataCursos.horas_totales || 0);
      }

      if (dataGrupos.exito) {
        setGrupos(dataGrupos.datos || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis cursos y grupos</h1>
          <p className="text-gray-600 mt-1">
            Cursos y grupos de estudiantes asignados para dictar
          </p>
        </div>

        {/* Información de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-blue-600 text-sm font-medium">Horas Totales Asignadas</p>
            <p className="text-3xl font-bold text-blue-800 mt-2">{horasTotales} horas</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-purple-600 text-sm font-medium">Cursos Asignados</p>
            <p className="text-3xl font-bold text-purple-800 mt-2">{cursos.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-green-600 text-sm font-medium">Grupos Asignados</p>
            <p className="text-3xl font-bold text-green-800 mt-2">{grupos.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button
              onClick={() => setTabActiva('cursos')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                tabActiva === 'cursos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Mis Cursos ({cursos.length})
            </button>
            <button
              onClick={() => setTabActiva('grupos')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                tabActiva === 'grupos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Mis Grupos ({grupos.length})
            </button>
          </div>

          {/* Tab: Cursos */}
          {tabActiva === 'cursos' && (
            <>
              {cursos.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">
                    No tienes cursos asignados actualmente.
                  </p>
                  <p className="text-gray-400">
                    Contacta con el administrador para que te asigne cursos.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {cursos.map((curso) => {
                    const horasCurso =
                      (curso.curso.horas_teoria || 0) +
                      (curso.curso.horas_laboratorio || 0) +
                      (curso.curso.horas_practica || 0);

                    return (
                      <div
                        key={curso.id_docente_curso}
                        className="p-6 hover:bg-gray-50 transition"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          {/* Código del Curso */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Código</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {curso.curso.codigo}
                            </p>
                          </div>

                          {/* Nombre del Curso */}
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500 font-medium uppercase">Nombre</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {curso.curso.nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Ciclo {curso.curso.ciclo}
                            </p>
                          </div>

                          {/* Horas */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Horas</p>
                            <p className="text-lg font-bold text-blue-600 mt-1">{horasCurso}</p>
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              <p>T: {curso.curso.horas_teoria || 0}</p>
                              <p>L: {curso.curso.horas_laboratorio || 0}</p>
                              <p>P: {curso.curso.horas_practica || 0}</p>
                            </div>
                          </div>

                          {/* Tipo */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Tipo</p>
                            <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {curso.tipo_clase}
                            </span>
                          </div>

                          {/* Créditos */}
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase">Créditos</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {curso.curso.creditos}
                            </p>
                          </div>
                        </div>

                        {/* Detalles adicionales */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                          <div className="text-gray-600">
                            <span className="font-medium">Años de experiencia:</span> {curso.experiencia_anios}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Prioridad:</span> {curso.prioridad}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Tab: Grupos */}
          {tabActiva === 'grupos' && (
            <>
              {grupos.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">
                    No tienes grupos asignados actualmente.
                  </p>
                  <p className="text-gray-400">
                    Los grupos se asignan cuando confirms horarios en "Seleccionar Horarios".
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {grupos.map((grupo) => (
                    <div
                      key={grupo.id_grupo}
                      className="p-6 hover:bg-gray-50 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Código del Grupo */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Código Grupo</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {grupo.curso?.codigo ? `${grupo.curso.codigo} - ${grupo.codigo_grupo}` : grupo.codigo_grupo}
                          </p>
                        </div>

                        {/* Número de Grupo */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Número</p>
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            {grupo.id_grupo}
                          </p>
                        </div>

                        {/* Ciclo */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Ciclo</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {grupo.curso?.ciclo ?? '-'}
                          </p>
                        </div>

                        {/* Cantidad de Estudiantes */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Estudiantes</p>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            {grupo.cantidad_matriculados ?? 0}
                          </p>
                        </div>

                        {/* Cursos del Grupo */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Información</p>
                          <div className="mt-1 text-sm text-gray-900">
                            <p><strong>Curso:</strong> {grupo.curso?.nombre || '-'}</p>
                            <p><strong>Período:</strong> {grupo.periodo?.nombre || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            💡 <strong>Nota:</strong> Los cursos mostrados son los que el administrador ha asignado para dictar.
            Los grupos se asignan automáticamente cuando confirmas horarios en "Seleccionar Horarios".
            Usa estos datos para planificar tus clases y consultar tu carga docente.
          </p>
        </div>
      </div>
    </div>
  );
}
