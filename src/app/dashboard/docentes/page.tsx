'use client';

import { useState, useEffect } from 'react';
import { TablaDatos } from '@/components/ui/TablaDatos';
import { Boton } from '@/components/ui/Boton';
import { ModalDocente } from '@/components/dashboard/ModalDocente';
import Link from 'next/link';

export default function DocentesPage() {
  const [docentes, setDocentes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    try {
      const response = await fetch('/api/docentes');
      const data = await response.json();
      if (data.exito) {
        setDocentes(data.datos);
      }
    } catch (error) {
      console.error('Error cargando docentes:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirModal = (idDocente: number) => {
    setDocenteSeleccionado(idDocente);
    setModalAbierto(true);
  };

  const columnas = [
    { campo: 'codigo_docente' as const, encabezado: 'Código' },
    { 
      campo: 'nombres' as const, 
      encabezado: 'Docente',
      renderizar: (_: any, fila: any) => `${fila.apellidos}, ${fila.nombres}`
    },
    { campo: 'modalidad' as const, encabezado: 'Modalidad' },
    { campo: 'categoria' as const, encabezado: 'Categoría' },
    { campo: 'antiguedad' as const, encabezado: 'Antigüedad' },
    {
      campo: 'activo' as const,
      encabezado: 'Estado',
      renderizar: (valor: boolean) => (
        <span className={`badge ${valor ? 'badge-success' : 'badge-error'}`}>
          {valor ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      campo: 'id_docente' as const,
      encabezado: 'Acciones',
      renderizar: (_: any, fila: any) => (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleAbrirModal(fila.id_docente)}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            👁️ Ver
          </button>
          <Link href={`/dashboard/docentes/asignar-cursos-nuevo?id_docente=${fila.id_docente}`}>
            <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
              📚 Cursos
            </button>
          </Link>
          <Link href={`/dashboard/docentes/asignar-grupos?id_docente=${fila.id_docente}`}>
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              👥 Grupos
            </button>
          </Link>
        </div>
      )
    }
  ];

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  const textoBusqueda = busqueda.trim().toLowerCase();
  const docentesFiltrados = docentes.filter((d: any) => {
    if (!textoBusqueda) return true;
    const codigo = String(d.codigo_docente || '').toLowerCase();
    const nombres = String(d.nombres || '').toLowerCase();
    const apellidos = String(d.apellidos || '').toLowerCase();
    const categoria = String(d.categoria || '').toLowerCase();
    const modalidad = String(d.modalidad || '').toLowerCase();
    return (
      codigo.includes(textoBusqueda) ||
      nombres.includes(textoBusqueda) ||
      apellidos.includes(textoBusqueda) ||
      categoria.includes(textoBusqueda) ||
      modalidad.includes(textoBusqueda)
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de docentes</h1>
          <p className="text-gray-600 mt-1">Administra la información de los docentes</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/docentes/importar">
            <Boton variante="secondary">📥 Importar</Boton>
          </Link>
          <Link href="/dashboard/docentes/nuevo">
            <Boton>➕ Nuevo docente</Boton>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block text-sm font-medium mb-2">Buscar docente</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Busca por código, apellidos, nombres, categoría o modalidad..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Los docentes son los responsables de dictar cursos y solicitar horarios durante su ventana de atención.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TablaDatos
          datos={docentesFiltrados}
          columnas={columnas}
          keyField="id_docente"
        />
      </div>

      <ModalDocente
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        idDocente={docenteSeleccionado}
      />
    </div>
  );
}
