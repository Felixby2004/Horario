import React from 'react';
import { cn } from '@/lib/utilidades';

interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger';
  tamaño?: 'sm' | 'md' | 'lg' | 'small';
  children: React.ReactNode;
}

export const Boton: React.FC<BotonProps> = ({
  variante = 'primary',
  tamaño = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const variantesEstilo = {
    primary: 'bg-primary-700 hover:bg-primary-800 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const tamañosEstilo = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const varianteNormalizada = variante === 'danger' ? 'error' : variante;
  const tamañoNormalizado = tamaño === 'small' ? 'sm' : tamaño;

  return (
    <button
      className={cn(
        'font-medium rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantesEstilo[varianteNormalizada],
        tamañosEstilo[tamañoNormalizado],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
