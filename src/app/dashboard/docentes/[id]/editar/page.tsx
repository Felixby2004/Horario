'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';
import {
  CATEGORIAS_ORDINARIAS,
  MODALIDAD_OPTIONS,
  TIPOS_CONTRATO,
  TIPOS_EXTRAORDINARIOS,
  actualizarFormularioDocente,
  crearFormularioDocenteInicial,
  obtenerOpcionesDedicacion
} from '@/lib/docentes';
import {
  construirErroresFormularioDocenteCliente,
  resumirCambiosFormularioDocente,
  type ErroresFormularioDocenteCliente
} from '@/lib/docentesFormulario';

export default function EditarDocentePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { alertas, eliminarAlerta, exito, error, info } = useAlertasTemporales();
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [formulario, setFormulario] = useState<any>(null);
  const [formularioOriginal, setFormularioOriginal] = useState<any>(null);
  const [erroresCampo, setErroresCampo] = useState<ErroresFormularioDocenteCliente>({});
  const [facultades, setFacultades] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [docenteMeta, setDocenteMeta] = useState<any>(null);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState<Array<{ campo: string; antes: string; despues: string }>>([]);
  const [motivoEdicion, setMotivoEdicion] = useState('');

  useEffect(() => {
    cargarFacultades();
    cargarDocente();
  }, []);

  const cargarFacultades = async () => {
    try {
      const response = await fetch('/api/facultades');
      const data = await response.json();
      if (data.exito) {
        setFacultades(data.datos || []);
      }
    } catch (err) {
      console.error('Error cargando facultades:', err);
    }
  };

  const cargarDepartamentos = async (idFacultad: string) => {
    try {
      const response = await fetch(`/api/departamentos?id_facultad=${idFacultad}`);
      const data = await response.json();
      if (data.exito) {
        setDepartamentos(data.datos || []);
      }
    } catch (err) {
      console.error('Error cargando departamentos:', err);
    }
  };

  const cargarDocente = async () => {
    try {
      setCargandoDatos(true);
      const response = await fetch(`/api/docentes/${params.id}`);
      const data = await response.json();
      if (data.exito) {
        if (data.datos.fecha_ingreso) {
          data.datos.fecha_ingreso = new Date(data.datos.fecha_ingreso).toISOString().split('T')[0];
        }
        const base = crearFormularioDocenteInicial(data.datos);
        setFormulario(base);
        setFormularioOriginal(base);
        setDocenteMeta(data.datos);
        if (data.datos.id_facultad) {
          await cargarDepartamentos(String(data.datos.id_facultad));
        }
      } else {
        error('No se pudo cargar el docente', data.mensaje || 'Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error cargando docente:', err);
      error('Error al cargar docente', 'No se pudo obtener la información del docente.');
    } finally {
      setCargandoDatos(false);
    }
  };

  const validarFormulario = async () => {
    const erroresLocales = construirErroresFormularioDocenteCliente(formulario);
    let erroresServidor: Record<string, string> = {};

    try {
      const response = await fetch('/api/docentes/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          excludeId: params.id
        })
      });
      const data = await response.json();
      if (data.exito) {
        erroresServidor = data.errores || {};
      }
    } catch (err) {
      console.error('Error validando docente:', err);
    }

    const errores = {
      ...erroresLocales,
      ...erroresServidor
    };
    setErroresCampo(errores);
    return errores;
  };

  const handlePreGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioOriginal) return;

    const errores = await validarFormulario();
    if (Object.keys(errores).length > 0) {
      error('Revisa el formulario', 'Corrige los campos marcados antes de guardar.');
      return;
    }

    const cambios = resumirCambiosFormularioDocente(formularioOriginal, formulario);
    if (cambios.length === 0) {
      info('Sin cambios', 'No hay modificaciones para guardar.');
      return;
    }

    setCambiosPendientes(cambios);
    setModalConfirmacionAbierto(true);
  };

  const confirmarGuardado = async () => {
    setCargando(true);
    try {
      const response = await fetch(`/api/docentes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          motivo_edicion: motivoEdicion
        })
      });
      const data = await response.json();

      if (data.exito) {
        exito(
          'Docente actualizado',
          `Se registraron ${data.cambios?.length || cambiosPendientes.length} cambio(s) en el historial.`
        );
        setModalConfirmacionAbierto(false);
        setMotivoEdicion('');
        await cargarDocente();
      } else {
        setErroresCampo(data.errores_campo || {});
        error('No se pudo actualizar', data.mensaje || 'Revisa los datos e inténtalo nuevamente.');
      }
    } catch (err) {
      console.error('Error actualizando docente:', err);
      error('Error al actualizar', 'Ocurrió un problema inesperado al guardar los cambios.');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (campo: string, valor: any) => {
    setFormulario((previo: any) => {
      const siguiente = actualizarFormularioDocente(previo, campo as any, valor);
      if (campo === 'id_facultad') {
        siguiente.id_departamento = '';
        setDepartamentos([]);
        if (valor) {
          cargarDepartamentos(String(valor));
        }
      }
      return siguiente;
    });
    setErroresCampo((previo) => {
      const actualizado = { ...previo };
      delete actualizado[campo as keyof typeof actualizado];
      return actualizado;
    });
  };

  if (cargandoDatos || !formulario) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  const opcionesDedicacion = obtenerOpcionesDedicacion(formulario.modalidad);
  const historialEdiciones = docenteMeta?.historial_ediciones || [];
  const cursosAsignados = docenteMeta?.cursos || [];
  const gruposAsignados = docenteMeta?.grupos || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar docente</h1>
          <p className="text-gray-600 mt-1">
            Actualiza los datos del docente y revisa su trazabilidad e historial.
          </p>
        </div>
        <Boton type="button" variante="secondary" onClick={() => router.back()}>
          Volver
        </Boton>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <form onSubmit={handlePreGuardar} className="bg-white p-6 rounded-lg shadow space-y-6">
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Datos personales</h2>
              <p className="text-sm text-gray-500">
                Los nombres y apellidos se conservan en mayúsculas automáticamente.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampoTexto
                etiqueta="Código"
                value={formulario.codigo_docente}
                onChange={(e) => setFormulario({ ...formulario, codigo_docente: e.target.value })}
                disabled
              />
              <CampoTexto
                etiqueta="Nombres"
                value={formulario.nombres}
                onChange={(e) => handleChange('nombres', e.target.value)}
                error={erroresCampo.nombres}
                required
              />
              <CampoTexto
                etiqueta="Apellidos"
                value={formulario.apellidos}
                onChange={(e) => handleChange('apellidos', e.target.value)}
                error={erroresCampo.apellidos}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2">Modalidad</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formulario.modalidad}
                  onChange={(e) => handleChange('modalidad', e.target.value)}
                >
                  {MODALIDAD_OPTIONS.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
              {formulario.modalidad === 'nombrado' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formulario.categoria_ordinaria}
                    onChange={(e) => handleChange('categoria_ordinaria', e.target.value)}
                  >
                    {CATEGORIAS_ORDINARIAS.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formulario.modalidad === 'contratado' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de contrato</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formulario.tipo_contrato}
                    onChange={(e) => handleChange('tipo_contrato', e.target.value)}
                  >
                    {TIPOS_CONTRATO.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formulario.modalidad === 'extraordinario' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de extraordinario</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formulario.tipo_extraordinario}
                    onChange={(e) => handleChange('tipo_extraordinario', e.target.value)}
                  >
                    {TIPOS_EXTRAORDINARIOS.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Contacto y adscripción</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampoTexto
                etiqueta="Correo"
                type="email"
                value={formulario.correo_electronico}
                onChange={(e) => handleChange('correo_electronico', e.target.value)}
                error={erroresCampo.correo_electronico}
              />
              <CampoTexto
                etiqueta="DNI"
                value={formulario.dni_docente || ''}
                onChange={(e) => handleChange('dni_docente', e.target.value)}
                error={erroresCampo.dni_docente}
                required
              />
              <CampoTexto
                etiqueta="Teléfono"
                value={formulario.telefono || ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
              <CampoTexto
                etiqueta="Escuela profesional"
                value={formulario.escuela_profesional || ''}
                onChange={(e) => handleChange('escuela_profesional', e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Facultad <span className="text-red-500 ml-1">*</span>
                </label>
                <SearchableSelect
                  opciones={facultades.map((item) => ({
                    valor: String(item.id_facultad),
                    etiqueta: item.nombre
                  }))}
                  value={formulario.id_facultad}
                  onChange={(valor) => handleChange('id_facultad', valor)}
                  placeholder="Selecciona una facultad"
                  required
                />
                {erroresCampo.id_facultad && (
                  <p className="text-sm text-red-600">{erroresCampo.id_facultad}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Departamento académico <span className="text-red-500 ml-1">*</span>
                </label>
                <SearchableSelect
                  opciones={departamentos.map((item) => ({
                    valor: String(item.id_departamento),
                    etiqueta: item.nombre
                  }))}
                  value={formulario.id_departamento}
                  onChange={(valor) => handleChange('id_departamento', valor)}
                  placeholder="Selecciona un departamento"
                  disabled={!formulario.id_facultad}
                  required
                />
                {erroresCampo.id_departamento && (
                  <p className="text-sm text-red-600">{erroresCampo.id_departamento}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Información laboral y académica</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CampoTexto
                etiqueta="Fecha de ingreso"
                type="date"
                value={formulario.fecha_ingreso || ''}
                onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
                error={erroresCampo.fecha_ingreso}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2">Régimen y dedicación</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formulario.dedicacion}
                  onChange={(e) => handleChange('dedicacion', e.target.value)}
                  disabled={formulario.modalidad === 'contratado'}
                >
                  {opcionesDedicacion.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.etiqueta}
                    </option>
                  ))}
                </select>
                {erroresCampo.dedicacion && (
                  <p className="text-sm text-red-600 mt-1">{erroresCampo.dedicacion}</p>
                )}
              </div>
              <CampoTexto
                etiqueta="Grado académico"
                value={formulario.grado_academico || ''}
                onChange={(e) => handleChange('grado_academico', e.target.value)}
              />
              <CampoTexto
                etiqueta="Especialidad"
                value={formulario.especialidad || ''}
                onChange={(e) => handleChange('especialidad', e.target.value)}
              />
              <CampoTexto
                etiqueta="Horas máximas semanales"
                value={String(formulario.horas_maximas_semanales || '')}
                onChange={() => undefined}
                disabled
              />
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Boton type="submit" disabled={cargando}>
              Revisar cambios
            </Boton>
            <Boton type="button" variante="secondary" onClick={() => router.back()}>
              Cancelar
            </Boton>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Asignaciones académicas</h2>
              <p className="text-sm text-gray-500">
                Resumen de cursos y grupos activos del docente.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Cursos asignados</h3>
              {cursosAsignados.length === 0 ? (
                <p className="text-sm text-gray-500">No tiene cursos asignados.</p>
              ) : (
                <div className="space-y-2">
                  {cursosAsignados.slice(0, 5).map((item: any) => (
                    <div key={item.id_docente_curso} className="border rounded p-2 text-sm">
                      <div className="font-medium">{item.curso?.nombre}</div>
                      <div className="text-gray-500">
                        {item.curso?.codigo} • {item.tipo_clase}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Grupos asignados</h3>
              {gruposAsignados.length === 0 ? (
                <p className="text-sm text-gray-500">No tiene grupos asignados.</p>
              ) : (
                <div className="space-y-2">
                  {gruposAsignados.slice(0, 5).map((item: any) => (
                    <div key={item.id_docente_grupo} className="border rounded p-2 text-sm">
                      <div className="font-medium">
                        {item.grupo?.curso?.nombre} - Grupo {item.grupo?.codigo_grupo}
                      </div>
                      <div className="text-gray-500">
                        {item.grupo?.periodo?.nombre || 'Sin periodo'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Historial de modificaciones</h2>
              <p className="text-sm text-gray-500">
                Últimas actualizaciones registradas del docente.
              </p>
            </div>
            {historialEdiciones.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay modificaciones registradas.</p>
            ) : (
              <div className="space-y-3">
                {historialEdiciones.map((item: any) => (
                  <div key={item.id_historial_edicion} className="border rounded p-3 text-sm space-y-2">
                    <div className="font-medium">
                      {new Date(item.fecha_edicion).toLocaleString()}
                    </div>
                    <div className="text-gray-500">
                      {item.usuario_editor
                        ? `${item.usuario_editor.nombres} ${item.usuario_editor.apellidos}`
                        : 'Usuario no identificado'}
                    </div>
                    {Array.isArray(item.resumen_cambios) && item.resumen_cambios.length > 0 && (
                      <div className="space-y-1">
                        {item.resumen_cambios.slice(0, 3).map((cambio: any, index: number) => (
                          <div key={`${item.id_historial_edicion}-${index}`} className="text-xs text-gray-600">
                            {cambio.campo}: {cambio.antes} {'->'} {cambio.despues}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <Modal
        abierto={modalConfirmacionAbierto}
        alCerrar={() => !cargando && setModalConfirmacionAbierto(false)}
        titulo="Confirmar cambios"
        tamaño="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Revisa el resumen antes de guardar. El sistema almacenará la trazabilidad de esta edición.
          </p>
          <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
            {cambiosPendientes.map((cambio, index) => (
              <div key={`${cambio.campo}-${index}`} className="p-3 text-sm">
                <div className="font-medium">{cambio.campo}</div>
                <div className="text-gray-500">Antes: {cambio.antes}</div>
                <div className="text-gray-700">Después: {cambio.despues}</div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Motivo de edición</label>
            <textarea
              className="w-full border rounded-lg px-4 py-3 min-h-[100px]"
              value={motivoEdicion}
              onChange={(e) => setMotivoEdicion(e.target.value)}
              placeholder="Describe brevemente el motivo de la actualización"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Boton onClick={confirmarGuardado} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Confirmar y guardar'}
            </Boton>
            <Boton
              type="button"
              variante="secondary"
              onClick={() => setModalConfirmacionAbierto(false)}
              disabled={cargando}
            >
              Cancelar
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
