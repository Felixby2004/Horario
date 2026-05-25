'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      const response = await fetch('/api/grupos');
      const data = await response.json();
      if (data.exito) {
        setGrupos(data.datos || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const desactivar = async (id: number, nombre: string) => {
    if (!confirm(`¿Desactiva el grupo "${nombre}"?`)) return;

    try {
      const response = await fetch(`/api/grupos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false })
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Grupo desactivado exitosamente');
        cargarGrupos();
      } else {
        alert('❌ Error: ' + data.mensaje);
      }
    } catch (error) {
      alert('❌ Error al desactivar grupo');
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  const textoBusqueda = busqueda.trim().toLowerCase();
  const gruposFiltrados = grupos.filter((g: any) => {
    if (!textoBusqueda) return true;
    const codigoGrupo = String(g.codigo_grupo || '').toLowerCase();
    const curso = `${g.curso?.codigo || ''} ${g.curso?.nombre || ''}`.toLowerCase();
    const periodo = String(g.periodo?.nombre || '').toLowerCase();
    return (
      codigoGrupo.includes(textoBusqueda) ||
      curso.includes(textoBusqueda) ||
      periodo.includes(textoBusqueda)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de grupos</h1>
        <Boton onClick={() => router.push('/dashboard/grupos/nuevo')}>
          + Nuevo Grupo
        </Boton>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Buscar grupo</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Busca por grupo, curso o período..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Un grupo representa una sección del curso en un período. Se usa para asignar horarios y controlar matrícula.
          </p>
        </div>

        {grupos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay grupos registrados. Cree uno nuevo para comenzar.
          </div>
        ) : (
          <TablaDatos
            columnas={[
              { clave: 'curso', etiqueta: 'Curso' },
              { clave: 'codigo', etiqueta: 'Grupo' },
              { clave: 'periodo', etiqueta: 'Período' },
              { clave: 'capacidad', etiqueta: 'Capacidad' },
              { clave: 'matriculados', etiqueta: 'Matriculados' },
              { clave: 'estado', etiqueta: 'Estado' },
              { clave: 'acciones', etiqueta: 'Acciones' }
            ]}
            datos={gruposFiltrados.map((g: any) => ({
              curso: `${g.curso?.codigo} - ${g.curso?.nombre}`,
              codigo: g.codigo_grupo,
              periodo: g.periodo?.nombre,
              capacidad: g.capacidad_maxima,
              matriculados: g.cantidad_matriculados || 0,
              estado: g.activo ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  ✅ Activo
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                  ⛔ Inactivo
                </span>
              ),
              acciones: (
                <div className="flex gap-2">
                  <Boton
                    onClick={() => router.push(`/dashboard/grupos/${g.id_grupo}`)}
                    tamaño="sm"
                  >
                    ✏️ Editar
                  </Boton>
                  {g.activo && (
                    <Boton
                      onClick={() => desactivar(g.id_grupo, g.codigo_grupo)}
                      variante="error"
                      tamaño="sm"
                    >
                      🔴 Desactivar
                    </Boton>
                  )}
                </div>
              )
            }))}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{grupos.length}</div>
          <div className="text-sm text-gray-600">Total Grupos</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {grupos.reduce((sum: number, g: any) => sum + (g.cantidad_matriculados || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Estudiantes</div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {grupos.filter((g: any) => g.activo).length}
          </div>
          <div className="text-sm text-gray-600">Grupos Activos</div>
        </div>
      </div>
    </div>
  );
}
