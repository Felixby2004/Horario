import React from 'react';
import { cn } from '@/lib/utilidades';

interface SelectorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
  opciones: Array<{ valor: string | number; etiqueta: string }>;
}

export const Selector: React.FC<SelectorProps> = ({
  etiqueta,
  error,
  ayuda,
  opciones,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {etiqueta && (
        <label className="block text-sm font-medium text-gray-700">
          {etiqueta}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-2 border rounded-lg transition-colors',
          'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      {ayuda && !error && (
        <p className="text-sm text-gray-500">{ayuda}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
