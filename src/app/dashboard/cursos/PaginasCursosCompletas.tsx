'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { CampoTexto } from '@/components/ui/CampoTexto';

// Página de prerequisitos
export function PrerequisitosPage({ params }: { params: { id: string } }) {
  const [curso, setCurso] = useState<any>(null);
  const [prerequisitos, setPrerequisitos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const resCurso = await fetch(`/api/cursos/${params.id}`);
    const dataCurso = await resCurso.json();
    if (dataCurso.exito) setCurso(dataCurso.datos);

    const resPre = await fetch(`/api/cursos/${params.id}/prerequisitos`);
    const dataPre = await resPre.json();
    if (dataPre.exito) setPrerequisitos(dataPre.datos);

    const resCursos = await fetch('/api/cursos');
    const dataCursos = await resCursos.json();
    if (dataCursos.exito) setCursos(dataCursos.datos);
  };

  const agregar = async () => {
    if (!seleccionado) return;

    await fetch(`/api/cursos/${params.id}/prerequisitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_prerequisito: parseInt(seleccionado) })
    });

    cargarDatos();
    setSeleccionado('');
  };

  const eliminar = async (idPrerequisito: number) => {
    await fetch(`/api/cursos/${params.id}/prerequisitos/${idPrerequisito}`, {
      method: 'DELETE'
    });
    cargarDatos();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Prerequisitos de {curso?.nombre}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Agregar Prerequisito</h3>
        
        <div className="flex gap-4">
          <select
            value={seleccionado}
            onChange={(e) => setSeleccionado(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
          >
            <option value="">Seleccione un curso</option>
            {cursos.map((c: any) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.codigo_curso} - {c.nombre}
              </option>
            ))}
          </select>
          <Boton onClick={agregar}>Agregar</Boton>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Prerequisitos Actuales</h3>
        
        <TablaDatos
          columnas={[
            { clave: 'codigo', etiqueta: 'Código' },
            { clave: 'nombre', etiqueta: 'Nombre' },
            { clave: 'creditos', etiqueta: 'Créditos' },
            { clave: 'acciones', etiqueta: 'Acciones' }
          ]}
          datos={prerequisitos.map((p: any) => ({
            codigo: p.codigo_curso,
            nombre: p.nombre,
            creditos: p.creditos,
            acciones: (
              <Boton
                onClick={() => eliminar(p.id_curso)}
                variante="danger"
                tamaño="small"
              >
                Eliminar
              </Boton>
            )
          }))}
        />
      </div>
    </div>
  );
}

// Página de plan de estudios
export function PlanEstudiosPage() {
  const [plan, setPlan] = useState<any[]>([]);

  useEffect(() => {
    cargarPlan();
  }, []);

  const cargarPlan = async () => {
    const response = await fetch('/api/cursos/plan-estudios');
    const data = await response.json();
    if (data.exito) setPlan(data.datos);
  };

  const ciclos = [...new Set(plan.map(c => c.ciclo))].sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plan de Estudios</h1>

      {ciclos.map(ciclo => {
        const cursosCiclo = plan.filter(c => c.ciclo === ciclo);
        const totalCreditos = cursosCiclo.reduce((sum, c) => sum + c.creditos, 0);

        return (
          <div key={ciclo} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ciclo {ciclo}</h3>
              <div className="text-sm text-gray-600">
                Total: {totalCreditos} créditos
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cursosCiclo.map(curso => (
                <div key={curso.id_curso} className="border rounded-lg p-4">
                  <div className="font-medium">{curso.codigo_curso}</div>
                  <div className="text-sm text-gray-600 mt-1">{curso.nombre}</div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Teoría: {curso.horas_teoria}h</span>
                    <span>Práctica: {curso.horas_practica}h</span>
                    <span>Lab: {curso.horas_laboratorio}h</span>
                    <span>{curso.creditos} créditos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Página de estadísticas de cursos
export function EstadisticasCursosPage() {
  const [estadisticas, setEstadisticas] = useState<any>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    const response = await fetch('/api/cursos/estadisticas');
    const data = await response.json();
    if (data.exito) setEstadisticas(data.datos);
  };

  if (!estadisticas) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas de Cursos</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600">
            {estadisticas.total}
          </div>
          <div className="text-sm text-gray-600">Total Cursos</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">
            {estadisticas.porCiclo.length}
          </div>
          <div className="text-sm text-gray-600">Ciclos</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-yellow-600">
            {estadisticas.totalCreditos}
          </div>
          <div className="text-sm text-gray-600">Total Créditos</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">
            {estadisticas.promedioCreditos.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Promedio Créditos</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Distribución por Ciclo</h3>
        <div className="space-y-3">
          {estadisticas.porCiclo.map((item: any) => (
            <div key={item.ciclo} className="flex items-center gap-4">
              <div className="w-20 font-medium">Ciclo {item.ciclo}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-primary-600 h-6 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ width: `${(item.cantidad / estadisticas.total) * 100}%` }}
                  >
                    {item.cantidad}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Página de sílabos
export function SilabosPage() {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    const response = await fetch('/api/cursos');
    const data = await response.json();
    if (data.exito) setCursos(data.datos);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Sílabos</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <TablaDatos
          columnas={[
            { clave: 'codigo', etiqueta: 'Código' },
            { clave: 'nombre', etiqueta: 'Nombre' },
            { clave: 'silabo', etiqueta: 'Sílabo' },
            { clave: 'acciones', etiqueta: 'Acciones' }
          ]}
          datos={cursos.map((c: any) => ({
            codigo: c.codigo_curso,
            nombre: c.nombre,
            silabo: c.tiene_silabo ? '✅ Disponible' : '❌ No disponible',
            acciones: (
              <div className="flex gap-2">
                {c.tiene_silabo ? (
                  <Boton tamaño="small">Ver</Boton>
                ) : (
                  <Boton tamaño="small">Subir</Boton>
                )}
              </div>
            )
          }))}
        />
      </div>
    </div>
  );
}
