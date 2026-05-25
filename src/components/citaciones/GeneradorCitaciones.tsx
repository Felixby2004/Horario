'use client';

import React, { useState, useEffect } from 'react';

interface GeneradorCitacionesProps {
  idPeriodo: number;
  idVentana: number;
}

interface Docente {
  id_docente: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  categoria: string;
  modalidad: string;
  antiguedad: number;
}

interface DocenteSeleccionado extends Docente {
  numero_orden_turno: number;
}

export default function GeneradorCitaciones({
  idPeriodo,
  idVentana
}: GeneradorCitacionesProps) {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<DocenteSeleccionado[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [criterioOrden, setCriterioOrden] = useState<'antiguedad' | 'categoria' | 'combinado'>('combinado');

  // Cargar docentes
  useEffect(() => {
    const cargarDocentes = async () => {
      try {
        // Obtener docentes del período que pueden ser citados
        const response = await fetch(
          `/api/docentes?idPeriodo=${idPeriodo}&activos=true&limit=500`
        );

        if (response.ok) {
          const data = await response.json();
          const docentesList = Array.isArray(data) ? data : data.docentes || [];
          setDocentes(docentesList);
        }
      } catch (err) {
        console.error('Error cargando docentes:', err);
        setError('Error al cargar docentes');
      } finally {
        setLoading(false);
      }
    };

    cargarDocentes();
  }, [idPeriodo]);

  const docentes Filtrados = docentes.filter(d =>
    d.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.codigo_docente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggleDocenteSeleccionado = (docente: Docente) => {
    const yaSeleccionado = docentesSeleccionados.find(
      d => d.id_docente === docente.id_docente
    );

    if (yaSeleccionado) {
      setDocentesSeleccionados(
        docentesSeleccionados.filter(d => d.id_docente !== docente.id_docente)
      );
    } else {
      const nuevoTurno = docentesSeleccionados.length + 1;
      setDocentesSeleccionados([
        ...docentesSeleccionados,
        { ...docente, numero_orden_turno: nuevoTurno }
      ]);
    }
  };

  const ordenarDocentesAutomaticamente = () => {
    const copia = [...docentesSeleccionados];

    copia.sort((a, b) => {
      switch (criterioOrden) {
        case 'antiguedad':
          return b.antiguedad - a.antiguedad;

        case 'categoria':
          const ordenCat = { principal: 4, asociado: 3, auxiliar: 2, jefe_practica: 1 };
          return (
            (ordenCat[b.categoria as keyof typeof ordenCat] || 0) -
            (ordenCat[a.categoria as keyof typeof ordenCat] || 0)
          );

        case 'combinado':
        default:
          const orden = { principal: 4, asociado: 3, auxiliar: 2, jefe_practica: 1 };
          const ordA = orden[a.categoria as keyof typeof orden] || 0;
          const ordB = orden[b.categoria as keyof typeof orden] || 0;

          if (ordA !== ordB) {
            return ordB - ordA;
          }
          return b.antiguedad - a.antiguedad;
      }
    });

    // Asignar turnos en orden
    const reasignados = copia.map((d, idx) => ({
      ...d,
      numero_orden_turno: idx + 1
    }));

    setDocentesSeleccionados(reasignados);
  };

  const handleGenerarCitaciones = async () => {
    if (docentesSeleccionados.length === 0) {
      setError('Selecciona al menos un docente');
      return;
    }

    setGenerando(true);
    setError('');
    setExito('');

    try {
      const response = await fetch('/api/citaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idVentana,
          docentes: docentesSeleccionados.map(d => ({
            id_docente: d.id_docente,
            numero_orden_turno: d.numero_orden_turno
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExito(`${data.citaciones.length} citaciones creadas exitosamente`);
        setDocentesSeleccionados([]);
        setBusqueda('');
        setTimeout(() => setExito(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear citaciones');
      }
    } catch (err) {
      console.error('Error generando citaciones:', err);
      setError('Error al crear citaciones');
    } finally {
      setGenerando(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando docentes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Panel de Control */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Generador de Citaciones Escalonadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar docente
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, apellido o código..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Criterio de Ordenamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={criterioOrden}
              onChange={(e) => setCriterioOrden(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="combinado">Categoría + Antigüedad</option>
              <option value="antiguedad">Solo Antigüedad</option>
              <option value="categoria">Solo Categoría</option>
            </select>
          </div>
        </div>

        {/* Botón Ordenar Automáticamente */}
        {docentesSeleccionados.length > 0 && (
          <button
            onClick={ordenarDocentesAutomaticamente}
            className="w-full mb-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Ordenar Seleccionados por {criterioOrden === 'combinado' ? 'Categoría + Antigüedad' : criterioOrden === 'antiguedad' ? 'Antigüedad' : 'Categoría'}
          </button>
        )}
      </div>

      {/* Lista de Docentes Filtrados */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-800 mb-3">
          Docentes Disponibles ({docentesFiltrados.length})
        </h4>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {docentesFiltrados.map(docente => {
            const seleccionado = docentesSeleccionados.find(
              d => d.id_docente === docente.id_docente
            );
            const turno = seleccionado?.numero_orden_turno;

            return (
              <div
                key={docente.id_docente}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  seleccionado
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleDocenteSeleccionado(docente)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {docente.nombres} {docente.apellidos}
                    </p>
                    <div className="text-sm text-gray-600 flex gap-3 mt-1">
                      <span>Código: {docente.codigo_docente}</span>
                      <span>Categoría: {docente.categoria}</span>
                      <span>Antigüedad: {docente.antiguedad} años</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {seleccionado && (
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {turno}
                      </div>
                    )}
                    <input
                      type="checkbox"
                      checked={!!seleccionado}
                      onChange={() => toggleDocenteSeleccionado(docente)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen de Selección */}
      {docentesSeleccionados.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">
            Docentes Seleccionados ({docentesSeleccionados.length})
          </h4>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {docentesSeleccionados
              .sort((a, b) => a.numero_orden_turno - b.numero_orden_turno)
              .map((docente, idx) => (
                <div key={docente.id_docente} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-sm">
                    <strong>Turno {docente.numero_orden_turno}:</strong> {docente.nombres} {docente.apellidos}
                  </span>
                  <button
                    onClick={() => toggleDocenteSeleccionado(docente)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {exito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {exito}
        </div>
      )}

      {/* Botón Generar */}
      <button
        onClick={handleGenerarCitaciones}
        disabled={generando || docentesSeleccionados.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {generando
          ? 'Generando Citaciones...'
          : `Generar ${docentesSeleccionados.length} Citaciones`}
      </button>
    </div>
  );
}
