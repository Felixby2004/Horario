'use client';

import { useState } from 'react';

// Calendario
export const Calendario = ({ fechaSeleccionada, onSeleccionar }: any) => {
  const [mesActual, setMesActual] = useState(new Date());

  const obtenerDiasMes = () => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const ultimoDia = new Date(year, month + 1, 0).getDate();

    const dias = [];
    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= ultimoDia; i++) {
      dias.push(i);
    }
    return dias;
  };

  const dias = obtenerDiasMes();
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))}
          className="px-3 py-1 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <div className="font-semibold">
          {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
        </div>
        <button
          onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1))}
          className="px-3 py-1 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {diasSemana.map(dia => (
          <div key={dia} className="text-center text-sm font-medium text-gray-600 py-2">
            {dia}
          </div>
        ))}
        {dias.map((dia, i) => (
          <div
            key={i}
            onClick={() => dia && onSeleccionar?.(new Date(mesActual.getFullYear(), mesActual.getMonth(), dia))}
            className={`text-center py-2 cursor-pointer rounded ${
              dia ? 'hover:bg-primary-100' : ''
            } ${
              dia && fechaSeleccionada?.getDate() === dia ? 'bg-primary-600 text-white' : ''
            }`}
          >
            {dia || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

// Buscador Global
export const BuscadorGlobal = ({ onBuscar }: any) => {
  const [termino, setTermino] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar?.(termino);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        placeholder="Buscar..."
        className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </div>
    </form>
  );
};

// Filtros Avanzados
export const FiltrosAvanzados = ({ filtros, onChange }: any) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div>
      <button
        onClick={() => setAbierto(!abierto)}
        className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
      >
        <span>Filtros</span>
        <span className={`transform transition-transform ${abierto ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {abierto && (
        <div className="mt-2 p-4 border rounded-lg bg-white shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(filtros).map(key => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {key.replace('_', ' ')}
                </label>
                <select
                  value={filtros[key]}
                  onChange={(e) => onChange({ ...filtros, [key]: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Todos</option>
                  {/* Opciones específicas según el filtro */}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onChange({})}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Limpiar
            </button>
            <button
              onClick={() => setAbierto(false)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Selector de Fecha
export const SelectorFecha = ({ value, onChange, etiqueta }: any) => {
  return (
    <div>
      {etiqueta && (
        <label className="block text-sm font-medium mb-1">{etiqueta}</label>
      )}
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
};

// Selector de Hora
export const SelectorHora = ({ value, onChange, etiqueta }: any) => {
  return (
    <div>
      {etiqueta && (
        <label className="block text-sm font-medium mb-1">{etiqueta}</label>
      )}
      <input
        type="time"
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
};

// Indicador de Carga
export const IndicadorCarga = ({ mensaje = 'Cargando...' }: any) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600">{mensaje}</p>
    </div>
  );
};

// Estado Vacío
export const EstadoVacio = ({ mensaje, icono = '📭', accion }: any) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">{icono}</div>
      <p className="text-gray-600 text-lg mb-4">{mensaje}</p>
      {accion && accion}
    </div>
  );
};

// Estado de Error
export const EstadoError = ({ mensaje, onReintentar }: any) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl mb-4">⚠️</div>
      <p className="text-red-600 font-semibold mb-2">Error</p>
      <p className="text-gray-600 mb-4">{mensaje}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};
