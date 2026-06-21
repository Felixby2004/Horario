'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { obtenerEtiquetaCarreraCurso, TIPOS_CURSO_OPTIONS } from '@/lib/cursos';

interface DepartamentoAcademico {
  id_departamento: number;
  nombre: string;
}

interface CursoBase {
  id_curso: number;
  codigo: string;
  nombre: string;
}

export default function NuevoCursoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [departamentos, setDepartamentos] = useState<DepartamentoAcademico[]>([]);
  const [cursos, setCursos] = useState<CursoBase[]>([]);
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    tipo_curso: 'O',
    id_departamento: '',
    horas_teoria: 0,
    horas_laboratorio: 0,
    horas_practica: 0,
    creditos: 0,
    ciclo: 1,
    plan_estudios: '2020',
    prerequisito_ids: [] as string[]
  });

  useEffect(() => {
    cargarDepartamentos();
    cargarCursos();
  }, []);

  const cargarDepartamentos = async () => {
    try {
      const response = await fetch('/api/departamentos');
      const data = await response.json();
      if (data.exito) {
        setDepartamentos(data.datos || []);
      }
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    }
  };

  const cargarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      if (data.exito) {
        setCursos((data.datos || []).filter((curso: any) => curso.activo !== false));
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.id_departamento) {
      alert('Debe seleccionar el departamento académico o carrera del curso');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          prerequisito_ids: formulario.prerequisito_ids
        })
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

          <SearchableSelect
            etiqueta="Tipo de curso"
            opciones={TIPOS_CURSO_OPTIONS.map((opcion) => ({
              valor: opcion.valor,
              etiqueta: opcion.etiqueta
            }))}
            value={formulario.tipo_curso}
            onChange={(valor) => setFormulario({ ...formulario, tipo_curso: String(valor) })}
            placeholder="Selecciona un tipo de curso"
            required
          />

          <SearchableSelect
            etiqueta="Escuela académica"
            opciones={departamentos.map((departamento) => ({
              valor: String(departamento.id_departamento),
              etiqueta: obtenerEtiquetaCarreraCurso(departamento.nombre)
            }))}
            value={formulario.id_departamento}
            onChange={(valor) => setFormulario({ ...formulario, id_departamento: String(valor) })}
            placeholder="Selecciona una escuela académica"
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

        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Prerrequisitos</h2>
            <p className="text-sm text-gray-500">Agrega todos los cursos que deben aprobarse antes de llevar este curso.</p>
          </div>

          <SearchableSelect
            etiqueta="Agregar prerrequisito"
            opciones={cursos
              .filter((curso) => !formulario.prerequisito_ids.includes(String(curso.id_curso)))
              .map((curso) => ({
                valor: String(curso.id_curso),
                etiqueta: `${curso.codigo} - ${curso.nombre}`
              }))}
            value=""
            onChange={(valor) =>
              setFormulario((actual) => ({
                ...actual,
                prerequisito_ids: Array.from(new Set([...actual.prerequisito_ids, String(valor)]))
              }))
            }
            placeholder="Selecciona un curso previo"
          />

          {formulario.prerequisito_ids.length ? (
            <div className="flex flex-wrap gap-2">
              {cursos
                .filter((curso) => formulario.prerequisito_ids.includes(String(curso.id_curso)))
                .map((curso) => (
                  <span
                    key={curso.id_curso}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900"
                  >
                    {curso.codigo} - {curso.nombre}
                    <button
                      type="button"
                      onClick={() =>
                        setFormulario((actual) => ({
                          ...actual,
                          prerequisito_ids: actual.prerequisito_ids.filter((id) => id !== String(curso.id_curso))
                        }))
                      }
                      className="font-semibold text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Este curso se puede crear sin prerrequisitos.</p>
          )}
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
