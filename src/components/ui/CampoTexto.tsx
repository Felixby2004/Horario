import React from 'react';
import { cn } from '@/lib/utilidades';

interface CampoTextoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
}

export const CampoTexto: React.FC<CampoTextoProps> = ({
  etiqueta,
  error,
  ayuda,
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
      <input
        className={cn(
          'w-full px-4 py-2 border rounded-lg transition-colors',
          'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {ayuda && !error && (
        <p className="text-sm text-gray-500">{ayuda}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
