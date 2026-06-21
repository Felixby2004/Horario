'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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
import { construirErroresFormularioDocenteCliente } from '@/lib/docentesFormulario';

export default function ImportarDocentesPage() {
  const router = useRouter();
  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  const [usuariosPendientes, setUsuariosPendientes] = useState<any[]>([]);
  const [historialImportaciones, setHistorialImportaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [importandoUsuario, setImportandoUsuario] = useState(false);
  const [facultades, setFacultades] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [formulario, setFormulario] = useState(
    crearFormularioDocenteInicial({
      modalidad: 'contratado',
      categoria: 'auxiliar'
    })
  );
  const [erroresUsuario, setErroresUsuario] = useState<Record<string, string>>({});
  useEffect(() => {
    Promise.all([cargarUsuariosPendientes(), cargarFacultades(), cargarHistorialImportaciones()]).finally(() =>
      setCargando(false)
    );
  }, []);

  const cargarUsuariosPendientes = async () => {
    try {
      const response = await fetch('/api/docentes/pendientes');
      const data = await response.json();
      if (data.exito) {
        setUsuariosPendientes(data.datos || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cargarHistorialImportaciones = async () => {
    try {
      const response = await fetch('/api/docentes/importaciones');
      const data = await response.json();
      if (data.exito) {
        setHistorialImportaciones(data.datos || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cargarFacultades = async () => {
    try {
      const response = await fetch('/api/facultades');
      const data = await response.json();
      if (data.exito) {
        setFacultades(data.datos || []);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
    }
  };

  const seleccionarUsuario = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setFormulario((previo) => ({
      ...previo,
      codigo_docente: usuario.codigo,
      correo_electronico: usuario.correo_electronico || ''
    }));
  };

  const handleChange = (campo: string, valor: any) => {
    setFormulario((previo) => {
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
    setErroresUsuario((previo) => {
      const actualizado = { ...previo };
      delete actualizado[campo];
      return actualizado;
    });
  };

  const validarFormularioUsuario = async () => {
    const erroresLocales = construirErroresFormularioDocenteCliente(formulario);
    let erroresServidor: Record<string, string> = {};

    try {
      const response = await fetch('/api/docentes/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });
      const data = await response.json();
      if (data.exito) {
        erroresServidor = data.errores || {};
      }
    } catch (err) {
      console.error(err);
    }

    const errores = { ...erroresLocales, ...erroresServidor };
    setErroresUsuario(errores);
    return errores;
  };

  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioSeleccionado) {
      error('Selección requerida', 'Debes seleccionar un usuario antes de continuar.');
      return;
    }

    const errores = await validarFormularioUsuario();
    if (Object.keys(errores).length > 0) {
      error('Revisa el formulario', 'Corrige los campos marcados antes de importar.');
      return;
    }

    setImportandoUsuario(true);
    try {
      const response = await fetch('/api/docentes/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuarioSeleccionado.id_usuario,
          ...formulario
        })
      });

      const data = await response.json();
      if (data.exito) {
        exito(
          'Docente importado',
          `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos} fue registrado exitosamente.`
        );
        setUsuarioSeleccionado(null);
        setFormulario(crearFormularioDocenteInicial({ modalidad: 'contratado', categoria: 'auxiliar' }));
        setErroresUsuario({});
        setDepartamentos([]);
        await Promise.all([cargarUsuariosPendientes(), cargarHistorialImportaciones()]);
      } else {
        setErroresUsuario(data.errores_campo || {});
        error('No se pudo importar', data.mensaje || 'Ocurrió un error al registrar el docente.');
      }
    } catch (err) {
      console.error(err);
      error('Error inesperado', 'Ocurrió un problema al importar el docente.');
    } finally {
      setImportandoUsuario(false);
    }
  };

  const textoBusqueda = busquedaUsuario.trim().toLowerCase();
  const opcionesDedicacion = obtenerOpcionesDedicacion(formulario.modalidad);
  const usuariosPendientesFiltrados = usuariosPendientes.filter((u: any) => {
    if (!textoBusqueda) return true;
    const nombre = `${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase();
    const codigo = String(u.codigo || '').toLowerCase();
    const correo = String(u.correo_electronico || '').toLowerCase();
    return nombre.includes(textoBusqueda) || codigo.includes(textoBusqueda) || correo.includes(textoBusqueda);
  });

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="space-y-6">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Importar docentes</h1>
          <p className="text-gray-600 mt-1">
            Registra docentes únicamente desde usuarios pendientes.
          </p>
        </div>
        <Boton variante="secondary" onClick={() => router.push('/dashboard/docentes')}>
          Volver
        </Boton>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.4fr] gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              Usuarios pendientes ({usuariosPendientesFiltrados.length})
            </h2>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-2">Buscar usuario</label>
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Busca por código, nombre o correo..."
              />
            </div>
          </div>
          <div className="divide-y max-h-[700px] overflow-y-auto">
            {usuariosPendientesFiltrados.map((usuario: any) => (
              <div
                key={usuario.id_usuario}
                className={`p-4 cursor-pointer transition-colors ${
                  usuarioSeleccionado?.id_usuario === usuario.id_usuario
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => seleccionarUsuario(usuario)}
              >
                <div className="font-medium">
                  {usuario.nombres} {usuario.apellidos}
                </div>
                <div className="text-sm text-gray-500">Código: {usuario.codigo}</div>
                <div className="text-xs text-gray-400">{usuario.correo_electronico}</div>
              </div>
            ))}
            {usuariosPendientesFiltrados.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No hay usuarios pendientes que coincidan con la búsqueda.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Completar datos del docente</h2>
          </div>
          {!usuarioSeleccionado ? (
            <div className="p-8 text-center text-gray-500">
              Selecciona un usuario de la lista para completar su registro docente.
            </div>
          ) : (
            <form onSubmit={handleSubmitUsuario} className="p-4 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-900">
                  {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}
                </div>
                <div className="text-xs text-blue-700">
                  {usuarioSeleccionado.codigo} • {usuarioSeleccionado.correo_electronico}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código docente *</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.codigo_docente}
                    onChange={(e) => handleChange('codigo_docente', e.target.value)}
                  />
                  {erroresUsuario.codigo_docente && (
                    <p className="text-sm text-red-600 mt-1">{erroresUsuario.codigo_docente}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">DNI *</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.dni_docente}
                    onChange={(e) => handleChange('dni_docente', e.target.value)}
                  />
                  {erroresUsuario.dni_docente && (
                    <p className="text-sm text-red-600 mt-1">{erroresUsuario.dni_docente}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Modalidad *</label>
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
                    <label className="block text-sm font-medium mb-2">Categoría *</label>
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
                    <label className="block text-sm font-medium mb-2">Tipo de Contrato *</label>
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
                    <label className="block text-sm font-medium mb-2">Tipo de Extraordinario *</label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Régimen y Dedicación *</label>
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
                  {erroresUsuario.dedicacion && (
                    <p className="text-sm text-red-600 mt-1">{erroresUsuario.dedicacion}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Correo</label>
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.correo_electronico}
                    onChange={(e) => handleChange('correo_electronico', e.target.value)}
                  />
                  {erroresUsuario.correo_electronico && (
                    <p className="text-sm text-red-600 mt-1">{erroresUsuario.correo_electronico}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de ingreso *</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.fecha_ingreso}
                    onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
                  />
                  {erroresUsuario.fecha_ingreso && (
                    <p className="text-sm text-red-600 mt-1">{erroresUsuario.fecha_ingreso}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium">Facultad *</label>
                  <SearchableSelect
                    opciones={facultades.map((item) => ({
                      valor: String(item.id_facultad),
                      etiqueta: item.nombre
                    }))}
                    value={formulario.id_facultad}
                    onChange={(valor) => handleChange('id_facultad', valor)}
                    placeholder="Selecciona una facultad"
                  />
                  {erroresUsuario.id_facultad && (
                    <p className="text-sm text-red-600">{erroresUsuario.id_facultad}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium">Departamento Académico *</label>
                  <SearchableSelect
                    opciones={departamentos.map((item) => ({
                      valor: String(item.id_departamento),
                      etiqueta: item.nombre
                    }))}
                    value={formulario.id_departamento}
                    onChange={(valor) => handleChange('id_departamento', valor)}
                    placeholder="Selecciona un departamento"
                    disabled={!formulario.id_facultad}
                  />
                  {erroresUsuario.id_departamento && (
                    <p className="text-sm text-red-600">{erroresUsuario.id_departamento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Grado académico</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.grado_academico}
                    onChange={(e) => handleChange('grado_academico', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Especialidad</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.especialidad}
                    onChange={(e) => handleChange('especialidad', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Horas máximas semanales</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.horas_maximas_semanales}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Boton type="submit" className="sm:flex-1" disabled={importandoUsuario}>
                  {importandoUsuario ? 'Importando...' : 'Importar docente'}
                </Boton>
                <Boton
                  type="button"
                  variante="secondary"
                  onClick={() => {
                    setUsuarioSeleccionado(null);
                    setFormulario(crearFormularioDocenteInicial({ modalidad: 'contratado', categoria: 'auxiliar' }));
                    setErroresUsuario({});
                  }}
                  disabled={importandoUsuario}
                >
                  Limpiar
                </Boton>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Historial de importaciones</h2>
          <p className="text-sm text-gray-500 mt-1">
            Últimas importaciones registradas desde usuarios pendientes.
          </p>
        </div>
        {historialImportaciones.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay importaciones registradas.</p>
        ) : (
          <div className="space-y-3">
            {historialImportaciones.map((item) => (
              <div key={item.id_importacion} className="border rounded-lg p-3 text-sm space-y-1">
                <div className="font-medium">{item.nombre_archivo}</div>
                <div className="text-gray-500">
                  {item.formato_archivo.toUpperCase()} • {item.estado}
                </div>
                <div className="text-gray-600">
                  Total: {item.total_registros} • Importados: {item.registros_importados} • Error: {item.registros_error}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(item.fecha_creacion).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
