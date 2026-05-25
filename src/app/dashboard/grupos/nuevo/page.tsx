'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Boton } from '@/components/ui/Boton';

export default function NuevoGrupoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [periodos, setPeriodos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  
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
    const periodo = periodos.find((p: any) => p.id_periodo === parseInt(formulario.id_periodo));
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
    const filtrados = cursos.filter((c: any) => ciclosPermitidos.includes(c.ciclo));
    setCursosFiltrados(filtrados);
    
    // Limpiar curso seleccionado si no está en la nueva lista
    if (formulario.id_curso) {
      const cursoValido = filtrados.find((c: any) => c.id_curso === parseInt(formulario.id_curso));
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
            <label className="block text-sm font-medium mb-2">Período Académico *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.id_periodo}
              onChange={(e) => setFormulario({ ...formulario, id_periodo: e.target.value })}
              required
            >
              <option value="">Seleccione un período</option>
              {periodos.map((p: any) => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Curso *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formulario.id_curso}
              onChange={(e) => setFormulario({ ...formulario, id_curso: e.target.value })}
              required
              disabled={!formulario.id_periodo}
            >
              <option value="">
                {!formulario.id_periodo 
                  ? 'Primero seleccione un período' 
                  : cursosFiltrados.length === 0 
                    ? 'No hay cursos disponibles para este período'
                    : 'Seleccione un curso'
                }
              </option>
              {cursosFiltrados.map((c: any) => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.codigo} - {c.nombre} (Ciclo {c.ciclo})
                </option>
              ))}
            </select>
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
