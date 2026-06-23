'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utilidades';

interface Opcion {
  valor: string | number;
  etiqueta: string;
  // Campos adicionales para búsqueda (ej: nombre, apellido, codigo)
  [key: string]: any;
}

interface SearchableSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
  opciones: Opcion[];
  onChange?: (valor: string | number) => void;
  placeholder?: string;
  camposBusqueda?: string[]; // Campos adicionales en los que buscar (ej: ['nombre', 'apellido'])
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  etiqueta,
  error,
  ayuda,
  opciones,
  onChange,
  placeholder = 'Busca aquí...',
  camposBusqueda = [],
  className,
  value,
  disabled,
  ...props
}) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState<Opcion[]>(opciones);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones cuando cambia la búsqueda
  useEffect(() => {
    const termino = busqueda.toLowerCase();
    
    const filtro = opciones.filter(opcion => {
      // Buscar en la etiqueta principal
      if (opcion.etiqueta.toLowerCase().includes(termino)) {
        return true;
      }
      
      // Buscar en campos adicionales especificados
      for (const campo of camposBusqueda) {
        const valor = opcion[campo];
        if (valor && String(valor).toLowerCase().includes(termino)) {
          return true;
        }
      }
      
      return false;
    });

    setFiltrados(filtro);
  }, [busqueda, opciones, camposBusqueda]);

  // Cerrar cuando se hace click fuera — solo cuando está abierto
  useEffect(() => {
    if (!abierto) return;

    const handleClickFuera = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // solo cerrar si actualmente está abierto
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto]);

  // Enfocar el input cuando se abre el select
  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  // Compare values by converting both to string to avoid number vs string issues
  const opcionSeleccionado = opciones.find(o => String(o.valor) === String(value));
  const labelSeleccionado = opcionSeleccionado?.etiqueta || '';

  const handleSeleccionar = (valor: string | number) => {
    onChange?.(valor);
    setAbierto(false);
    setBusqueda('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setAbierto(false);
      setBusqueda('');
    }
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      {etiqueta && (
        <label className="block text-sm font-medium text-gray-700">
          {etiqueta}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Botón que muestra el valor seleccionado */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2 border rounded-lg transition-all text-left flex justify-between items-center',
              'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50',
              error ? 'border-red-500' : 'border-gray-300',
              labelSeleccionado && !error ? 'border-primary-300 bg-primary-50' : '',
              className
            )}
          >
            <span className={labelSeleccionado ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              {labelSeleccionado || placeholder}
            </span>
            <svg
              className={cn(
                'w-5 h-5 transition-transform text-gray-500',
                abierto ? 'rotate-180' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* Dropdown con búsqueda */}
          {abierto && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Input de búsqueda */}
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Lista de opciones filtradas */}
              <ul className="max-h-60 overflow-y-auto">
                {filtrados.length > 0 ? (
                  filtrados.map((opcion) => (
                    <li key={opcion.valor}>
                      <button
                        type="button"
                        onClick={() => handleSeleccionar(opcion.valor)}
                        className={cn(
                          'w-full text-left px-4 py-3 transition-all flex items-center justify-between',
                          String(value) === String(opcion.valor) 
                            ? 'bg-primary-500 text-white font-bold hover:bg-primary-600' 
                            : 'hover:bg-primary-100 text-gray-800'
                        )}
                      >
                        <span>{opcion.etiqueta}</span>
                        {String(value) === String(opcion.valor) && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-gray-500 text-center bg-gray-50">
                    No hay resultados
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

      {ayuda && !error && (
        <p className="text-sm text-gray-500">{ayuda}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
