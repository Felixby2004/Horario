import React from 'react';
import { cn } from '@/lib/utilidades';

interface ModalProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo?: string;
  children: React.ReactNode;
  tamaño?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  abierto,
  alCerrar,
  titulo,
  children,
  tamaño = 'md'
}) => {
  if (!abierto) return null;

  const tamañosClases = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={alCerrar}
        />
        <div
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full animate-slide-up',
            tamañosClases[tamaño]
          )}
        >
          {titulo && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
              <button
                onClick={alCerrar}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
