import React from 'react';

interface AvatarProps {
  nombre: string;
  tamaño?: 'sm' | 'md' | 'lg';
  imagen?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ nombre, tamaño = 'md', imagen }) => {
  const tamaños = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const iniciales = nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return imagen ? (
    <img
      src={imagen}
      alt={nombre}
      className={`${tamaños[tamaño]} rounded-full object-cover`}
    />
  ) : (
    <div className={`${tamaños[tamaño]} bg-primary-600 text-white rounded-full flex items-center justify-center font-bold`}>
      {iniciales}
    </div>
  );
};
