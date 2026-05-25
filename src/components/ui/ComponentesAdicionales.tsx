// Spinner de carga
export const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
);

// Botón con icono
interface BotonIconoProps {
  icono: React.ReactNode;
  onClick?: () => void;
  titulo?: string;
  variante?: 'primary' | 'secondary' | 'danger';
}

export const BotonIcono: React.FC<BotonIconoProps> = ({ icono, onClick, titulo, variante = 'primary' }) => {
  const estilos = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      title={titulo}
      className={`p-2 rounded-lg transition-colors ${estilos[variante]}`}
    >
      {icono}
    </button>
  );
};

// Acordeón
interface AcordeonProps {
  titulo: string;
  children: React.ReactNode;
  abiertoPorDefecto?: boolean;
}

export const Acordeon: React.FC<AcordeonProps> = ({ titulo, children, abiertoPorDefecto = false }) => {
  const [abierto, setAbierto] = React.useState(abiertoPorDefecto);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <span className="font-medium">{titulo}</span>
        <span className="transform transition-transform" style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </span>
      </button>
      {abierto && (
        <div className="px-4 py-3 border-t">
          {children}
        </div>
      )}
    </div>
  );
};

import React from 'react';
