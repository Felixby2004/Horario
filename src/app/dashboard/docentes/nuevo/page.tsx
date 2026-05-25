'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function NuevoDocentePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [formulario, setFormulario] = useState({
    codigo_docente: '',
    nombres: '',
    apellidos: '',
    modalidad: 'nombrado',
    categoria: 'principal',
    fecha_ingreso: '',
    correo_electronico: '',
    telefono: '',
    grado_academico: 'doctor',
    especialidad: '',
    dedicacion: 'tiempo_completo'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('/api/docentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();

      if (data.exito) {
        alert('Docente creado exitosamente');
        router.push('/dashboard/docentes');
      } else {
        alert('Error al crear docente');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (campo: string, valor: any) => {
    setFormulario({ ...formulario, [campo]: valor });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Nuevo Docente</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoTexto
            etiqueta="Código de Docente"
            value={formulario.codigo_docente}
            onChange={(e) => handleChange('codigo_docente', e.target.value)}
            required
          />

          <CampoTexto
            etiqueta="Nombres"
            value={formulario.nombres}
            onChange={(e) => handleChange('nombres', e.target.value)}
            required
          />

          <CampoTexto
            etiqueta="Apellidos"
            value={formulario.apellidos}
            onChange={(e) => handleChange('apellidos', e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Modalidad *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.modalidad}
              onChange={(e) => handleChange('modalidad', e.target.value)}
              required
            >
              <option value="nombrado">Nombrado</option>
              <option value="contratado">Contratado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoría *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              required
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
            value={formulario.fecha_ingreso}
            onChange={(e) => handleChange('fecha_ingreso', e.target.value)}
            required
          />

          <CampoTexto
            etiqueta="Correo Electrónico"
            type="email"
            value={formulario.correo_electronico}
            onChange={(e) => handleChange('correo_electronico', e.target.value)}
            required
          />

          <CampoTexto
            etiqueta="Teléfono"
            value={formulario.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Grado Académico</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.grado_academico}
              onChange={(e) => handleChange('grado_academico', e.target.value)}
            >
              <option value="bachiller">Bachiller</option>
              <option value="maestro">Maestro</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <CampoTexto
            etiqueta="Especialidad"
            value={formulario.especialidad}
            onChange={(e) => handleChange('especialidad', e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Dedicación</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.dedicacion}
              onChange={(e) => handleChange('dedicacion', e.target.value)}
            >
              <option value="tiempo_completo">Tiempo Completo</option>
              <option value="tiempo_parcial">Tiempo Parcial</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Docente'}
          </Boton>
          <Boton
            type="button"
            variante="secondary"
            onClick={() => router.back()}
          >
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}
