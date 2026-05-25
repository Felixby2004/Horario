'use client';

import { useState } from 'react';
import { Boton } from '@/components/ui/Boton';

// Selector de rango de fechas
export const SelectorRangoFechas = ({ onCambio }: any) => {
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');

  const handleCambio = () => {
    onCambio({ inicio, fin });
  };

  return (
    <div className="flex gap-4 items-end">
      <div>
        <label className="block text-sm font-medium mb-2">Desde</label>
        <input
          type="date"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Hasta</label>
        <input
          type="date"
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          className="border rounded-lg px-4 py-2"
        />
      </div>
      <Boton onClick={handleCambio}>Aplicar</Boton>
    </div>
  );
};

// Vista previa de reporte
export const VistaPreviaReporte = ({ datos }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-2 text-sm">
          <div><strong>Título:</strong> {datos.titulo}</div>
          <div><strong>Período:</strong> {datos.periodo}</div>
          <div><strong>Total registros:</strong> {datos.total}</div>
          <div><strong>Generado:</strong> {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

// Configurador de formato reporte
export const ConfiguradorFormato = ({ onCambio }: any) => {
  const [formato, setFormato] = useState({
    orientacion: 'vertical',
    tamanoPagina: 'A4',
    incluirGraficos: true,
    incluirEstadisticas: true
  });

  const handleCambio = (campo: string, valor: any) => {
    const nuevoFormato = { ...formato, [campo]: valor };
    setFormato(nuevoFormato);
    onCambio(nuevoFormato);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Configuración de Formato</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Orientación</label>
          <select
            value={formato.orientacion}
            onChange={(e) => handleCambio('orientacion', e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tamaño de Página</label>
          <select
            value={formato.tamanoPagina}
            onChange={(e) => handleCambio('tamanoPagina', e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="A4">A4</option>
            <option value="letter">Carta</option>
            <option value="legal">Legal</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formato.incluirGraficos}
              onChange={(e) => handleCambio('incluirGraficos', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Incluir gráficos</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formato.incluirEstadisticas}
              onChange={(e) => handleCambio('incluirEstadisticas', e.target.checked)}
              className="w-4 h-4"
            />
            <span>Incluir estadísticas</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Panel de exportación múltiple
export const PanelExportacionMultiple = ({ reportes }: any) => {
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const exportarTodos = async () => {
    for (const id of seleccionados) {
      // Exportar cada reporte
      await fetch(`/api/reportes/exportar/${id}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exportación Múltiple</h3>
      
      <div className="space-y-2 mb-4">
        {reportes.map((reporte: any) => (
          <label key={reporte.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={seleccionados.includes(reporte.id)}
              onChange={() => toggleSeleccion(reporte.id)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">{reporte.nombre}</div>
              <div className="text-sm text-gray-600">{reporte.descripcion}</div>
            </div>
          </label>
        ))}
      </div>

      <Boton
        onClick={exportarTodos}
        disabled={seleccionados.length === 0}
        className="w-full"
      >
        Exportar Seleccionados ({seleccionados.length})
      </Boton>
    </div>
  );
};

// Historial de reportes generados
export const HistorialReportes = ({ historial }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Historial de Reportes</h3>
      
      <div className="space-y-3">
        {historial.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{item.nombre}</div>
              <div className="text-sm text-gray-600">
                {new Date(item.fecha).toLocaleString()}
              </div>
            </div>
            <Boton tamaño="small" onClick={() => window.open(item.url)}>
              Descargar
            </Boton>
          </div>
        ))}
      </div>

      {historial.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay reportes generados
        </div>
      )}
    </div>
  );
};
