'use client';

import { useState, useEffect } from 'react';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';
import { ContenedorAlertas } from '@/components/ui/ContenedorAlertas';
import { useAlertasTemporales } from '@/hooks/useAlertasTemporales';
import Link from 'next/link';

interface Curso {
  id_curso: number;
  codigo: string;
  nombre: string;
  creditos: number;
  ciclo: number;
  horas_teoria: number;
  horas_laboratorio: number;
  horas_practica: number;
  activo: boolean;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    horas_teoria: 0,
    horas_laboratorio: 0,
    horas_practica: 0,
    creditos: 0,
    ciclo: 0
  });

  const { alertas, eliminarAlerta, exito, error } = useAlertasTemporales();

  useEffect(() => {
    cargarCursos();
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

  const handleAbrirModalEditar = (curso: Curso) => {
    setCursoSeleccionado(curso);
    setFormData({
      nombre: curso.nombre,
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
        body: JSON.stringify(formData)
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
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => handleEliminarCurso(fila)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            🗑️ Eliminar
          </button>
        </div>
      )
    }
  ];

  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  const textoBusqueda = busqueda.trim().toLowerCase();
  const cursosFiltrados = cursos.filter((c: any) => {
    if (!textoBusqueda) return true;
    const codigo = String(c.codigo || '').toLowerCase();
    const nombre = String(c.nombre || '').toLowerCase();
    const ciclo = String(c.ciclo ?? '').toLowerCase();
    return codigo.includes(textoBusqueda) || nombre.includes(textoBusqueda) || ciclo.includes(textoBusqueda);
  });

  return (
    <div>
      <ContenedorAlertas alertas={alertas} onEliminar={eliminarAlerta} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de cursos</h1>
          <p className="text-gray-600 mt-1">Catálogo de cursos académicos</p>
        </div>
        <Link href="/dashboard/cursos/nuevo">
          <Boton>➕ Nuevo curso</Boton>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block text-sm font-medium mb-2">Buscar curso</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Busca por código, nombre o ciclo..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Puedes editar las horas o eliminar cursos desde la tabla de abajo.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow">
        <TablaDatos datos={cursosFiltrados} columnas={columnas} keyField="id_curso" />
      </div>

      {/* Modal de Edición */}
      {modalAbierto && cursoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar curso</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  type="text"
                  value={cursoSeleccionado.codigo}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre del curso *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Ingeniería de Software I"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Horas teoría</label>
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
                  <label className="block text-sm font-medium mb-1">Horas lab</label>
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
                  <label className="block text-sm font-medium mb-1">Horas práctica</label>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Créditos</label>
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

              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Total de horas:</strong> {formData.horas_teoria + formData.horas_laboratorio + formData.horas_practica} horas
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                disabled={editando}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCambios}
                disabled={editando}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {editando ? '⏳ Guardando...' : '✅ Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
