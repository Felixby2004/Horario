'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function NuevoAmbientePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    tipo: 'aula',
    capacidad: 0,
    piso: '1',
    pabellon: 'A',
    equipamiento: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('/api/ambientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();
      if (data.exito) {
        alert('Ambiente creado exitosamente');
        router.push('/dashboard/ambientes');
      }
    } catch (error) {
      alert('Error al crear ambiente');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Nuevo Ambiente</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoTexto
            etiqueta="Código"
            value={formulario.codigo}
            onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
            required
            ayuda="Ej: A-101, LAB-201"
          />

          <CampoTexto
            etiqueta="Nombre"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Tipo *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.tipo}
              onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
              required
            >
              <option value="aula">🏫 Aula</option>
              <option value="laboratorio">💻 Laboratorio</option>
            </select>
          </div>

          <CampoTexto
            etiqueta="Capacidad"
            type="number"
            value={formulario.capacidad}
            onChange={(e) => setFormulario({ ...formulario, capacidad: parseInt(e.target.value) })}
            required
            ayuda="Número de estudiantes"
          />

          <CampoTexto
            etiqueta="Piso"
            value={formulario.piso}
            onChange={(e) => setFormulario({ ...formulario, piso: e.target.value })}
            required
            ayuda="Ej: 1, 2, 3, etc."
          />

          <CampoTexto
            etiqueta="Pabellón"
            value={formulario.pabellon}
            onChange={(e) => setFormulario({ ...formulario, pabellon: e.target.value })}
            required
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Equipamiento</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={formulario.equipamiento}
              onChange={(e) => setFormulario({ ...formulario, equipamiento: e.target.value })}
              placeholder="Proyector, pizarra digital, 30 PCs..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Ambiente'}
          </Boton>
          <Boton type="button" variante="secondary" onClick={() => router.back()}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}
