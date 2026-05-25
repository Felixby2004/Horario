'use client';

import { useState, useEffect } from 'react';
import { Boton } from '@/components/ui/Boton';
import { TablaDatos } from '@/components/ui/TablaDatos';

// Página de Períodos Académicos
export function PeriodosPage() {
  const [periodos, setPeriodos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const cargarPeriodos = async () => {
    const response = await fetch('/api/periodos');
    const data = await response.json();
    if (data.exito) setPeriodos(data.datos);
    setCargando(false);
  };

  const columnas = [
    { clave: 'codigo', titulo: 'Código' },
    { clave: 'nombre', titulo: 'Nombre' },
    { clave: 'fecha_inicio', titulo: 'Inicio' },
    { clave: 'fecha_fin', titulo: 'Fin' },
    { 
      clave: 'activo', 
      titulo: 'Estado',
      renderizar: (valor: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${valor ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {valor ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  if (cargando) return <div className="flex justify-center py-12"><div className="loader"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Períodos Académicos</h1>
        <Boton onClick={() => window.location.href = '/dashboard/periodos/nuevo'}>
          Nuevo Período
        </Boton>
      </div>
      <TablaDatos
        datos={periodos}
        columnas={columnas}
        keyField="id_periodo"
      />
    </div>
  );
}

// Página de importar docentes
export function ImportarDocentesPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);

  const handleImportar = async () => {
    if (!archivo) return;
    
    setImportando(true);
    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const response = await fetch('/api/docentes/importar', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.exito) {
        alert(`Importados ${data.cantidad} docentes exitosamente`);
      }
    } catch (error) {
      alert('Error al importar');
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Importar Docentes</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Seleccionar archivo Excel o CSV
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <Boton
            onClick={handleImportar}
            disabled={!archivo || importando}
          >
            {importando ? 'Importando...' : 'Importar Docentes'}
          </Boton>
        </div>
      </div>
    </div>
  );
}

// Página de conflictos
export function ConflictosPage() {
  const [conflictos, setConflictos] = useState([]);

  useEffect(() => {
    cargarConflictos();
  }, []);

  const cargarConflictos = async () => {
    const response = await fetch('/api/horarios/conflictos');
    const data = await response.json();
    if (data.exito) setConflictos(data.conflictos);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Conflictos de Horarios</h1>
      <div className="space-y-3">
        {conflictos.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="font-semibold text-green-800">No hay conflictos</div>
            <div className="text-sm text-green-600">Todos los horarios están correctamente asignados</div>
          </div>
        ) : (
          conflictos.map((conflicto: any, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-semibold text-red-800">{conflicto.tipo}</div>
              <div className="text-sm text-red-600 mt-1">{conflicto.descripcion}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
