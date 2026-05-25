'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';

interface Grupo {
  id_grupo: number;
  codigo_grupo: string;
  capacidad_maxima: number;
  cantidad_matriculados: number;
  observaciones?: string;
  activo: boolean;
  curso: {
    id_curso: number;
    codigo: string;
    nombre: string;
    ciclo: number;
  };
  periodo: {
    id_periodo: number;
    nombre: string;
    codigo: string;
  };
}

export default function EditarGrupoPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState<Partial<Grupo>>({});

  useEffect(() => {
    cargarGrupo();
  }, [id]);

  const cargarGrupo = async () => {
    try {
      const response = await fetch(`/api/grupos/${id}`);
      const data = await response.json();
      if (data.exito) {
        setGrupo(data.datos);
        setFormulario(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar el grupo');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const response = await fetch(`/api/grupos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Grupo actualizado exitosamente');
        router.push('/dashboard/grupos');
      } else {
        alert('❌ Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async () => {
    if (!confirm('¿Estás seguro de que deseas desactivar este grupo?')) return;

    try {
      const response = await fetch(`/api/grupos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false })
      });

      const data = await response.json();
      if (data.exito) {
        alert('✅ Grupo desactivado exitosamente');
        router.push('/dashboard/grupos');
      } else {
        alert('❌ Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al desactivar grupo');
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  if (!grupo) {
    return <div className="text-center py-12">Grupo no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Grupo</h1>
        <p className="text-gray-600 mt-1">
          {grupo.curso.codigo} - {grupo.curso.nombre} | Grupo {grupo.codigo_grupo}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información de solo lectura */}
          <div>
            <label className="block text-sm font-medium mb-2">Curso</label>
            <div className="bg-gray-50 border rounded px-3 py-2 text-gray-700">
              {grupo.curso.codigo} - {grupo.curso.nombre}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <div className="bg-gray-50 border rounded px-3 py-2 text-gray-700">
              {grupo.periodo.nombre}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ciclo</label>
            <div className="bg-gray-50 border rounded px-3 py-2 text-gray-700">
              {grupo.curso.ciclo}
            </div>
          </div>

          {/* Campos editables */}
          <CampoTexto
            etiqueta="Código de Grupo"
            value={formulario.codigo_grupo || ''}
            onChange={(e) => setFormulario({ ...formulario, codigo_grupo: e.target.value })}
            required
            disabled={guardando}
            ayuda="Ej: A, B, C, 01, 02"
          />

          <CampoTexto
            etiqueta="Capacidad Máxima"
            type="number"
            value={formulario.capacidad_maxima || 0}
            onChange={(e) => setFormulario({ ...formulario, capacidad_maxima: parseInt(e.target.value) })}
            required
            disabled={guardando}
            ayuda="Número máximo de estudiantes"
          />

          <CampoTexto
            etiqueta="Cantidad Matriculados"
            type="number"
            value={formulario.cantidad_matriculados || 0}
            onChange={(e) => setFormulario({ ...formulario, cantidad_matriculados: parseInt(e.target.value) })}
            disabled={guardando}
            ayuda="Número actual de estudiantes inscritos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Observaciones</label>
          <textarea
            value={formulario.observaciones || ''}
            onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Notas adicionales sobre el grupo..."
            disabled={guardando}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formulario.activo ?? true}
              onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
              disabled={guardando}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Grupo activo</span>
          </label>
          <p className="text-xs text-gray-600 mt-2">Si desactivas este grupo, no aparecerá disponible para asignación de horarios.</p>
        </div>

        <div className="flex gap-4 pt-6">
          <Boton type="submit" disabled={guardando} className="flex-1">
            {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
          </Boton>
          <Boton
            type="button"
            onClick={() => router.push('/dashboard/grupos')}
            disabled={guardando}
            className="flex-1 bg-gray-500 hover:bg-gray-600"
          >
            ❌ Cancelar
          </Boton>
          <Boton
            type="button"
            onClick={handleDesactivar}
            disabled={guardando || !formulario.activo}
            className="bg-red-500 hover:bg-red-600"
          >
            🔴 Desactivar
          </Boton>
        </div>
      </form>
    </div>
  );
}
