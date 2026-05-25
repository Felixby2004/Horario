'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { TablaDatos } from '@/components/ui/TablaDatos';

// Página de asistencia docentes
export function AsistenciaDocentesPage() {
  const [asistencias, setAsistencias] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cargarAsistencias();
  }, [fecha]);

  const cargarAsistencias = async () => {
    const response = await fetch(`/api/docentes/asistencia?fecha=${fecha}`);
    const data = await response.json();
    if (data.exito) setAsistencias(data.datos);
  };

  const registrarAsistencia = async (idDocente: number, presente: boolean) => {
    await fetch('/api/docentes/asistencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_docente: idDocente, fecha, presente })
    });
    cargarAsistencias();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Control de Asistencia</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />

        <div className="mt-6">
          <TablaDatos
            columnas={[
              { clave: 'docente', etiqueta: 'Docente' },
              { clave: 'categoria', etiqueta: 'Categoría' },
              { clave: 'estado', etiqueta: 'Estado' },
              { clave: 'acciones', etiqueta: 'Acciones' }
            ]}
            datos={asistencias.map((a: any) => ({
              docente: `${a.apellidos}, ${a.nombres}`,
              categoria: a.categoria,
              estado: a.presente ? '✅ Presente' : '❌ Ausente',
              acciones: (
                <div className="flex gap-2">
                  <Boton
                    onClick={() => registrarAsistencia(a.id_docente, true)}
                    tamaño="small"
                    disabled={a.presente}
                  >
                    Presente
                  </Boton>
                  <Boton
                    onClick={() => registrarAsistencia(a.id_docente, false)}
                    tamaño="small"
                    variante="danger"
                    disabled={!a.presente}
                  >
                    Ausente
                  </Boton>
                </div>
              )
            }))}
          />
        </div>
      </div>
    </div>
  );
}

// Página de evaluación docentes
export function EvaluacionDocentesPage() {
  const [docentes, setDocentes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState<any>({});

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    const response = await fetch('/api/docentes');
    const data = await response.json();
    if (data.exito) setDocentes(data.datos);
  };

  const guardarEvaluacion = async (idDocente: number) => {
    const eval_data = evaluaciones[idDocente];
    await fetch('/api/docentes/evaluacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_docente: idDocente, ...eval_data })
    });
    alert('Evaluación guardada');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Evaluación de Docentes</h1>

      <div className="space-y-4">
        {docentes.map((docente: any) => (
          <div key={docente.id_docente} className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">
              {docente.apellidos}, {docente.nombres}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Puntualidad (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full border rounded-lg px-4 py-2"
                  onChange={(e) => setEvaluaciones({
                    ...evaluaciones,
                    [docente.id_docente]: {
                      ...evaluaciones[docente.id_docente],
                      puntualidad: parseInt(e.target.value)
                    }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Desempeño (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full border rounded-lg px-4 py-2"
                  onChange={(e) => setEvaluaciones({
                    ...evaluaciones,
                    [docente.id_docente]: {
                      ...evaluaciones[docente.id_docente],
                      desempeño: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Comentarios
              </label>
              <textarea
                className="w-full border rounded-lg px-4 py-2"
                rows={3}
                onChange={(e) => setEvaluaciones({
                  ...evaluaciones,
                  [docente.id_docente]: {
                    ...evaluaciones[docente.id_docente],
                    comentarios: e.target.value
                  }
                })}
              />
            </div>

            <div className="mt-4">
              <Boton onClick={() => guardarEvaluacion(docente.id_docente)}>
                Guardar Evaluación
              </Boton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de licencias y permisos
export function LicenciasPermisosPage() {
  const [licencias, setLicencias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarLicencias();
  }, []);

  const cargarLicencias = async () => {
    const response = await fetch('/api/docentes/licencias');
    const data = await response.json();
    if (data.exito) setLicencias(data.datos);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Licencias y Permisos</h1>
        <Boton onClick={() => setModalAbierto(true)}>
          Nueva Licencia
        </Boton>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <TablaDatos
          columnas={[
            { clave: 'docente', etiqueta: 'Docente' },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'inicio', etiqueta: 'Inicio' },
            { clave: 'fin', etiqueta: 'Fin' },
            { clave: 'estado', etiqueta: 'Estado' }
          ]}
          datos={licencias.map((l: any) => ({
            docente: `${l.docente.apellidos}, ${l.docente.nombres}`,
            tipo: l.tipo,
            inicio: l.fecha_inicio,
            fin: l.fecha_fin,
            estado: l.aprobado ? '✅ Aprobado' : '⏳ Pendiente'
          }))}
        />
      </div>
    </div>
  );
}

// Página de capacitaciones
export function CapacitacionesPage() {
  const [capacitaciones, setCapacitaciones] = useState([]);

  useEffect(() => {
    cargarCapacitaciones();
  }, []);

  const cargarCapacitaciones = async () => {
    const response = await fetch('/api/docentes/capacitaciones');
    const data = await response.json();
    if (data.exito) setCapacitaciones(data.datos);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Capacitaciones</h1>

      <div className="grid grid-cols-3 gap-4">
        {capacitaciones.map((cap: any) => (
          <div key={cap.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">{cap.titulo}</h3>
            <p className="text-sm text-gray-600 mb-4">{cap.descripcion}</p>
            <div className="text-sm">
              <div>📅 {cap.fecha}</div>
              <div>⏰ {cap.duracion} horas</div>
              <div>👥 {cap.inscritos} inscritos</div>
            </div>
            <Boton className="w-full mt-4">Inscribirse</Boton>
          </div>
        ))}
      </div>
    </div>
  );
}
