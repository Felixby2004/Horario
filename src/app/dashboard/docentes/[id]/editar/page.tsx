'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function EditarDocentePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [formulario, setFormulario] = useState<any>(null);

  useEffect(() => {
    cargarDocente();
  }, []);

  const cargarDocente = async () => {
    try {
      const response = await fetch(`/api/docentes/${params.id}`);
      const data = await response.json();
      if (data.exito) {
        // Formatear fecha para el input date (YYYY-MM-DD)
        if (data.datos.fecha_ingreso) {
          data.datos.fecha_ingreso = new Date(data.datos.fecha_ingreso).toISOString().split('T')[0];
        }
        setFormulario(data.datos);
      }
    } catch (error) {
      alert('Error al cargar docente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch(`/api/docentes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();
      if (data.exito) {
        alert('Docente actualizado exitosamente');
        router.push('/dashboard/docentes');
      }
    } catch (error) {
      alert('Error al actualizar docente');
    } finally {
      setCargando(false);
    }
  };

  if (!formulario) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Docente</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoTexto
            etiqueta="Código"
            value={formulario.codigo_docente}
            onChange={(e) => setFormulario({ ...formulario, codigo_docente: e.target.value })}
            disabled
          />
          <CampoTexto
            etiqueta="Nombres"
            value={formulario.nombres}
            onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
            required
          />
          <CampoTexto
            etiqueta="Apellidos"
            value={formulario.apellidos}
            onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-2">Modalidad</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.modalidad}
              onChange={(e) => setFormulario({ ...formulario, modalidad: e.target.value })}
            >
              <option value="nombrado">Nombrado</option>
              <option value="contratado">Contratado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.categoria}
              onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
            >
              <option value="principal">Principal</option>
              <option value="asociado">Asociado</option>
              <option value="auxiliar">Auxiliar</option>
              <option value="jefe_practica">Jefe de Práctica</option>
            </select>
          </div>
          <CampoTexto
            etiqueta="Fecha de Ingreso"
            type="date"
            value={formulario.fecha_ingreso || ''}
            onChange={(e) => setFormulario({ ...formulario, fecha_ingreso: e.target.value })}
            required
          />
          <CampoTexto
            etiqueta="Correo"
            type="email"
            value={formulario.correo_electronico}
            onChange={(e) => setFormulario({ ...formulario, correo_electronico: e.target.value })}
          />
          <CampoTexto
            etiqueta="Teléfono"
            value={formulario.telefono || ''}
            onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Actualizar Docente'}
          </Boton>
          <Boton type="button" variante="secondary" onClick={() => router.back()}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}
