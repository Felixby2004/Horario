'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { TablaDatos } from '@/components/ui/TablaDatos';

// Página Nuevo Período
export default function NuevoPeriodoPage() {
  const [datos, setDatos] = useState({
    codigo: '',
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: false
  });

  const handleSubmit = async () => {
    const response = await fetch('/api/periodos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const result = await response.json();
    if (result.exito) {
      alert('Período creado exitosamente');
      window.location.href = '/dashboard/periodos';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo Período Académico</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <CampoTexto
            etiqueta="Código"
            value={datos.codigo}
            onChange={(e) => setDatos({...datos, codigo: e.target.value})}
            required
          />
          <CampoTexto
            etiqueta="Nombre"
            value={datos.nombre}
            onChange={(e) => setDatos({...datos, nombre: e.target.value})}
            required
          />
          <CampoTexto
            etiqueta="Fecha Inicio"
            type="date"
            value={datos.fecha_inicio}
            onChange={(e) => setDatos({...datos, fecha_inicio: e.target.value})}
            required
          />
          <CampoTexto
            etiqueta="Fecha Fin"
            type="date"
            value={datos.fecha_fin}
            onChange={(e) => setDatos({...datos, fecha_fin: e.target.value})}
            required
          />
          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={datos.activo}
                onChange={(e) => setDatos({...datos, activo: e.target.checked})}
                className="w-5 h-5"
              />
              <span>Período Activo</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Boton onClick={handleSubmit}>Crear Período</Boton>
          <Boton variante="secondary" onClick={() => window.history.back()}>
            Cancelar
          </Boton>
        </div>
      </div>
    </div>
  );
}

// Página Grupos del Curso
export function GruposDelCursoPage({ idCurso }: { idCurso: number }) {
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    cargarGrupos();
  }, [idCurso]);

  const cargarGrupos = async () => {
    const response = await fetch(`/api/grupos?curso=${idCurso}`);
    const data = await response.json();
    if (data.exito) setGrupos(data.datos);
  };

  const columnas = [
    { clave: 'numero_grupo', titulo: 'Grupo' },
    { clave: 'docente.nombres', titulo: 'Docente' },
    { clave: 'max_estudiantes', titulo: 'Capacidad' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Grupos del Curso</h2>
        <Boton onClick={() => {/* crear grupo */}}>Nuevo Grupo</Boton>
      </div>
      <TablaDatos datos={grupos} columnas={columnas} keyField="id_grupo" />
    </div>
  );
}

// Página Mantenimiento de Ambiente
export function MantenimientoAmbientePage({ idAmbiente }: { idAmbiente: number }) {
  const [mantenimiento, setMantenimiento] = useState({
    tipo: '',
    descripcion: '',
    fecha_programada: '',
    duracion_dias: 1
  });

  const handleRegistrar = async () => {
    const response = await fetch(`/api/ambientes/${idAmbiente}/mantenimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mantenimiento)
    });
    if (response.ok) {
      alert('Mantenimiento registrado');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrar Mantenimiento</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <CampoTexto
            etiqueta="Tipo de Mantenimiento"
            value={mantenimiento.tipo}
            onChange={(e) => setMantenimiento({...mantenimiento, tipo: e.target.value})}
          />
          <CampoTexto
            etiqueta="Descripción"
            value={mantenimiento.descripcion}
            onChange={(e) => setMantenimiento({...mantenimiento, descripcion: e.target.value})}
          />
          <CampoTexto
            etiqueta="Fecha Programada"
            type="date"
            value={mantenimiento.fecha_programada}
            onChange={(e) => setMantenimiento({...mantenimiento, fecha_programada: e.target.value})}
          />
          <CampoTexto
            etiqueta="Duración (días)"
            type="number"
            value={mantenimiento.duracion_dias}
            onChange={(e) => setMantenimiento({...mantenimiento, duracion_dias: parseInt(e.target.value)})}
          />
          <Boton onClick={handleRegistrar}>Registrar Mantenimiento</Boton>
        </div>
      </div>
    </div>
  );
}
