'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function NuevoPeriodoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    anio: new Date().getFullYear(),
    semestre: 1,
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'planificacion'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Solo enviar los campos que la API espera
      const datosEnviar = {
        nombre: formulario.nombre,
        anio: formulario.anio,
        semestre: formulario.semestre,
        fecha_inicio: formulario.fecha_inicio,
        fecha_fin: formulario.fecha_fin
      };

      const response = await fetch('/api/periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar)
      });

      const data = await response.json();
      if (data.exito) {
        alert('Período académico creado exitosamente');
        router.push('/dashboard/periodos');
      } else {
        alert(data.mensaje || 'Error al crear período');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al crear período académico: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Período Académico</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoTexto
            etiqueta="Código"
            value={formulario.codigo}
            onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
            required
            ayuda="Ej: 2025-I, 2025-II"
          />

          <CampoTexto
            etiqueta="Nombre"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            required
            ayuda="Ej: Período 2025-I"
          />

          <CampoTexto
            etiqueta="Año"
            type="number"
            value={formulario.anio}
            onChange={(e) => setFormulario({ ...formulario, anio: parseInt(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Semestre *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.semestre}
              onChange={(e) => setFormulario({ ...formulario, semestre: parseInt(e.target.value) })}
              required
            >
              <option value={1}>I (Primer Semestre)</option>
              <option value={2}>II (Segundo Semestre)</option>
            </select>
          </div>

          <CampoTexto
            etiqueta="Fecha de Inicio"
            type="date"
            value={formulario.fecha_inicio}
            onChange={(e) => setFormulario({ ...formulario, fecha_inicio: e.target.value })}
            required
          />

          <CampoTexto
            etiqueta="Fecha de Fin"
            type="date"
            value={formulario.fecha_fin}
            onChange={(e) => setFormulario({ ...formulario, fecha_fin: e.target.value })}
            required
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Estado *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.estado}
              onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}
              required
            >
              <option value="en_curso">▶️ En Curso</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Crear Período'}
          </Boton>
          <Boton type="button" variante="secondary" onClick={() => router.back()}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}
