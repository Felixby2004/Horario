import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  texto: string;
  posicion?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  texto,
  posicion = 'top'
}) => {
  const [visible, setVisible] = useState(false);

  const posiciones = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div
          className={`absolute ${posiciones[posicion]} z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap`}
        >
          {texto}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};
