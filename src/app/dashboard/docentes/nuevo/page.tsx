'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  CATEGORIAS_ORDINARIAS,
  MODALIDAD_OPTIONS,
  TIPOS_CONTRATO,
  TIPOS_EXTRAORDINARIOS,
  actualizarFormularioDocente,
  crearFormularioDocenteInicial,
  obtenerOpcionesDedicacion
} from '@/lib/docentes';

export default function NuevoDocentePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [facultades, setFacultades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [formulario, setFormulario] = useState(
    crearFormularioDocenteInicial({
      grado_academico: 'doctor'
    })
  );

  useEffect(() => {
    cargarFacultades();
  }, []);

  const cargarFacultades = async () => {
    try {
      const response = await fetch('/api/facultades');
      const data = await response.json();
      if (data.exito) {
        setFacultades(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando facultades:', error);
    }
  };

  const cargarDepartamentos = async (idFacultad: string) => {
    try {
      const response = await fetch(`/api/departamentos?id_facultad=${idFacultad}`);
      const data = await response.json();
      if (data.exito) {
        setDepartamentos(data.datos || []);
      }
    } catch (error) {
      console.error('Error cargando departamentos:', error);
    }
  };

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
    setFormulario((previo) => actualizarFormularioDocente(previo, campo as any, valor));
  };

  const opcionesDedicacion = obtenerOpcionesDedicacion(formulario.modalidad);

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
            <label className="block text-sm font-medium mb-2">DNI Docente *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formulario.dni_docente}
              onChange={(e) => handleChange('dni_docente', e.target.value)}
              placeholder="Ej: 12345678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modalidad *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.modalidad}
              onChange={(e) => handleChange('modalidad', e.target.value)}
              required
            >
              {MODALIDAD_OPTIONS.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {formulario.modalidad === 'nombrado' && (
            <div>
              <label className="block text-sm font-medium mb-2">Categoría *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formulario.categoria_ordinaria}
                onChange={(e) => handleChange('categoria_ordinaria', e.target.value)}
                required
              >
                {CATEGORIAS_ORDINARIAS.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formulario.modalidad === 'contratado' && (
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Contrato *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formulario.tipo_contrato}
                onChange={(e) => handleChange('tipo_contrato', e.target.value)}
                required
              >
                {TIPOS_CONTRATO.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formulario.modalidad === 'extraordinario' && (
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Extraordinario *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formulario.tipo_extraordinario}
                onChange={(e) => handleChange('tipo_extraordinario', e.target.value)}
                required
              >
                {TIPOS_EXTRAORDINARIOS.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Facultad *</label>
            <SearchableSelect
              opciones={facultades.map((f: any) => ({
                valor: f.id_facultad,
                etiqueta: f.nombre
              }))}
              value={formulario.id_facultad}
              onChange={(valor) => {
                setFormulario({ 
                  ...formulario, 
                  id_facultad: valor as string, 
                  id_departamento: '' 
                });
                if (valor) {
                  cargarDepartamentos(valor as string);
                } else {
                  setDepartamentos([]);
                }
              }}
              placeholder="Selecciona una facultad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Departamento Académico *</label>
            <SearchableSelect
              opciones={departamentos.map((d: any) => ({
                valor: d.id_departamento,
                etiqueta: d.nombre
              }))}
              value={formulario.id_departamento}
              onChange={(valor) => {
                setFormulario({ ...formulario, id_departamento: valor as string });
              }}
              placeholder="Selecciona un departamento"
              disabled={!formulario.id_facultad}
              required
            />
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
            <label className="block text-sm font-medium mb-2">Régimen y Dedicación *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.dedicacion}
              onChange={(e) => handleChange('dedicacion', e.target.value)}
              required
              disabled={formulario.modalidad === 'contratado'}
            >
              {opcionesDedicacion.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
            {formulario.modalidad === 'contratado' && (
              <p className="text-xs text-gray-500 mt-1">
                La dedicación se deriva automáticamente del tipo de contrato.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Horas Máximas Semanales</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={formulario.horas_maximas_semanales}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Se calcula automáticamente según el régimen seleccionado.
            </p>
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
