'use client';

import { useState, useEffect } from 'react';
import { TablaPaginada } from '@/components/ui/TablaPaginada';
import { Boton } from '@/components/ui/Boton';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';
import { obtenerCodigoTipoCurso, obtenerEtiquetaCarreraCurso, TIPOS_CURSO_OPTIONS } from '@/lib/cursos';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Curso {
  id_curso: number;
  codigo: string;
  nombre: string;
  id_departamento?: number | null;
  tipo_curso?: string | null;
  escuela_profesional?: string | null;
  plan_estudios?: string | null;
  prerequisitos?: string | null;
  prerequisito_ids?: number[];
  prerequisitos_detalle?: Array<{
    id_curso: number;
    codigo: string;
    nombre: string;
  }>;
  departamento?: {
    id_departamento: number;
    nombre: string;
  } | null;
  creditos: number;
  ciclo: number;
  horas_teoria: number;
  horas_laboratorio: number;
  horas_practica: number;
  activo: boolean;
}

interface DepartamentoAcademico {
  id_departamento: number;
  nombre: string;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoAcademico[]>([]);
  const [planesEstudio, setPlanesEstudio] = useState<{ id_plan: number; nombre: string; codigo: string; estado: boolean }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_curso: 'O',
    id_departamento: '',
    plan_estudios: '',
    prerequisito_ids: [] as string[],
    horas_teoria: 0,
    horas_laboratorio: 0,
    horas_practica: 0,
    creditos: 0,
    ciclo: 0
  });

  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  useEffect(() => {
    cargarCursos();
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    // cargar planes activos para el combobox
    const cargarPlanes = async () => {
      try {
        const resp = await fetch('/api/planes-estudio');
        const data = await resp.json();
        if (data.exito) setPlanesEstudio((data.datos || []).filter((p: any) => p.estado !== false));
      } catch (err) {
        console.error('Error cargando planes de estudio:', err);
      }
    };

    cargarPlanes();
  }, []);

  const cargarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      if (data.exito) setCursos(data.datos.filter((c: any) => c.activo !== false));
    } catch (err) {
      console.error('Error:', err);
      error('Error al cargar', 'No pudimos cargar los cursos.');
    } finally {
      setCargando(false);
    }
  };

  const cargarDepartamentos = async () => {
    try {
      const response = await fetch('/api/departamentos');
      const data = await response.json();
      if (data.exito) {
        setDepartamentos(data.datos || []);
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error al cargar', 'No pudimos cargar los departamentos académicos.');
    }
  };

  const handleAbrirModalEditar = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setFormData({
      nombre: curso.nombre,
      tipo_curso: curso.tipo_curso || 'O',
      id_departamento: curso.id_departamento ? String(curso.id_departamento) : '',
      plan_estudios: curso.plan_estudios || '',
      prerequisito_ids: (curso.prerequisito_ids || []).map((id) => String(id)),
      horas_teoria: curso.horas_teoria,
      horas_laboratorio: curso.horas_laboratorio,
      horas_practica: curso.horas_practica,
      creditos: curso.creditos,
      ciclo: curso.ciclo
    });
    setEditando(false);
    setModalAbierto(true);
  };

  const handleGuardarCambios = async () => {
    if (!cursoSeleccionado) return;

    if (!formData.nombre.trim()) {
      error('Validación', 'El nombre del curso es requerido');
      return;
    }

    if (!formData.tipo_curso) {
      error('Validación', 'El tipo de curso es obligatorio');
      return;
    }

    if (!formData.id_departamento) {
      error('Validación', 'El departamento académico del curso es obligatorio');
      return;
    }

    if (formData.prerequisito_ids.includes(String(cursoSeleccionado.id_curso))) {
      error('Validación', 'Un curso no puede ser prerrequisito de sí mismo');
      return;
    }

    if (formData.horas_teoria < 0 || formData.horas_laboratorio < 0 || formData.horas_practica < 0) {
      error('Validación', 'Las horas no pueden ser negativas');
      return;
    }

    if (formData.creditos < 0) {
      error('Validación', 'Los créditos no pueden ser negativos');
      return;
    }

    setEditando(true);
    try {
      const response = await fetch(`/api/cursos/${cursoSeleccionado.id_curso}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prerequisito_ids: formData.prerequisito_ids
        })
      });

      const data = await response.json();

      if (data.exito) {
        exito(
          '✅ Curso actualizado',
          `${formData.nombre} fue actualizado exitosamente`
        );
        setModalAbierto(false);
        cargarCursos();
      } else {
        error('Error al guardar', data.error || 'No pudimos actualizar el curso');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error inesperado', 'Ocurrió un error al actualizar el curso');
    } finally {
      setEditando(false);
    }
  };

  const handleEliminarCurso = async (curso: Curso) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${curso.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cursos/${curso.id_curso}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.exito) {
        exito(
          '✅ Curso eliminado',
          `${curso.nombre} fue eliminado exitosamente`
        );
        cargarCursos();
      } else {
        error('Error al eliminar', data.error || 'No pudimos eliminar el curso');
      }
    } catch (err) {
      console.error('Error:', err);
      error('Error inesperado', 'Ocurrió un error al eliminar el curso');
    }
  };

  const columnas = [
    { campo: 'codigo' as const, encabezado: 'Código' },
    { campo: 'nombre' as const, encabezado: 'Curso' },
    {
      campo: 'tipo_curso' as const,
      encabezado: 'Tipo',
      renderizar: (valor: string) => obtenerCodigoTipoCurso(valor)
    },
    { campo: 'creditos' as const, encabezado: 'Créditos' },
    { campo: 'ciclo' as const, encabezado: 'Ciclo' },
    {
      campo: 'horas_teoria' as const,
      encabezado: 'Horas',
      renderizar: (_: any, fila: any) => 
        `T:${fila.horas_teoria} L:${fila.horas_laboratorio} P:${fila.horas_practica}`
    },
    {
      campo: 'id_curso' as const,
      encabezado: 'Acciones',
      renderizar: (_: any, fila: Curso) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleAbrirModalEditar(fila)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center"
            title="Editar"
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
            Editar
          </button>
          <button
            onClick={() => handleEliminarCurso(fila)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex items-center"
            title="Eliminar"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
            Eliminar
          </button>
        </div>
      )
    }
  ];

  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  const textoBusqueda = busqueda.trim().toLowerCase();
  const totalHorasFormulario =
    Number(formData.horas_teoria || 0) +
    Number(formData.horas_laboratorio || 0) +
    Number(formData.horas_practica || 0);
  const prerequisitosSeleccionados = cursos.filter((curso) =>
    formData.prerequisito_ids.includes(String(curso.id_curso))
  );
  const opcionesPrerequisitos = cursoSeleccionado
    ? cursos
        .filter(
          (curso) =>
            curso.id_curso !== cursoSeleccionado.id_curso &&
            !formData.prerequisito_ids.includes(String(curso.id_curso))
        )
        .map((curso) => ({
          valor: String(curso.id_curso),
          etiqueta: `${curso.codigo} - ${curso.nombre}`
        }))
    : [];
  const cursosFiltrados = cursos.filter((c: any) => {
    if (!textoBusqueda) return true;
    const codigo = String(c.codigo || '').toLowerCase();
    const nombre = String(c.nombre || '').toLowerCase();
    const ciclo = String(c.ciclo ?? '').toLowerCase();
    const tipo = String(c.tipo_curso || '').toLowerCase();
    const carrera = String(c.departamento?.nombre || c.escuela_profesional || '').toLowerCase();
    const plan = String(c.plan_estudios || '').toLowerCase();
    return (
      codigo.includes(textoBusqueda) ||
      nombre.includes(textoBusqueda) ||
      ciclo.includes(textoBusqueda) ||
      tipo.includes(textoBusqueda) ||
      carrera.includes(textoBusqueda) ||
      plan.includes(textoBusqueda)
    );
  });

  return (
    <div className="space-y-4">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestión de cursos</h1>
          <p className="text-gray-600 mt-1">Catálogo de cursos académicos</p>
        </div>
        <Link href="/dashboard/cursos/nuevo">
          <Boton>➕ Nuevo curso</Boton>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Buscar curso</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Busca por código, nombre, tipo o ciclo..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Puedes editar el tipo de curso, los prerrequisitos y las horas desde la tabla de abajo.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow">
        <TablaPaginada datos={cursosFiltrados} columnas={columnas} keyField="id_curso" />
      </div>

      <Modal
        abierto={modalAbierto && !!cursoSeleccionado}
        alCerrar={() => !editando && setModalAbierto(false)}
        titulo="Editar curso"
        tamaño="xl"
      >
        {cursoSeleccionado && (
          <div className="space-y-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Resumen del curso</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {cursoSeleccionado.codigo} - {formData.nombre || cursoSeleccionado.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Escuela academica: {obtenerEtiquetaCarreraCurso(
                      departamentos.find((item) => String(item.id_departamento) === formData.id_departamento)?.nombre ||
                        cursoSeleccionado.departamento?.nombre ||
                        cursoSeleccionado.escuela_profesional
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-white px-3 py-2 border border-blue-100">
                    <span className="block text-xs text-gray-500">Tipo</span>
                    <span className="font-semibold text-gray-900">{obtenerCodigoTipoCurso(formData.tipo_curso)}</span>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2 border border-blue-100">
                    <span className="block text-xs text-gray-500">Total horas</span>
                    <span className="font-semibold text-gray-900">{totalHorasFormulario} h</span>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2 border border-blue-100">
                    <span className="block text-xs text-gray-500">Creditos</span>
                    <span className="font-semibold text-gray-900">{formData.creditos}</span>
                  </div>
                  <div className="rounded-md bg-white px-3 py-2 border border-blue-100">
                    <span className="block text-xs text-gray-500">Ciclo</span>
                    <span className="font-semibold text-gray-900">{formData.ciclo || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
              <section className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Datos generales</h4>
                  <p className="text-sm text-gray-500">Actualiza la informacion principal del curso.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Codigo</label>
                    <input
                      type="text"
                      value={cursoSeleccionado.codigo}
                      disabled
                      className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Plan de estudios</label>
                    <SearchableSelect
                      opciones={planesEstudio.map((p) => ({ valor: p.codigo || String(p.id_plan), etiqueta: `${p.codigo} - ${p.nombre}` }))}
                      value={formData.plan_estudios}
                      onChange={(valor) => setFormData({ ...formData, plan_estudios: String(valor) })}
                      placeholder={planesEstudio.length ? 'Selecciona un plan de estudio' : 'Cargando planes...'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del curso *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Ingenieria de Software I"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SearchableSelect
                    etiqueta="Tipo de curso"
                    opciones={TIPOS_CURSO_OPTIONS.map((opcion) => ({
                      valor: opcion.valor,
                      etiqueta: opcion.etiqueta
                    }))}
                    value={formData.tipo_curso}
                    onChange={(valor) => setFormData({ ...formData, tipo_curso: String(valor) })}
                    placeholder="Selecciona un tipo de curso"
                    required
                  />

                  <SearchableSelect
                    etiqueta="Escuela academica"
                    opciones={departamentos.map((departamento) => ({
                      valor: String(departamento.id_departamento),
                      etiqueta: obtenerEtiquetaCarreraCurso(departamento.nombre)
                    }))}
                    value={formData.id_departamento}
                    onChange={(valor) => setFormData({ ...formData, id_departamento: String(valor) })}
                    placeholder="Seleccione"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Creditos</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.creditos}
                      onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ciclo</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.ciclo}
                      onChange={(e) => setFormData({ ...formData, ciclo: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Carga y prerrequisitos</h4>
                  <p className="text-sm text-gray-500">Ajusta horas semanales y todos los cursos previos requeridos.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-1">
                  <div>
                    <label className="block text-sm font-medium mb-1">Horas teoria</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.horas_teoria}
                      onChange={(e) => setFormData({ ...formData, horas_teoria: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Horas laboratorio</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.horas_laboratorio}
                      onChange={(e) => setFormData({ ...formData, horas_laboratorio: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Horas practica</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.horas_practica}
                      onChange={(e) => setFormData({ ...formData, horas_practica: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Total de horas:</strong> {totalHorasFormulario} horas
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    La suma considera teoria, laboratorio y practica.
                  </p>
                </div>

                <div>
                  <SearchableSelect
                    etiqueta="Agregar prerrequisito"
                    opciones={opcionesPrerequisitos}
                    value=""
                    onChange={(valor) =>
                      setFormData((actual) => ({
                        ...actual,
                        prerequisito_ids: Array.from(new Set([...actual.prerequisito_ids, String(valor)]))
                      }))
                    }
                    placeholder="Selecciona un curso previo"
                  />
                  <div className="mt-2 min-h-[24px]">
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
                                setFormData((actual) => ({
                                  ...actual,
                                  prerequisito_ids: actual.prerequisito_ids.filter(
                                    (id) => id !== String(prerequisito.id_curso)
                                  )
                                }))
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
                  {formData.prerequisito_ids.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, prerequisito_ids: [] })}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Quitar todos los prerrequisitos
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <Boton
                variante="secondary"
                onClick={() => setModalAbierto(false)}
                disabled={editando}
              >
                Cancelar
              </Boton>
              <Boton
                onClick={handleGuardarCambios}
                disabled={editando}
              >
                {editando ? 'Guardando...' : 'Guardar cambios'}
              </Boton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
