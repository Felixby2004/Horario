'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';

type TipoAmbiente = 'aula' | 'laboratorio';

interface Ambiente {
  id_ambiente: number;
  codigo: string;
  nombre: string;
  tipo: TipoAmbiente;
  capacidad: number;
  piso?: string;
  pabellon?: string;
  equipamiento?: string;
  observaciones?: string;
  activo: boolean;
}

export default function EditarAmbientePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formulario, setFormulario] = useState<Partial<Ambiente>>({});

  useEffect(() => {
    cargarAmbiente();
  }, [id]);

  const cargarAmbiente = async () => {
    try {
      const response = await fetch(`/api/ambientes/${id}`);
      const data = await response.json();
      if (data.exito) {
        setAmbiente(data.datos);
        setFormulario(data.datos);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar el ambiente');
    } finally {
      setCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const response = await fetch(`/api/ambientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();
      if (data.exito) {
        alert('Ambiente actualizado exitosamente');
        router.push('/dashboard/ambientes');
      } else {
        alert('Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleInhabilitar = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ambiente?')) return;

    try {
      const response = await fetch(`/api/ambientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false })
      });

      const data = await response.json();
      if (data.exito) {
        alert('Ambiente desactivado exitosamente');
        router.push('/dashboard/ambientes');
      } else {
        alert('Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desactivar ambiente');
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  if (!ambiente) {
    return <div className="text-center py-12">Ambiente no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Ambiente</h1>
        <p className="text-gray-600 mt-1">{ambiente.nombre}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoTexto
            etiqueta="Código"
            value={formulario.codigo || ''}
            onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
            required
            disabled={guardando}
          />

          <CampoTexto
            etiqueta="Nombre"
            value={formulario.nombre || ''}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            required
            disabled={guardando}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={formulario.tipo || ''}
              onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as TipoAmbiente })}
              className="w-full border rounded px-3 py-2"
              required
              disabled={guardando}
            >
              <option value="">Selecciona tipo...</option>
              <option value="aula">Aula</option>
              <option value="laboratorio">Laboratorio</option>
            </select>
          </div>

          <CampoTexto
            etiqueta="Capacidad"
            type="number"
            value={formulario.capacidad || 0}
            onChange={(e) => setFormulario({ ...formulario, capacidad: parseInt(e.target.value) })}
            required
            disabled={guardando}
          />

          <CampoTexto
            etiqueta="Piso"
            value={formulario.piso || ''}
            onChange={(e) => setFormulario({ ...formulario, piso: e.target.value })}
            disabled={guardando}
          />

          <CampoTexto
            etiqueta="Pabellón"
            value={formulario.pabellon || ''}
            onChange={(e) => setFormulario({ ...formulario, pabellon: e.target.value })}
            disabled={guardando}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Equipamiento</label>
          <textarea
            value={formulario.equipamiento || ''}
            onChange={(e) => setFormulario({ ...formulario, equipamiento: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Ej: Proyector, Pizarra interactiva, Computadoras..."
            disabled={guardando}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Observaciones</label>
          <textarea
            value={formulario.observaciones || ''}
            onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Notas adicionales sobre el ambiente..."
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
            <span className="text-sm font-medium">Ambiente activo</span>
          </label>
          <p className="text-xs text-gray-600 mt-2">Si desactivas este ambiente, no aparecerá disponible para nuevas asignaciones.</p>
        </div>

        <div className="flex gap-4 pt-6">
          <Boton type="submit" disabled={guardando} className="flex-1">
            {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
          </Boton>
          <Boton
            type="button"
            onClick={() => router.push('/dashboard/ambientes')}
            disabled={guardando}
            className="flex-1 bg-gray-500 hover:bg-gray-600"
          >
            Cancelar
          </Boton>
          <Boton
            type="button"
            onClick={handleInhabilitar}
            disabled={guardando || !formulario.activo}
            className="bg-red-500 hover:bg-red-600"
          >
            Eliminar
          </Boton>
        </div>
      </form>
    </div>
  );
}
