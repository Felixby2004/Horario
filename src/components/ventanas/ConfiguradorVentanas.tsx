'use client';

import { useState } from 'react';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export const ConfiguradorVentanas: React.FC = () => {
  const [formulario, setFormulario] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    modalidad_docente: 'nombrado',
    categoria_docente: 'principal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/ventanas-atencion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          id_periodo: 1
        })
      });

      const data = await response.json();

      if (data.exito) {
        alert('Ventana creada exitosamente');
        setFormulario({
          fecha: '',
          hora_inicio: '',
          hora_fin: '',
          modalidad_docente: 'nombrado',
          categoria_docente: 'principal'
        });
      }
    } catch (error) {
      alert('Error al crear ventana');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Configurar Nueva Ventana</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CampoTexto
            etiqueta="Fecha"
            type="date"
            value={formulario.fecha}
            onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <CampoTexto
              etiqueta="Hora Inicio"
              type="time"
              value={formulario.hora_inicio}
              onChange={(e) => setFormulario({ ...formulario, hora_inicio: e.target.value })}
              required
            />
            <CampoTexto
              etiqueta="Hora Fin"
              type="time"
              value={formulario.hora_fin}
              onChange={(e) => setFormulario({ ...formulario, hora_fin: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modalidad Docente *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.modalidad_docente}
              onChange={(e) => setFormulario({ ...formulario, modalidad_docente: e.target.value })}
              required
            >
              <option value="nombrado">Nombrado</option>
              <option value="contratado">Contratado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoría Docente *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.categoria_docente}
              onChange={(e) => setFormulario({ ...formulario, categoria_docente: e.target.value })}
              required
            >
              <option value="principal">Principal</option>
              <option value="asociado">Asociado</option>
              <option value="auxiliar">Auxiliar</option>
              <option value="jefe_practica">Jefe de Práctica</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>ℹ️ Información:</strong> Los docentes serán ordenados automáticamente por:
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Modalidad (nombrados primero)</li>
              <li>Categoría (principal, asociado, auxiliar, jefe de práctica)</li>
              <li>Antigüedad (mayor antigüedad primero)</li>
            </ol>
          </div>
        </div>

        <Boton type="submit">Crear Ventana de Atención</Boton>
      </form>
    </div>
  );
};
