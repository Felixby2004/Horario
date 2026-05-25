import React, { useState } from 'react';

interface Pestana {
  id: string;
  titulo: string;
  contenido: React.ReactNode;
}

interface PestanasProps {
  pestanas: Pestana[];
}

export const Pestanas: React.FC<PestanasProps> = ({ pestanas }) => {
  const [activa, setActiva] = useState(pestanas[0]?.id);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {pestanas.map((pestana) => (
            <button
              key={pestana.id}
              onClick={() => setActiva(pestana.id)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activa === pestana.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {pestana.titulo}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {pestanas.find(p => p.id === activa)?.contenido}
      </div>
    </div>
  );
};
