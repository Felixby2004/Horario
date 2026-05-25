'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';

export default function ImportarDocentesPage() {
  const router = useRouter();
  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  const [usuariosPendientes, setUsuariosPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [importando, setImportando] = useState(false);
  const [formulario, setFormulario] = useState({
    codigo_docente: '',
    modalidad: 'contratado',
    categoria: 'auxiliar',
    dedicacion: 'tiempo_completo',
    fecha_ingreso: '',
    telefono: '',
    grado_academico: '',
    especialidad: '',
    horas_maximas_semanales: 40
  });

  useEffect(() => {
    cargarUsuariosPendientes();
  }, []);

  const cargarUsuariosPendientes = async () => {
    try {
      const response = await fetch('/api/docentes/pendientes');
      const data = await response.json();
      
      if (data.exito) {
        setUsuariosPendientes(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios pendientes:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarUsuario = (usuario: any) => {
    setUsuarioSeleccionado(usuario);
    setFormulario({
      ...formulario,
      codigo_docente: usuario.codigo // Pre-llenar con código de usuario
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioSeleccionado) {
      error('Selección requerida', 'Debes seleccionar un usuario primero');
      return;
    }

    setImportando(true);
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
          '✅ Docente importado',
          `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos} fue importado exitosamente`
        );
        setUsuarioSeleccionado(null);
        setFormulario({
          codigo_docente: '',
          modalidad: 'contratado',
          categoria: 'auxiliar',
          dedicacion: 'tiempo_completo',
          fecha_ingreso: '',
          telefono: '',
          grado_academico: '',
          especialidad: '',
          horas_maximas_semanales: 40
        });
        cargarUsuariosPendientes();
        setTimeout(() => router.push('/dashboard/docentes'), 1500);
      } else {
        error('❌ Error', data.mensaje || 'No pudimos importar el docente');
      }
    } catch (err) {
      console.error('Error:', err);
      error(
        '❌ Error inesperado',
        'Ocurrió un error al importar el docente'
      );
    } finally {
      setImportando(false);
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  const textoBusqueda = busquedaUsuario.trim().toLowerCase();
  const usuariosPendientesFiltrados = usuariosPendientes.filter((u: any) => {
    if (!textoBusqueda) return true;
    const nombre = `${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase();
    const codigo = String(u.codigo || '').toLowerCase();
    const correo = String(u.correo_electronico || '').toLowerCase();
    return (
      nombre.includes(textoBusqueda) ||
      codigo.includes(textoBusqueda) ||
      correo.includes(textoBusqueda)
    );
  });

  return (
    <div className="space-y-6">
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Importar docentes</h1>
          <p className="text-gray-600 mt-1">
            Usuarios registrados como docentes pendientes de completar datos
          </p>
        </div>
        <Boton
          variante="secondary"
          onClick={() => router.push('/dashboard/docentes')}
        >
          Volver
        </Boton>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="font-medium text-blue-900">
          ¿Qué hace “Importar docentes”?
        </div>
        <div className="text-sm text-blue-800 mt-1">
          Selecciona un usuario con rol docente y completa su información. Al guardar, el sistema crea oficialmente el registro del docente y lo deja listo para asignar grupos y solicitar horarios.
        </div>
      </div>

      {usuariosPendientes.length === 0 ? (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            No hay usuarios pendientes
          </h3>
          <p className="text-blue-700">
            Todos los usuarios con rol docente ya fueron importados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Usuarios Pendientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                Usuarios pendientes ({usuariosPendientesFiltrados.length})
              </h3>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">
                  Buscar usuario
                </label>
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Busca por código, nombre o correo..."
                />
              </div>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {usuario.nombres.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {usuario.nombres} {usuario.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {usuario.codigo}
                      </div>
                      <div className="text-xs text-gray-400">
                        {usuario.correo_electronico}
                      </div>
                    </div>
                    {usuarioSeleccionado?.id_usuario === usuario.id_usuario && (
                      <div className="text-blue-600">→</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario de Datos del Docente */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Completar datos del docente</h3>
            </div>
            
            {!usuarioSeleccionado ? (
              <div className="p-8 text-center text-gray-500">
                Selecciona un usuario de la lista
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="text-sm font-medium text-blue-900">
                    {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellidos}
                  </div>
                  <div className="text-xs text-blue-600">
                    {usuarioSeleccionado.codigo} • {usuarioSeleccionado.correo_electronico}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código docente *
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.codigo_docente}
                    onChange={(e) => setFormulario({ ...formulario, codigo_docente: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Por defecto usa el código de usuario
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Modalidad *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formulario.modalidad}
                    onChange={(e) => setFormulario({ ...formulario, modalidad: e.target.value })}
                    required
                  >
                    <option value="nombrado">Nombrado</option>
                    <option value="contratado">Contratado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoría *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formulario.categoria}
                    onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                    required
                  >
                    <option value="principal">Principal</option>
                    <option value="asociado">Asociado</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="jefe_practica">Jefe de práctica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dedicación *
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formulario.dedicacion}
                    onChange={(e) => setFormulario({ ...formulario, dedicacion: e.target.value })}
                  >
                    <option value="tiempo_completo">Tiempo completo</option>
                    <option value="tiempo_parcial">Tiempo parcial</option>
                    <option value="por_horas">Por horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de ingreso *
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.fecha_ingreso}
                    onChange={(e) => setFormulario({ ...formulario, fecha_ingreso: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se usará para calcular automáticamente la antigüedad
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                    placeholder="Ej: 987654321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Grado académico
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.grado_academico}
                    onChange={(e) => setFormulario({ ...formulario, grado_academico: e.target.value })}
                    placeholder="Ej: Doctor, Magíster, Licenciado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.especialidad}
                    onChange={(e) => setFormulario({ ...formulario, especialidad: e.target.value })}
                    placeholder="Ej: Ingeniería de Software"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Horas máximas semanales
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={formulario.horas_maximas_semanales}
                    onChange={(e) => setFormulario({ ...formulario, horas_maximas_semanales: parseInt(e.target.value) || 40 })}
                    min="1"
                    max="60"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Boton type="submit" className="flex-1" disabled={importando}>
                    {importando ? 'Importando...' : 'Importar docente'}
                  </Boton>
                  <Boton
                    type="button"
                    variante="secondary"
                    onClick={() => setUsuarioSeleccionado(null)}
                    disabled={importando}
                  >
                    Cancelar
                  </Boton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
