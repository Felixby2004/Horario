'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function NuevoCursoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    horas_teoria: 0,
    horas_laboratorio: 0,
    horas_practica: 0,
    creditos: 0,
    ciclo: 1,
    plan_estudios: '2020'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      const data = await response.json();
      if (data.exito) {
        alert('Curso creado exitosamente');
        router.push('/dashboard/cursos');
      }
    } catch (error) {
      alert('Error al crear curso');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Curso</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CampoTexto
            etiqueta="Código del Curso"
            value={formulario.codigo}
            onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
            required
            ayuda="Ej: SIST-301"
          />

          <CampoTexto
            etiqueta="Nombre del Curso"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            required
          />

          <CampoTexto
            etiqueta="Horas de Teoría"
            type="number"
            value={formulario.horas_teoria}
            onChange={(e) => setFormulario({ ...formulario, horas_teoria: parseInt(e.target.value) })}
            required
          />

          <CampoTexto
            etiqueta="Horas de Laboratorio"
            type="number"
            value={formulario.horas_laboratorio}
            onChange={(e) => setFormulario({ ...formulario, horas_laboratorio: parseInt(e.target.value) })}
          />

          <CampoTexto
            etiqueta="Horas de Práctica"
            type="number"
            value={formulario.horas_practica}
            onChange={(e) => setFormulario({ ...formulario, horas_practica: parseInt(e.target.value) })}
          />

          <CampoTexto
            etiqueta="Créditos"
            type="number"
            value={formulario.creditos}
            onChange={(e) => setFormulario({ ...formulario, creditos: parseInt(e.target.value) })}
            required
          />

          <CampoTexto
            etiqueta="Ciclo"
            type="number"
            value={formulario.ciclo}
            onChange={(e) => setFormulario({ ...formulario, ciclo: parseInt(e.target.value) })}
            required
            ayuda="Ciclo académico (1-10)"
          />

          <CampoTexto
            etiqueta="Plan de Estudios"
            value={formulario.plan_estudios}
            onChange={(e) => setFormulario({ ...formulario, plan_estudios: e.target.value })}
            required
            ayuda="Ej: 2020, 2023"
          />
        </div>

        <div className="flex gap-4">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Curso'}
          </Boton>
          <Boton type="button" variante="secondary" onClick={() => router.back()}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}
