'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface PeriodoAcademico {
  id_periodo: number;
  codigo: string;
  nombre: string;
}

interface Curso {
  id_curso: number;
  codigo: string;
  nombre: string;
  ciclo: number;
}

export default function NuevoGrupoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>([]);
  
  const [formulario, setFormulario] = useState({
    id_curso: '',
    id_periodo: '',
    codigo_grupo: '',
    capacidad_maxima: 40
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    // Filtrar cursos cuando cambia el período
    if (formulario.id_periodo) {
      filtrarCursosPorPeriodo();
    } else {
      setCursosFiltrados([]);
    }
  }, [formulario.id_periodo, cursos]);

  const filtrarCursosPorPeriodo = () => {
    const periodo = periodos.find((p) => p.id_periodo === parseInt(formulario.id_periodo));
    if (!periodo) {
      setCursosFiltrados([]);
      return;
    }

    let ciclosPermitidos: number[] = [];
    
    // Determinar ciclos según el código del período
    if (periodo.codigo.endsWith('-I')) {
      // Período I: Solo ciclos impares
      ciclosPermitidos = [1, 3, 5, 7, 9];
    } else if (periodo.codigo.endsWith('-II')) {
      // Período II: Solo ciclos pares
      ciclosPermitidos = [2, 4, 6, 8, 10];
    } else if (periodo.codigo.includes('-EXT')) {
      // Período extraordinario: Todos los ciclos
      ciclosPermitidos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } else {
      // Por defecto, todos los ciclos
      ciclosPermitidos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    // Filtrar cursos que pertenezcan a los ciclos permitidos
    const filtrados = cursos.filter((c) => ciclosPermitidos.includes(c.ciclo));
    setCursosFiltrados(filtrados);
    
    // Limpiar curso seleccionado si no está en la nueva lista
    if (formulario.id_curso) {
      const cursoValido = filtrados.find((c) => c.id_curso === parseInt(formulario.id_curso));
      if (!cursoValido) {
        setFormulario({ ...formulario, id_curso: '' });
      }
    }
  };

  const cargarDatos = async () => {
    try {
      const [resPeriodos, resCursos] = await Promise.all([
        fetch('/api/periodos'),
        fetch('/api/cursos')
      ]);

      const [dataPeriodos, dataCursos] = await Promise.all([
        resPeriodos.json(),
        resCursos.json()
      ]);

      if (dataPeriodos.exito) setPeriodos(dataPeriodos.datos || []);
      if (dataCursos.exito) setCursos(dataCursos.datos || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_curso: parseInt(formulario.id_curso),
          id_periodo: parseInt(formulario.id_periodo),
          codigo_grupo: formulario.codigo_grupo,
          capacidad_maxima: formulario.capacidad_maxima,
          activo: true
        })
      });

      const data = await response.json();
      if (data.exito) {
        alert('Grupo creado exitosamente');
        router.push('/dashboard/grupos');
      } else {
        alert(data.mensaje || 'Error al crear grupo');
      }
    } catch (error) {
      alert('Error al crear grupo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Grupo</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SearchableSelect
              etiqueta="Período académico"
              opciones={periodos.map((p) => ({
                valor: String(p.id_periodo),
                etiqueta: p.nombre,
                codigo: p.codigo
              }))}
              value={formulario.id_periodo}
              onChange={(valor) =>
                setFormulario({ ...formulario, id_periodo: String(valor), id_curso: '' })
              }
              placeholder="Seleccione un período"
              camposBusqueda={['codigo']}
              required
            />
          </div>

          <div>
            <SearchableSelect
              etiqueta="Curso"
              opciones={cursosFiltrados.map((c) => ({
                valor: String(c.id_curso),
                etiqueta: `${c.codigo} - ${c.nombre}`,
                codigo: c.codigo,
                ciclo: `Ciclo ${c.ciclo}`
              }))}
              value={formulario.id_curso}
              onChange={(valor) => setFormulario({ ...formulario, id_curso: String(valor) })}
              placeholder={
                !formulario.id_periodo
                  ? 'Primero seleccione un período'
                  : cursosFiltrados.length === 0
                    ? 'No hay cursos disponibles para este período'
                    : 'Seleccione un curso'
              }
              camposBusqueda={['codigo', 'ciclo']}
              required
              disabled={!formulario.id_periodo || cursosFiltrados.length === 0}
            />
            {formulario.id_periodo && cursosFiltrados.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Mostrando {cursosFiltrados.length} curso(s) del período seleccionado
              </p>
            )}
          </div>

          <CampoTexto
            etiqueta="Código de Grupo"
            value={formulario.codigo_grupo}
            onChange={(e) => setFormulario({ ...formulario, codigo_grupo: e.target.value })}
            required
            ayuda="Ej: A, B, C, etc."
          />

          <CampoTexto
            etiqueta="Capacidad Máxima"
            type="number"
            value={formulario.capacidad_maxima}
            onChange={(e) => setFormulario({ ...formulario, capacidad_maxima: parseInt(e.target.value) })}
            required
            ayuda="Número de estudiantes"
          />
        </div>

        <div className="flex gap-4">
          <Boton type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Crear Grupo'}
          </Boton>
          <Boton type="button" variante="secondary" onClick={() => router.back()}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  );
}
