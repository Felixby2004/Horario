'use client';

import { useState, useEffect } from 'react';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';
import Link from 'next/link';

interface Ambiente {
  id_ambiente: number;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  pabellon?: string;
  activo: boolean;
}

export default function AmbientesPage() {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarAmbientes();
  }, [filtroTipo]);

  const cargarAmbientes = async () => {
    try {
      const url = `/api/ambientes${filtroTipo ? `?tipo=${filtroTipo}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.exito) setAmbientes(data.datos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleInhabilitar = async (id: number, nombre: string) => {
    if (!confirm(`¿Deseas eliminar el ambiente "${nombre}"?`)) return;

    try {
      const response = await fetch(`/api/ambientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false })
      });

      const data = await response.json();
      if (data.exito) {
        alert('Ambiente desactivado');
        cargarAmbientes();
      } else {
        alert('Error: ' + data.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desactivar ambiente');
    }
  };

  const columnas = [
    { campo: 'codigo' as const, encabezado: 'Código' },
    { campo: 'nombre' as const, encabezado: 'Ambiente' },
    { 
      campo: 'tipo' as const, 
      encabezado: 'Tipo',
      renderizar: (tipo: string) => (
        <span className={`badge ${tipo === 'laboratorio' ? 'badge-primary' : 'badge-secondary'}`}>
          {tipo === 'aula' ? '🏫 Aula' : '💻 Laboratorio'}
        </span>
      )
    },
    { campo: 'capacidad' as const, encabezado: 'Capacidad' },
    { campo: 'pabellon' as const, encabezado: 'Pabellón' },
    {
      campo: 'id_ambiente',
      encabezado: 'Acciones',
      renderizar: (id: number, fila: Ambiente) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/ambientes/${id}`}>
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Editar
            </button>
          </Link>
          {fila.activo && (
            <button
              onClick={() => handleInhabilitar(id, fila.nombre)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Eliminar
            </button>
          )}
          {!fila.activo && (
            <span className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm">
              ⛔ Inactivo
            </span>
          )}
        </div>
      )
    }
  ];


  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  const textoBusqueda = busqueda.trim().toLowerCase();
  const ambientesFiltrados = ambientes.filter((a: Ambiente) => {
    if (!textoBusqueda) return true;
    const codigo = String(a.codigo || '').toLowerCase();
    const nombre = String(a.nombre || '').toLowerCase();
    const tipo = String(a.tipo || '').toLowerCase();
    const pabellon = String(a.pabellon || '').toLowerCase();
    return (
      codigo.includes(textoBusqueda) ||
      nombre.includes(textoBusqueda) ||
      tipo.includes(textoBusqueda) ||
      pabellon.includes(textoBusqueda)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de ambientes</h1>
          <p className="text-gray-600 mt-1">Aulas y laboratorios disponibles</p>
        </div>
        <Link href="/dashboard/ambientes/nuevo">
          <Boton>➕ Nuevo ambiente</Boton>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Buscar ambiente</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Busca por código, nombre, tipo o pabellón..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Los ambientes son aulas/laboratorios donde se dictan clases. Se usan para validar disponibilidad al asignar horarios.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setFiltroTipo('')}
            className={`px-4 py-2 rounded-lg ${!filtroTipo ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroTipo('aula')}
            className={`px-4 py-2 rounded-lg ${filtroTipo === 'aula' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Aulas
          </button>
          <button
            onClick={() => setFiltroTipo('laboratorio')}
            className={`px-4 py-2 rounded-lg ${filtroTipo === 'laboratorio' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Laboratorios
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TablaDatos datos={ambientesFiltrados} columnas={columnas} keyField="id_ambiente" />
      </div>
    </div>
  );
}
