'use client';

import { useEffect, useMemo, useState } from 'react';
import { Boton } from '@/components/ui/Boton';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { obtenerEtiquetaCarreraCurso, obtenerCodigoTipoCurso, TIPOS_CURSO_OPTIONS } from '@/lib/cursos';

type PlanResumen = {
  id_plan: number;
  codigo: string;
  nombre: string;
  anio_creacion: number;
  anio_vigencia: number;
  estado: boolean;
  version_actual: number;
  total_cursos: number;
  total_creditos: number;
  departamento?: {
    nombre: string;
  } | null;
};

type CursoPlan = {
  id_curso: number;
  codigo: string;
  nombre: string;
  tipo_curso: string | null;
  horas_teoria: number;
  horas_practica: number;
  horas_laboratorio: number;
  creditos: number;
  ciclo: number | null;
  prerequisitos: string | null;
  prerequisito_ids?: number[];
  prerequisitos_detalle?: Array<{
    id_curso: number;
    codigo: string;
    nombre: string;
  }>;
  escuela_profesional?: string | null;
  departamento?: {
    nombre: string;
  } | null;
};

type VersionPlan = {
  id_version: number;
  numero_version: number;
  fecha_modificacion: string;
  descripcion_cambios?: string | null;
  cursos_agregados?: Array<{ codigo: string; nombre: string }>;
  cursos_eliminados?: Array<{ codigo: string; nombre: string }>;
  cursos_modificados?: Array<{ codigo: string; nombre: string; cambios: Record<string, { antes: unknown; despues: unknown }> }>;
  restaurada_desde_version?: number | null;
  usuario_responsable?: {
    nombres: string;
    apellidos: string;
    codigo: string;
  } | null;
};

type PlanDetalle = {
  id_plan: number;
  codigo: string;
  nombre: string;
  anio_creacion: number;
  anio_vigencia: number;
  estado: boolean;
  resolucion_aprobacion?: string | null;
  descripcion_cambios?: string | null;
  version_actual: number;
  fecha_ultima_modificacion?: string | null;
  departamento?: {
    id_departamento: number;
    nombre: string;
  } | null;
  usuario_modificador?: {
    nombres: string;
    apellidos: string;
    codigo: string;
  } | null;
  versiones: VersionPlan[];
};

type Departamento = {
  id_departamento: number;
  nombre: string;
};

type CursoEditable = {
  id_curso: number;
  codigo: string;
  nombre: string;
  tipo_curso: string;
  ciclo: string;
  creditos: string;
  horas_teoria: string;
  horas_practica: string;
  horas_laboratorio: string;
  prerequisito_ids: string[];
};

type FormularioPlan = {
  nombre: string;
  codigo: string;
  anio_creacion: string;
  anio_vigencia: string;
  estado: boolean;
  resolucion_aprobacion: string;
  id_departamento: string;
  descripcion_cambios: string;
  cursos: CursoEditable[];
};

type FormularioNuevoPlan = {
  nombre: string;
  codigo: string;
  anio_creacion: string;
  anio_vigencia: string;
  estado: boolean;
  resolucion_aprobacion: string;
  id_departamento: string;
  descripcion_cambios: string;
};

const tabs = [
  { id: 'cursos', name: 'Cursos por ciclo' },
  { id: 'malla', name: 'Malla curricular' },
  { id: 'gestion', name: 'Gestión del plan' }
];

function formatearFechaHora(valor?: string | null) {
  if (!valor) return '-';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '-';
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(fecha);
}

function resolverPrerequisitoIds(curso: CursoPlan, cursos: CursoPlan[]) {
  if (Array.isArray(curso.prerequisito_ids)) {
    return curso.prerequisito_ids.map((id) => String(id));
  }

  if (!curso.prerequisitos) return [];

  return curso.prerequisitos
    .split(',')
    .map((fragmento) => fragmento.trim().toLowerCase())
    .map((texto) => {
      const encontrado = cursos.find((cursoActual) =>
        texto.startsWith(cursoActual.codigo.toLowerCase()) || texto.includes(cursoActual.nombre.toLowerCase())
      );
      return encontrado ? String(encontrado.id_curso) : '';
    })
    .filter(Boolean);
}

function formatearTextoOracion(valor?: string | null) {
  const texto = String(valor || '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!texto) return '-';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function crearFormulario(plan: PlanDetalle, cursos: CursoPlan[]) {
  return {
    nombre: plan.nombre,
    codigo: plan.codigo,
    anio_creacion: String(plan.anio_creacion),
    anio_vigencia: String(plan.anio_vigencia),
    estado: plan.estado,
    resolucion_aprobacion: plan.resolucion_aprobacion || '',
    id_departamento: plan.departamento ? String(plan.departamento.id_departamento) : '',
    descripcion_cambios: '',
    cursos: cursos.map((curso) => ({
      id_curso: curso.id_curso,
      codigo: curso.codigo,
      nombre: curso.nombre,
      tipo_curso: curso.tipo_curso || '',
      ciclo: curso.ciclo ? String(curso.ciclo) : '',
      creditos: String(curso.creditos),
      horas_teoria: String(curso.horas_teoria || 0),
      horas_practica: String(curso.horas_practica || 0),
      horas_laboratorio: String(curso.horas_laboratorio || 0),
      prerequisito_ids: resolverPrerequisitoIds(curso, cursos)
    }))
  };
}

export default function PlanEstudiosPage() {
  const [activeTab, setActiveTab] = useState('cursos');
  const [planes, setPlanes] = useState<PlanResumen[]>([]);
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState('');
  const [detalle, setDetalle] = useState<PlanDetalle | null>(null);
  const [cursos, setCursos] = useState<CursoPlan[]>([]);
  const [cursosDisponibles, setCursosDisponibles] = useState<CursoPlan[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [restaurandoVersion, setRestaurandoVersion] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalNuevoPlanAbierto, setModalNuevoPlanAbierto] = useState(false);
  const [formulario, setFormulario] = useState<FormularioPlan | null>(null);
  const [formularioNuevo, setFormularioNuevo] = useState<FormularioNuevoPlan>({
    nombre: '',
    codigo: '',
    anio_creacion: '',
    anio_vigencia: '',
    estado: true,
    resolucion_aprobacion: '',
    id_departamento: '',
    descripcion_cambios: ''
  });
  const [cursoAgregarId, setCursoAgregarId] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [paginaCursosGestion, setPaginaCursosGestion] = useState(1);
  const cursosPorPagina = 8;

  useEffect(() => {
    cargarPlanes();
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    if (planSeleccionadoId) {
      cargarDetalle(Number.parseInt(planSeleccionadoId, 10));
    }
  }, [planSeleccionadoId]);

  useEffect(() => {
    setPaginaCursosGestion(1);
  }, [detalle?.id_plan]);

  const ciclos = useMemo(
    () => Array.from(new Set(cursos.map((curso) => curso.ciclo || 0))).sort((a, b) => a - b),
    [cursos]
  );

  const planResumenSeleccionado = planes.find((plan) => String(plan.id_plan) === planSeleccionadoId);

  async function cargarPlanes() {
    setLoadingPlanes(true);
    try {
      const response = await fetch('/api/planes-estudio');
      const data = await response.json();
      if (!response.ok || !data.exito) {
        throw new Error(data.error || 'No se pudieron cargar los planes de estudio.');
      }
      setPlanes(data.datos || []);
      if ((data.datos || []).length && !planSeleccionadoId) {
        setPlanSeleccionadoId(String(data.datos[0].id_plan));
      }
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'No se pudieron cargar los planes de estudio.' });
    } finally {
      setLoadingPlanes(false);
    }
  }

  async function cargarDepartamentos() {
    try {
      const response = await fetch('/api/departamentos');
      const data = await response.json();
      if (data.exito) {
        setDepartamentos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando departamentos:', error);
    }
  }

  async function cargarDetalle(idPlan: number) {
    setLoadingDetalle(true);
    try {
      const response = await fetch(`/api/planes-estudio/${idPlan}`);
      const data = await response.json();
      if (!response.ok || !data.exito) {
        throw new Error(data.error || 'No se pudo cargar el detalle del plan.');
      }
      setDetalle(data.datos.plan);
      setCursos(data.datos.cursos || []);
      setCursosDisponibles(data.datos.cursos_disponibles || []);
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'No se pudo cargar el detalle del plan.' });
    } finally {
      setLoadingDetalle(false);
    }
  }

  function abrirEdicion() {
    if (!detalle) return;
    setFormulario(crearFormulario(detalle, cursos));
    setErrores({});
    setCursoAgregarId('');
    setModalEdicionAbierto(true);
  }

  function abrirNuevoPlan() {
    setFormularioNuevo({
      nombre: '',
      codigo: '',
      anio_creacion: '',
      anio_vigencia: '',
      estado: true,
      resolucion_aprobacion: '',
      id_departamento: '',
      descripcion_cambios: ''
    });
    setErrores({});
    setModalNuevoPlanAbierto(true);
  }

  function actualizarCurso(indice: number, cambios: Partial<CursoEditable>) {
    if (!formulario) return;
    const actualizados = [...formulario.cursos];
    actualizados[indice] = { ...actualizados[indice], ...cambios };
    setFormulario({ ...formulario, cursos: actualizados });
  }

  function eliminarCurso(idCurso: number) {
    if (!formulario) return;
    setFormulario({
      ...formulario,
      cursos: formulario.cursos.filter((curso) => curso.id_curso !== idCurso)
    });
  }

  function agregarCursoAlFormulario() {
    if (!formulario || !cursoAgregarId) return;
    const curso = cursosDisponibles.find((item) => String(item.id_curso) === cursoAgregarId);
    if (!curso) return;

    const yaExiste = formulario.cursos.some((item) => item.id_curso === curso.id_curso);
    if (yaExiste) {
      setMensaje({ tipo: 'error', texto: 'Ese curso ya está incluido en el plan.' });
      return;
    }

    setFormulario({
      ...formulario,
      cursos: [
        ...formulario.cursos,
        {
          id_curso: curso.id_curso,
          codigo: curso.codigo,
          nombre: curso.nombre,
          tipo_curso: curso.tipo_curso || '',
          ciclo: curso.ciclo ? String(curso.ciclo) : '',
          creditos: String(curso.creditos),
          horas_teoria: String(curso.horas_teoria || 0),
          horas_practica: String(curso.horas_practica || 0),
          horas_laboratorio: String(curso.horas_laboratorio || 0),
          prerequisito_ids: []
        }
      ]
    });
    setCursoAgregarId('');
  }

  async function guardarCambios() {
    if (!formulario || !detalle) return;
    setGuardando(true);
    setErrores({});
    setMensaje(null);

    try {
      const idsIniciales = new Set(cursos.map((curso) => curso.id_curso));
      const idsActuales = new Set(formulario.cursos.map((curso) => curso.id_curso));

      const cursosAgregados = formulario.cursos
        .filter((curso) => !idsIniciales.has(curso.id_curso))
        .map((curso) => curso.id_curso);

      const cursosEliminados = cursos
        .filter((curso) => !idsActuales.has(curso.id_curso))
        .map((curso) => curso.id_curso);

      const cursosModificados = formulario.cursos
        .filter((curso) => {
          if (!idsIniciales.has(curso.id_curso)) return false;
          const original = cursos.find((item) => item.id_curso === curso.id_curso);
          if (!original) return false;
          return (
            original.nombre !== curso.nombre ||
            (original.tipo_curso || '') !== curso.tipo_curso ||
            String(original.ciclo || '') !== curso.ciclo ||
            String(original.creditos) !== curso.creditos ||
            String(original.horas_teoria || 0) !== curso.horas_teoria ||
            String(original.horas_practica || 0) !== curso.horas_practica ||
            String(original.horas_laboratorio || 0) !== curso.horas_laboratorio ||
            JSON.stringify(resolverPrerequisitoIds(original, cursos)) !== JSON.stringify(curso.prerequisito_ids)
          );
        })
        .map((curso) => ({
          id_curso: curso.id_curso,
          nombre: curso.nombre,
          tipo_curso: curso.tipo_curso,
          ciclo: curso.ciclo,
          creditos: curso.creditos,
          horas_teoria: curso.horas_teoria,
          horas_practica: curso.horas_practica,
          horas_laboratorio: curso.horas_laboratorio,
          prerequisito_ids: curso.prerequisito_ids
        }));

      const response = await fetch(`/api/planes-estudio/${detalle.id_plan}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formulario,
          cursos_agregados: cursosAgregados,
          cursos_eliminados: cursosEliminados,
          cursos_modificados: cursosModificados
        })
      });

      const data = await response.json();
      if (!response.ok || !data.exito) {
        if (data.errores) {
          setErrores(data.errores);
        }
        throw new Error(data.error || 'No se pudo actualizar el plan.');
      }

      setMensaje({ tipo: 'ok', texto: data.mensaje || 'Plan de estudio actualizado correctamente.' });
      setModalEdicionAbierto(false);
      await cargarPlanes();
      await cargarDetalle(detalle.id_plan);
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'No se pudo actualizar el plan.' });
    } finally {
      setGuardando(false);
    }
  }

  async function crearPlan() {
    setCreando(true);
    setErrores({});
    setMensaje(null);

    try {
      const response = await fetch('/api/planes-estudio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formularioNuevo)
      });

      const data = await response.json();
      if (!response.ok || !data.exito) {
        if (data.errores) {
          setErrores(data.errores);
        }
        throw new Error(data.error || 'No se pudo crear el plan.');
      }

      setMensaje({ tipo: 'ok', texto: data.mensaje || 'Plan académico creado correctamente.' });
      setModalNuevoPlanAbierto(false);
      await cargarPlanes();
      if (data.datos?.id_plan) {
        setPlanSeleccionadoId(String(data.datos.id_plan));
        await cargarDetalle(data.datos.id_plan);
      }
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'No se pudo crear el plan.' });
    } finally {
      setCreando(false);
    }
  }

  async function restaurarVersion(numeroVersion: number) {
    if (!detalle) return;
    setRestaurandoVersion(numeroVersion);
    setMensaje(null);

    try {
      const response = await fetch(`/api/planes-estudio/${detalle.id_plan}/restaurar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero_version: numeroVersion
        })
      });

      const data = await response.json();
      if (!response.ok || !data.exito) {
        throw new Error(data.error || 'No se pudo restaurar la versión seleccionada.');
      }

      setMensaje({ tipo: 'ok', texto: data.mensaje || 'Versión restaurada correctamente.' });
      await cargarPlanes();
      await cargarDetalle(detalle.id_plan);
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: error.message || 'No se pudo restaurar la versión seleccionada.' });
    } finally {
      setRestaurandoVersion(null);
    }
  }

  function exportar(formato: 'pdf' | 'xlsx') {
    if (!detalle) return;
    window.open(`/api/planes-estudio/${detalle.id_plan}/export?formato=${formato}`, '_blank');
  }

  const opcionesPlanes = planes.map((plan) => ({
    valor: String(plan.id_plan),
    etiqueta: `${plan.codigo} - ${plan.nombre}`,
    codigo: plan.codigo
  }));

  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState('');

  useEffect(() => {
    if (!cursoSeleccionadoId) return;
    // cambiar a la pestaña malla para ubicar el curso
    setActiveTab('malla');
    const id = `curso-${cursoSeleccionadoId}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [cursoSeleccionadoId]);

  const totalCreditos = cursos.reduce((sum, curso) => sum + curso.creditos, 0);
  const totalHoras = cursos.reduce(
    (sum, curso) => sum + (curso.horas_teoria || 0) + (curso.horas_practica || 0) + (curso.horas_laboratorio || 0),
    0
  );
  const totalPaginasCursosGestion = Math.max(1, Math.ceil(cursos.length / cursosPorPagina));
  const cursosPaginadosGestion = cursos.slice(
    (paginaCursosGestion - 1) * cursosPorPagina,
    paginaCursosGestion * cursosPorPagina
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan de estudios</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la información general, los cursos, las versiones y la exportación del plan de estudios.
          </p>
        </div>
        <div className="w-full lg:w-auto lg:min-w-[420px]">
          <SearchableSelect
            etiqueta="Plan activo"
            opciones={opcionesPlanes}
            value={planSeleccionadoId}
            onChange={(valor) => setPlanSeleccionadoId(String(valor))}
            placeholder={loadingPlanes ? 'Cargando planes...' : 'Seleccione un plan'}
            disabled={loadingPlanes || !opcionesPlanes.length}
            camposBusqueda={['codigo']}
          />
        </div>
        <div className="w-full lg:w-auto lg:min-w-[420px]">
          <SearchableSelect
            etiqueta="Buscar curso en plan"
            opciones={cursos.map((c) => ({
              valor: String(c.id_curso),
              etiqueta: `${c.codigo} - ${formatearTextoOracion(c.nombre)}`,
              codigo: c.codigo
            }))}
            value={cursoSeleccionadoId}
            onChange={(valor) => setCursoSeleccionadoId(String(valor))}
            placeholder={cursos.length ? 'Busca por código o nombre' : 'Cargando cursos...'}
            camposBusqueda={["codigo"]}
            disabled={!cursos.length}
          />
        </div>
      </div>

      {mensaje && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensaje.tipo === 'ok'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {loadingDetalle ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando detalle del plan...</div>
        </div>
      ) : !detalle ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
          No hay planes de estudio disponibles para mostrar.
        </div>
      ) : (
        <>
          {activeTab === 'cursos' && (
            <div className="space-y-6">
              {ciclos.map((ciclo) => {
                const cursosCiclo = cursos.filter((curso) => (curso.ciclo || 0) === ciclo);
                const totalCreditosCiclo = cursosCiclo.reduce((sum, curso) => sum + curso.creditos, 0);
                return (
                  <div key={ciclo} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Ciclo {ciclo}</h2>
                        <p className="text-sm text-gray-500">
                          {cursosCiclo.length} curso(s) • {totalCreditosCiclo} créditos
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        Horas totales:{' '}
                        {cursosCiclo.reduce(
                          (sum, curso) => sum + curso.horas_teoria + curso.horas_practica + curso.horas_laboratorio,
                          0
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cursosCiclo.map((curso) => (
                        <div id={`curso-${curso.id_curso}`} key={curso.id_curso} className={"border rounded-lg p-4 " + (String(curso.id_curso) === cursoSeleccionadoId ? 'ring-2 ring-indigo-300' : '')}>
                          <div className="font-medium text-gray-900">{curso.codigo} - {formatearTextoOracion(curso.nombre)}</div>
                          <div className="mt-2 text-xs text-gray-500">
                            Tipo: {obtenerCodigoTipoCurso(curso.tipo_curso)} • Escuela:{' '}
                            {obtenerEtiquetaCarreraCurso(curso.departamento?.nombre || curso.escuela_profesional)}
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>T: {curso.horas_teoria}</span>
                            <span>P: {curso.horas_practica}</span>
                            <span>L: {curso.horas_laboratorio}</span>
                            <span>{curso.creditos} créditos</span>
                          </div>
                          {curso.prerequisitos && (
                            <div className="mt-2 text-xs text-gray-400">Prerrequisitos: {curso.prerequisitos}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'malla' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{formatearTextoOracion(detalle.nombre)}</h2>
                  <p className="text-sm text-gray-500">
                    {detalle.codigo} • {detalle.departamento?.nombre || 'Sin escuela profesional'}
                  </p>
                </div>
                <div className="text-sm text-gray-500">Versión actual: {detalle.version_actual}</div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(ciclos.length, 1)}, minmax(220px, 1fr))`, gap: '1rem' }}>
                    {ciclos.map((ciclo) => (
                      <div key={ciclo} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-center font-bold text-lg mb-4 text-gray-800 border-b pb-2">Ciclo {ciclo}</div>
                        <div className="space-y-3">
                          {cursos
                            .filter((curso) => (curso.ciclo || 0) === ciclo)
                            .map((curso) => (
                              <div id={`curso-${curso.id_curso}`} key={curso.id_curso} className={"bg-white rounded p-3 border shadow-sm " + (String(curso.id_curso) === cursoSeleccionadoId ? 'ring-2 ring-indigo-300' : '')}>
                                <div className="font-medium text-sm text-gray-900">{curso.codigo}</div>
                                <div className="text-xs text-gray-600 mt-1">{formatearTextoOracion(curso.nombre)}</div>
                                <div className="text-[11px] text-gray-500 mt-1">
                                  {obtenerCodigoTipoCurso(curso.tipo_curso)} •{' '}
                                  {obtenerEtiquetaCarreraCurso(curso.departamento?.nombre || curso.escuela_profesional)}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                  <span>{curso.horas_teoria + curso.horas_practica + curso.horas_laboratorio}h</span>
                                  <span>{curso.creditos}cr</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gestion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Cursos</h3>
                  <p className="text-3xl font-bold text-blue-600">{cursos.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Cursos activos del plan</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de créditos</h3>
                  <p className="text-3xl font-bold text-green-600">{totalCreditos}</p>
                  <p className="text-sm text-gray-500 mt-1">Créditos acumulados del plan</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Horas</h3>
                  <p className="text-3xl font-bold text-purple-600">{totalHoras}</p>
                  <p className="text-sm text-gray-500 mt-1">Suma de teoría, práctica y laboratorio</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Versión</h3>
                  <p className="text-3xl font-bold text-orange-600">{detalle.version_actual}</p>
                  <p className="text-sm text-gray-500 mt-1">Versión actual del plan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Información general del plan</h2>
                      <p className="text-sm text-gray-500">
                        Edita nombre, código, vigencia, escuela profesional y cursos asociados.
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-sm font-medium text-gray-700">Acciones del plan</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                        <Boton onClick={abrirNuevoPlan}>Nuevo plan académico</Boton>
                        <Boton variante="secondary" onClick={abrirEdicion}>Editar plan</Boton>
                        <Boton variante="secondary" onClick={() => exportar('xlsx')}>Exportar Excel</Boton>
                        <Boton variante="secondary" onClick={() => exportar('pdf')}>Exportar PDF</Boton>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Nombre del plan</div>
                      <div className="mt-1 font-semibold text-gray-900">{formatearTextoOracion(detalle.nombre)}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Código del plan</div>
                      <div className="mt-1 font-semibold text-gray-900">{detalle.codigo}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Año de creación</div>
                      <div className="mt-1 font-semibold text-gray-900">{detalle.anio_creacion}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Año de vigencia</div>
                      <div className="mt-1 font-semibold text-gray-900">{detalle.anio_vigencia}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Estado</div>
                      <div className="mt-1 font-semibold text-gray-900">{detalle.estado ? 'Activo' : 'Inactivo'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Escuela profesional</div>
                      <div className="mt-1 font-semibold text-gray-900">
                        {obtenerEtiquetaCarreraCurso(detalle.departamento?.nombre || '') || '-'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 md:col-span-2">
                      <div className="text-gray-500">Resolución de aprobación</div>
                      <div className="mt-1 font-semibold text-gray-900">{detalle.resolucion_aprobacion || '-'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Último responsable</div>
                      <div className="mt-1 font-semibold text-gray-900">
                        {detalle.usuario_modificador
                          ? formatearTextoOracion(`${detalle.usuario_modificador.nombres} ${detalle.usuario_modificador.apellidos}`)
                          : '-'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="text-gray-500">Fecha y hora de modificación</div>
                      <div className="mt-1 font-semibold text-gray-900">{formatearFechaHora(detalle.fecha_ultima_modificacion)}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cursos del plan</h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciclo</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créditos</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prerrequisitos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {cursosPaginadosGestion.map((curso) => (
                            <tr key={curso.id_curso}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{curso.codigo}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{formatearTextoOracion(curso.nombre)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{obtenerCodigoTipoCurso(curso.tipo_curso)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{curso.ciclo || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{curso.creditos}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                T:{curso.horas_teoria} P:{curso.horas_practica} L:{curso.horas_laboratorio}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{curso.prerequisitos || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-gray-500">
                        Mostrando {cursos.length ? (paginaCursosGestion - 1) * cursosPorPagina + 1 : 0}-
                        {Math.min(paginaCursosGestion * cursosPorPagina, cursos.length)} de {cursos.length} cursos
                      </div>
                      <div className="flex items-center gap-2">
                        <Boton
                          variante="secondary"
                          tamaño="sm"
                          onClick={() => setPaginaCursosGestion((pagina) => Math.max(1, pagina - 1))}
                          disabled={paginaCursosGestion === 1}
                        >
                          Anterior
                        </Boton>
                        <span className="text-sm text-gray-600">
                          Página {paginaCursosGestion} de {totalPaginasCursosGestion}
                        </span>
                        <Boton
                          variante="secondary"
                          tamaño="sm"
                          onClick={() =>
                            setPaginaCursosGestion((pagina) => Math.min(totalPaginasCursosGestion, pagina + 1))
                          }
                          disabled={paginaCursosGestion === totalPaginasCursosGestion}
                        >
                          Siguiente
                        </Boton>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Historial de versiones</h2>
                    <p className="text-sm text-gray-500">
                      Consulta versiones anteriores, compara cambios y restaura una versión previa.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {detalle.versiones.length ? (
                      detalle.versiones.map((version) => (
                        <div key={version.id_version} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">Versión {version.numero_version}</div>
                              <div className="text-xs text-gray-500">{formatearFechaHora(version.fecha_modificacion)}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {version.usuario_responsable
                                  ? formatearTextoOracion(`${version.usuario_responsable.nombres} ${version.usuario_responsable.apellidos}`)
                                  : 'Sin usuario registrado'}
                              </div>
                            </div>
                            <Boton
                              tamaño="sm"
                              variante="secondary"
                              onClick={() => restaurarVersion(version.numero_version)}
                              disabled={restaurandoVersion === version.numero_version}
                            >
                              {restaurandoVersion === version.numero_version ? 'Restaurando...' : 'Restaurar'}
                            </Boton>
                          </div>

                          <p className="text-sm text-gray-700 mt-3">
                            {version.descripcion_cambios ? formatearTextoOracion(version.descripcion_cambios) : 'Sin descripción registrada.'}
                          </p>
                          {version.restaurada_desde_version ? (
                            <p className="text-xs text-orange-600 mt-2">
                              Esta versión proviene de una restauración desde la versión {version.restaurada_desde_version}.
                            </p>
                          ) : null}

                          <div className="mt-3 grid grid-cols-1 gap-3 text-xs">
                            <div className="rounded-md bg-green-50 border border-green-100 p-3">
                              <div className="font-semibold text-green-700">Cursos agregados</div>
                              <div className="mt-1 text-green-800">
                                {version.cursos_agregados?.length
                                  ? version.cursos_agregados.map((curso) => `${curso.codigo} ${curso.nombre}`).join(', ')
                                  : 'Sin cursos agregados'}
                              </div>
                            </div>
                            <div className="rounded-md bg-red-50 border border-red-100 p-3">
                              <div className="font-semibold text-red-700">Cursos eliminados</div>
                              <div className="mt-1 text-red-800">
                                {version.cursos_eliminados?.length
                                  ? version.cursos_eliminados.map((curso) => `${curso.codigo} ${curso.nombre}`).join(', ')
                                  : 'Sin cursos eliminados'}
                              </div>
                            </div>
                            <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
                              <div className="font-semibold text-blue-700">Cursos modificados</div>
                              <div className="mt-1 text-blue-800">
                                {version.cursos_modificados?.length
                                  ? version.cursos_modificados
                                      .map((curso) => {
                                        const campos = Object.keys(curso.cambios || {}).join(', ');
                                        return `${curso.codigo} ${formatearTextoOracion(curso.nombre)}${campos ? ` (${campos})` : ''}`;
                                      })
                                      .join(', ')
                                  : 'Sin cursos modificados'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                        Aún no hay versiones registradas para este plan.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        abierto={modalEdicionAbierto && !!formulario}
        alCerrar={() => !guardando && setModalEdicionAbierto(false)}
        titulo="Editar plan de estudios"
        tamaño="xl"
      >
        {formulario && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del plan *</label>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                {errores.nombre && <p className="text-sm text-red-600 mt-1">{errores.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código del plan *</label>
                <input
                  type="text"
                  value={formulario.codigo}
                  onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                {errores.codigo && <p className="text-sm text-red-600 mt-1">{errores.codigo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año de creación *</label>
                <input
                  type="number"
                  value={formulario.anio_creacion}
                  onChange={(e) => setFormulario({ ...formulario, anio_creacion: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                {errores.anio_creacion && <p className="text-sm text-red-600 mt-1">{errores.anio_creacion}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año de vigencia *</label>
                <input
                  type="number"
                  value={formulario.anio_vigencia}
                  onChange={(e) => setFormulario({ ...formulario, anio_vigencia: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                {errores.anio_vigencia && <p className="text-sm text-red-600 mt-1">{errores.anio_vigencia}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resolución de aprobación</label>
                <input
                  type="text"
                  value={formulario.resolucion_aprobacion}
                  onChange={(e) => setFormulario({ ...formulario, resolucion_aprobacion: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <input
                  id="estado-plan"
                  type="checkbox"
                  checked={formulario.estado}
                  onChange={(e) => setFormulario({ ...formulario, estado: e.target.checked })}
                />
                <label htmlFor="estado-plan" className="text-sm font-medium text-gray-700">
                  Plan activo
                </label>
              </div>
              <div className="md:col-span-2">
                <SearchableSelect
                  etiqueta="Escuela profesional"
                  opciones={departamentos.map((departamento) => ({
                    valor: String(departamento.id_departamento),
                    etiqueta: obtenerEtiquetaCarreraCurso(departamento.nombre)
                  }))}
                  value={formulario.id_departamento}
                  onChange={(valor) => setFormulario({ ...formulario, id_departamento: String(valor) })}
                  placeholder="Seleccione"
                  required
                  error={errores.id_departamento}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Descripción de cambios</label>
                <textarea
                  value={formulario.descripcion_cambios}
                  onChange={(e) => setFormulario({ ...formulario, descripcion_cambios: e.target.value })}
                  className="w-full border rounded px-3 py-2 min-h-[88px]"
                  placeholder="Describe los cambios realizados en esta versión"
                />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <SearchableSelect
                    etiqueta="Agregar curso al plan"
                    opciones={cursosDisponibles
                      .filter((curso) => !formulario.cursos.some((actual) => actual.id_curso === curso.id_curso))
                      .map((curso) => ({
                        valor: String(curso.id_curso),
                        etiqueta: `${curso.codigo} - ${curso.nombre}`,
                        codigo: curso.codigo
                      }))}
                    value={cursoAgregarId}
                    onChange={(valor) => setCursoAgregarId(String(valor))}
                    placeholder="Seleccione un curso"
                    camposBusqueda={['codigo']}
                  />
                </div>
                <Boton type="button" onClick={agregarCursoAlFormulario} disabled={!cursoAgregarId}>
                  Agregar curso
                </Boton>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {formulario.cursos.map((curso, indice) => {
                  const opcionesPrerequisito = formulario.cursos
                    .filter(
                      (item) =>
                        item.id_curso !== curso.id_curso &&
                        !curso.prerequisito_ids.includes(String(item.id_curso))
                    )
                    .map((item) => ({
                      valor: String(item.id_curso),
                      etiqueta: `${item.codigo} - ${item.nombre}`,
                      codigo: item.codigo
                    }));
                  const prerequisitosSeleccionados = formulario.cursos.filter((item) =>
                    curso.prerequisito_ids.includes(String(item.id_curso))
                  );

                  return (
                    <div key={curso.id_curso} className="rounded-lg border border-gray-200 p-4 space-y-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{curso.codigo}</div>
                          <div className="text-xs text-gray-500">Edita horas, créditos, tipo y prerrequisitos.</div>
                        </div>
                        <Boton type="button" variante="danger" tamaño="sm" onClick={() => eliminarCurso(curso.id_curso)}>
                          Quitar del plan
                        </Boton>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Nombre del curso</label>
                          <input
                            type="text"
                            value={curso.nombre}
                            onChange={(e) => actualizarCurso(indice, { nombre: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <SearchableSelect
                          etiqueta="Tipo de curso"
                          opciones={TIPOS_CURSO_OPTIONS.map((opcion) => ({
                            valor: opcion.valor,
                            etiqueta: opcion.etiqueta
                          }))}
                          value={curso.tipo_curso}
                          onChange={(valor) => actualizarCurso(indice, { tipo_curso: String(valor) })}
                          placeholder="Seleccione"
                        />
                        <SearchableSelect
                          etiqueta="Agregar prerrequisito"
                          opciones={opcionesPrerequisito}
                          value=""
                          onChange={(valor) =>
                            actualizarCurso(indice, {
                              prerequisito_ids: Array.from(new Set([...curso.prerequisito_ids, String(valor)]))
                            })
                          }
                          placeholder="Sin prerrequisitos"
                          camposBusqueda={['codigo']}
                        />
                        <div className="md:col-span-2">
                          {prerequisitosSeleccionados.length ? (
                            <div className="flex flex-wrap gap-2">
                              {prerequisitosSeleccionados.map((prerequisito) => (
                                <span
                                  key={prerequisito.id_curso}
                                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900"
                                >
                                  {prerequisito.codigo} - {prerequisito.nombre}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      actualizarCurso(indice, {
                                        prerequisito_ids: curso.prerequisito_ids.filter(
                                          (id) => id !== String(prerequisito.id_curso)
                                        )
                                      })
                                    }
                                    className="font-semibold text-blue-700 hover:text-blue-900"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Este curso no tiene prerrequisitos configurados.</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Ciclo</label>
                          <input
                            type="number"
                            value={curso.ciclo}
                            onChange={(e) => actualizarCurso(indice, { ciclo: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Créditos</label>
                          <input
                            type="number"
                            value={curso.creditos}
                            onChange={(e) => actualizarCurso(indice, { creditos: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Horas teoría</label>
                          <input
                            type="number"
                            value={curso.horas_teoria}
                            onChange={(e) => actualizarCurso(indice, { horas_teoria: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Horas práctica</label>
                          <input
                            type="number"
                            value={curso.horas_practica}
                            onChange={(e) => actualizarCurso(indice, { horas_practica: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Horas laboratorio</label>
                          <input
                            type="number"
                            value={curso.horas_laboratorio}
                            onChange={(e) => actualizarCurso(indice, { horas_laboratorio: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Boton variante="secondary" onClick={() => setModalEdicionAbierto(false)} disabled={guardando}>
                Cancelar
              </Boton>
              <Boton onClick={guardarCambios} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </Boton>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        abierto={modalNuevoPlanAbierto}
        alCerrar={() => !creando && setModalNuevoPlanAbierto(false)}
        titulo="Nuevo plan académico"
        tamaño="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del plan *</label>
              <input
                type="text"
                value={formularioNuevo.nombre}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, nombre: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              {errores.nombre && <p className="text-sm text-red-600 mt-1">{errores.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Código del plan *</label>
              <input
                type="text"
                value={formularioNuevo.codigo}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, codigo: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              {errores.codigo && <p className="text-sm text-red-600 mt-1">{errores.codigo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Año de creación *</label>
              <input
                type="number"
                value={formularioNuevo.anio_creacion}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, anio_creacion: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              {errores.anio_creacion && <p className="text-sm text-red-600 mt-1">{errores.anio_creacion}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Año de vigencia *</label>
              <input
                type="number"
                value={formularioNuevo.anio_vigencia}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, anio_vigencia: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              {errores.anio_vigencia && <p className="text-sm text-red-600 mt-1">{errores.anio_vigencia}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resolución de aprobación</label>
              <input
                type="text"
                value={formularioNuevo.resolucion_aprobacion}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, resolucion_aprobacion: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-3 pt-7">
              <input
                id="estado-plan-nuevo"
                type="checkbox"
                checked={formularioNuevo.estado}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, estado: e.target.checked })}
              />
              <label htmlFor="estado-plan-nuevo" className="text-sm font-medium text-gray-700">
                Plan activo
              </label>
            </div>
            <div className="md:col-span-2">
              <SearchableSelect
                etiqueta="Escuela profesional"
                opciones={departamentos.map((departamento) => ({
                  valor: String(departamento.id_departamento),
                  etiqueta: obtenerEtiquetaCarreraCurso(departamento.nombre)
                }))}
                value={formularioNuevo.id_departamento}
                onChange={(valor) => setFormularioNuevo({ ...formularioNuevo, id_departamento: String(valor) })}
                placeholder="Seleccione"
                required
                error={errores.id_departamento}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción inicial</label>
              <textarea
                value={formularioNuevo.descripcion_cambios}
                onChange={(e) => setFormularioNuevo({ ...formularioNuevo, descripcion_cambios: e.target.value })}
                className="w-full border rounded px-3 py-2 min-h-[88px]"
                placeholder="Describe el alcance inicial del plan académico"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            El nuevo plan se crea desde cero. Luego podrás editarlo y agregar cursos desde la gestión del plan.
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Boton variante="secondary" onClick={() => setModalNuevoPlanAbierto(false)} disabled={creando}>
              Cancelar
            </Boton>
            <Boton onClick={crearPlan} disabled={creando}>
              {creando ? 'Creando...' : 'Crear plan'}
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
