import React from 'react';
import { cn } from '@/lib/utilidades';

interface AlertaProps {
  tipo?: 'info' | 'success' | 'warning' | 'error';
  titulo?: string;
  children: React.ReactNode;
  cerrable?: boolean;
  alCerrar?: () => void;
}

export const Alerta: React.FC<AlertaProps> = ({
  tipo = 'info',
  titulo,
  children,
  cerrable = false,
  alCerrar
}) => {
  const estilos = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconos = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <div className={cn('border rounded-lg p-4', estilos[tipo])}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{iconos[tipo]}</span>
        <div className="flex-1">
          {titulo && <div className="font-semibold mb-1">{titulo}</div>}
          <div className="text-sm">{children}</div>
        </div>
        {cerrable && alCerrar && (
          <button
            onClick={alCerrar}
            className="ml-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
